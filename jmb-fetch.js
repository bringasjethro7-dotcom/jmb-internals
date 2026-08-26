/* ══════════════════════════════════════════════════════════════════════════════
   JMB SHARED FETCH LAYER  ·  jmb-fetch.js
   ──────────────────────────────────────────────────────────────────────────────
   WHY THIS EXISTS (Aug 27, 2026)

   Every tool had its own copy of fetch/retry logic. That is how the same bug —
   a 10-second abort with two retries — ended up in six files at once, turning
   one slow request into three and amplifying the very congestion it suffered
   from. On Aug 27 the tools were collectively firing ~170 requests a minute at
   an Apps Script deployment that can only run ~30 executions at a time. Nothing
   was broken; the queue simply never drained.

   Apps Script's concurrency limit is a hard ceiling we do not control. So the
   only lever left is SENDING FEWER REQUESTS without making the tools feel slower.
   This file is that lever, in one place, for every tool.

   WHAT IT DOES
     1. IN-FLIGHT DEDUPE   two callers asking for the same URL at the same moment
                           share one request instead of making two.
     2. TTL CACHE          a repeated read inside its freshness window is served
                           from memory. Nothing hits the network.
     3. CROSS-TAB SHARING  a VA with three tabs open makes ONE request, not three.
                           Results are broadcast to the other tabs.
     4. JITTER             polls are spread randomly instead of landing on the
                           same second. 25 VAs on a 60s timer used to arrive in a
                           thundering herd; now they arrive spread out.
     5. HIDDEN-TAB PAUSE   a background tab stops polling entirely.
     6. HONEST BACKOFF     failures back off progressively instead of hammering,
                           and ONE retry — never three.
     7. SINGLE PLACE       when the next bug appears, it gets fixed once.

   USAGE
     <script src="jmb-fetch.js"></script>

     JF.get(url)                  → Promise of parsed JSON (deduped + cached)
     JF.get(url, {ttl:15000})     → cache this response for 15s
     JF.get(url, {fresh:true})    → bypass cache (use after a write)
     JF.post(url, bodyObject)     → POST, never cached, never deduped
     JF.poll(fn, ms, {name:'x'})  → jittered, visibility-aware repeating call
     JF.bust('action=pa_list')    → drop cached entries matching a substring
     JF.stats()                   → {sent, served, deduped, saved} for debugging

   RULE OF THUMB
     Reads → JF.get.  Writes → JF.post, then JF.bust(...) the reads it affects.
   ══════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DEFAULT_TTL   = 12000;   // ms a GET stays fresh in memory
  var TIMEOUT_MS    = 28000;   // Apps Script is often slow but not dead — see note below
  var RETRIES       = 1;       // one retry. Never three. See the history above.
  var BACKOFF_MS    = 1500;

  var mem   = {};              // url -> {t, data}
  var live  = {};              // url -> Promise   (in-flight dedupe)
  var stats = { sent: 0, served: 0, deduped: 0, cached: 0, failed: 0 };

  /* Cross-tab channel: one tab's fetch result serves every other tab of the same
     VA. Most VAs keep the board open in more than one tab, so this is a real cut. */
  var chan = null;
  try {
    if (global.BroadcastChannel) {
      chan = new global.BroadcastChannel('jmb-fetch');
      chan.onmessage = function (e) {
        var m = e.data;
        if (m && m.url && m.data !== undefined) mem[m.url] = { t: m.t, data: m.data };
      };
    }
  } catch (e) { chan = null; }

  function fresh(url, ttl) {
    var c = mem[url];
    return (c && (Date.now() - c.t) < ttl) ? c : null;
  }

  function share(url, data) {
    var t = Date.now();
    mem[url] = { t: t, data: data };
    if (chan) { try { chan.postMessage({ url: url, data: data, t: t }); } catch (e) {} }
  }

  function once(url, opts) {
    opts = opts || {};
    var ttl = (opts.ttl === undefined) ? DEFAULT_TTL : opts.ttl;

    if (!opts.fresh && ttl > 0) {
      var hit = fresh(url, ttl);
      if (hit) { stats.cached++; stats.served++; return Promise.resolve(hit.data); }
    }
    /* Someone is already asking for exactly this. Wait for THEIR answer rather
       than adding a second execution to a queue that is already the problem. */
    if (live[url]) { stats.deduped++; stats.served++; return live[url]; }

    var attempt = function (n) {
      stats.sent++;
      var ctl = (global.AbortController) ? new global.AbortController() : null;
      var timer = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, TIMEOUT_MS) : null;
      return fetch(url, ctl ? { signal: ctl.signal } : undefined)
        .then(function (r) {
          if (timer) clearTimeout(timer);
          return r.text().then(function (txt) {
            /* Apps Script answers a slow/overloaded request with an HTML error page.
               Treat that as a failure with a clear message instead of letting
               JSON.parse throw something meaningless at the caller. */
            if (txt.trim().charAt(0) === '<') {
              var err = new Error('SERVER_BUSY');
              err.serverBusy = true;
              throw err;
            }
            return JSON.parse(txt);
          });
        })
        .catch(function (e) {
          if (timer) clearTimeout(timer);
          if (n < RETRIES) {
            return new Promise(function (res) { setTimeout(res, BACKOFF_MS * (n + 1)); })
              .then(function () { return attempt(n + 1); });
          }
          stats.failed++;
          throw e;
        });
    };

    var p = attempt(0)
      .then(function (data) { if (ttl > 0) share(url, data); return data; })
      .finally(function () { delete live[url]; });

    live[url] = p;
    return p;
  }

  var JF = {
    get: function (url, opts) { return once(url, opts); },

    post: function (url, body, opts) {
      opts = opts || {};
      stats.sent++;
      var ctl = (global.AbortController) ? new global.AbortController() : null;
      var timer = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, opts.timeout || TIMEOUT_MS) : null;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: (typeof body === 'string') ? body : JSON.stringify(body),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) {
        if (timer) clearTimeout(timer);
        return r.text().then(function (t) {
          if (t.trim().charAt(0) === '<') { var e = new Error('SERVER_BUSY'); e.serverBusy = true; throw e; }
          return JSON.parse(t);
        });
      }).catch(function (e) { if (timer) clearTimeout(timer); stats.failed++; throw e; });
    },

    /* Drop cached reads a write just invalidated: JF.bust('action=pa_list') */
    bust: function (match) {
      Object.keys(mem).forEach(function (u) { if (!match || u.indexOf(match) >= 0) delete mem[u]; });
    },

    /* Jittered, visibility-aware polling.
       Two things matter here. JITTER: without it, 25 VAs on a 60-second timer all
       arrive within the same second and Apps Script sees a spike it cannot serve —
       the average rate is fine, the burst is what kills it. HIDDEN: a tab nobody is
       looking at should cost nothing. */
    poll: function (fn, everyMs, opts) {
      opts = opts || {};
      var spread = (opts.jitter === undefined) ? 0.25 : opts.jitter;  // ±25%
      var stopped = false, timer = null, running = false;
      function next() {
        if (stopped) return;
        var wobble = everyMs * spread * (Math.random() * 2 - 1);
        timer = setTimeout(tick, Math.max(1000, everyMs + wobble));
      }
      function tick() {
        if (stopped) return;
        if (global.document && global.document.hidden) return next();   // nobody is looking
        if (running) return next();                                     // never overlap
        running = true;
        Promise.resolve()
          .then(fn)
          .catch(function () {})
          .finally(function () { running = false; next(); });
      }
      next();
      return { stop: function () { stopped = true; if (timer) clearTimeout(timer); } };
    },

    stats: function () {
      var saved = stats.cached + stats.deduped;
      return {
        sent: stats.sent, served: stats.served, cached: stats.cached,
        deduped: stats.deduped, failed: stats.failed,
        requests_avoided: saved,
        saved_pct: (stats.sent + saved) ? Math.round(saved / (stats.sent + saved) * 100) : 0
      };
    }
  };

  global.JF = JF;
})(window);
