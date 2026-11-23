/**
 * Fleet-Wide Web Diagnostics & Telemetry (PNSJY Fleet Standard)
 *
 * Captures uncaught browser errors, unhandled promise rejections, and custom diagnostic
 * events and ships them to the centralized PNSJY Fleet Manager (https://fleet.pnsjy.in).
 */
(function (global) {
  'use strict';

  var RELAY_URL = 'https://fleet.pnsjy.in/api/v1/logs';
  var recentFingerprints = {};
  var queue = [];
  var flushTimer = null;

  function getFingerprint(tag, msg) {
    return (tag || '') + '::' + (msg || '').slice(0, 100);
  }

  function sendLogs(logs) {
    if (!logs || logs.length === 0) return;
    var payload = JSON.stringify(logs);

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        var ok = navigator.sendBeacon(RELAY_URL, blob);
        if (ok) return;
      }
    } catch (_) {}

    try {
      fetch(RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function () {});
    } catch (_) {}
  }

  function flush() {
    if (queue.length === 0) return;
    var toSend = queue.slice(0, 20);
    queue = queue.slice(20);
    sendLogs(toSend);
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush();
    }, 1000);
  }

  var PnsjyTelemetry = {
    init: function (appId) {
      this.appId = appId || 'pnsjy-store';

      if (typeof window === 'undefined') return;

      var self = this;

      window.addEventListener('error', function (event) {
        var msg = event.message || (event.error && event.error.message) || 'Script error';
        var file = event.filename ? event.filename.split('/').pop() : 'inline';
        var line = event.lineno || 0;
        self.log(self.appId, 'WindowError', msg + ' (' + file + ':' + line + ')', 'ERROR', {
          stack: event.error && event.error.stack ? event.error.stack.slice(0, 500) : null,
          url: window.location.href
        });
      });

      window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        var msg = typeof reason === 'string' ? reason : (reason && reason.message ? reason.message : 'Unhandled Promise Rejection');
        self.log(self.appId, 'UnhandledRejection', msg, 'ERROR', {
          stack: reason && reason.stack ? reason.stack.slice(0, 500) : null,
          url: window.location.href
        });
      });
    },

    log: function (appId, tag, message, level, metadata) {
      var id = appId || this.appId || 'pnsjy-store';
      var lvl = (level || 'INFO').toUpperCase();
      var fp = getFingerprint(tag, message);
      var now = Date.now();

      if (recentFingerprints[fp] && (now - recentFingerprints[fp] < 15000)) {
        return;
      }
      recentFingerprints[fp] = now;

      queue.push({
        app_id: id,
        tag: tag || 'StoreWeb',
        level: lvl,
        message: String(message).slice(0, 500),
        platform: 'web',
        metadata: metadata || null,
        timestamp: new Date().toISOString()
      });

      scheduleFlush();
    }
  };

  global.PnsjyTelemetry = PnsjyTelemetry;
})(typeof window !== 'undefined' ? window : this);
