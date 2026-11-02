/* ============================================================
   main.js — start-up, error safety net
   ============================================================ */
(function () {
  let booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    try {
      if (window.FO && FO.ui && FO.ui.boot) FO.ui.boot();
    } catch (err) {
      report(err);
    }
  }

  function report(err) {
    const message = err && err.message ? err.message : String(err || 'unknown error');
    if (window.console && console.error) console.error(err);
    try {
      if (window.FO && FO.ui && FO.ui.showError) FO.ui.showError(message);
    } catch (e) { /* the banner itself failed — stay silent */ }
  }

  window.addEventListener('error', function (event) {
    report(event.error || event.message);
  });

  window.addEventListener('unhandledrejection', function (event) {
    report(event.reason);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.FO = window.FO || {};
  FO.main = { boot: boot };
})();
