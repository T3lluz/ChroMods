(function () {
  const HINT_KEY = "__chromodsDarkEnabled";
  const FALLBACK_CLASS = "darkreader darkreader--fallback";
  const WIPE_ATTR = "data-chromods-theme-wipe";
  const WIPE_STYLE_ID = "chromods-wipe-style";
  const WIPE_MS = 380;
  let wiping = false;

  function currentHost() {
    return chromodsDarkHostFromUrl(location.href);
  }

  function hasEngine() {
    return typeof DarkReader === "object" && DarkReader && typeof DarkReader.enable === "function";
  }

  function readHint() {
    try {
      return localStorage.getItem(HINT_KEY) === "1";
    } catch {
      return false;
    }
  }

  function writeHint(enabled) {
    try {
      if (enabled) localStorage.setItem(HINT_KEY, "1");
      else localStorage.removeItem(HINT_KEY);
    } catch {
      /* ignore quota / private-mode failures */
    }
    try {
      sessionStorage.setItem("__darkreader__wasEnabledForHost", enabled ? "true" : "false");
    } catch {
      /* ignore */
    }
  }

  function injectFallback() {
    if (document.querySelector(".darkreader--fallback")) return;
    const fallback = document.createElement("style");
    fallback.className = FALLBACK_CLASS;
    fallback.media = "screen";
    fallback.textContent = [
      "html, body, body :not(iframe) {",
      "    background-color: #181a1b !important;",
      "    border-color: #776e62 !important;",
      "    color: #e8e6e3 !important;",
      "}",
      "html, body {",
      "    opacity: 1 !important;",
      "    transition: none !important;",
      "}",
    ].join("\n");
    (document.head || document.documentElement).append(fallback);
  }

  function nativeSendMessage(payload, callback) {
    const send = globalThis.__chromodsSendMessage || chrome.runtime.sendMessage.bind(chrome.runtime);
    return send(payload, callback);
  }

  function proxyFetch(url) {
    return new Promise((resolve, reject) => {
      const fallback = () => fetch(url).then(resolve, reject);
      try {
        nativeSendMessage({ type: CHROMODS_DARK_FETCH, url: String(url) }, (result) => {
          if (chrome.runtime.lastError || !result?.ok) {
            fallback();
            return;
          }
          resolve(
            new Response(result.body ?? "", {
              status: result.status || 200,
              headers: result.headers || { "Content-Type": "text/css" },
            })
          );
        });
      } catch {
        fallback();
      }
    });
  }

  function setupFetchProxy() {
    if (!hasEngine() || typeof DarkReader.setFetchMethod !== "function") return;
    DarkReader.setFetchMethod(proxyFetch);
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function frames(count = 2) {
    return new Promise((resolve) => {
      const step = () => {
        count -= 1;
        if (count <= 0) resolve();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function wipeOrigin() {
    const inset = 20;
    const x = Math.max(0, window.innerWidth - inset);
    const y = inset;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    return { x, y, radius: Math.ceil(radius) + 4 };
  }

  function injectWipeStyle() {
    if (document.getElementById(WIPE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = WIPE_STYLE_ID;
    style.textContent = [
      "@property --chromods-wipe-r {",
      "  syntax: '<length>';",
      "  inherits: false;",
      "  initial-value: 0px;",
      "}",
    ].join("\n");
    (document.head || document.documentElement).append(style);
  }

  function wipeMask(reverse) {
    const hole = "transparent var(--chromods-wipe-r), #000 var(--chromods-wipe-r)";
    const disc = "#000 var(--chromods-wipe-r), transparent var(--chromods-wipe-r)";
    return `radial-gradient(circle at var(--chromods-wipe-x) var(--chromods-wipe-y), ${reverse ? disc : hole})`;
  }

  function makeShotOverlay(dataUrl, reverse) {
    document.querySelector(`[${WIPE_ATTR}]`)?.remove();
    injectWipeStyle();
    const { x, y, radius } = wipeOrigin();
    const overlay = document.createElement("div");
    overlay.setAttribute(WIPE_ATTR, "");
    const mask = wipeMask(reverse);
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483646",
      "pointer-events:none",
      "background-repeat:no-repeat",
      "background-position:0 0",
      "background-size:100% 100%",
      `--chromods-wipe-x:${x}px`,
      `--chromods-wipe-y:${y}px`,
      `--chromods-wipe-r:${reverse ? radius : 0}px`,
      `-webkit-mask-image:${mask}`,
      `mask-image:${mask}`,
    ].join(";");
    overlay.style.backgroundImage = `url("${dataUrl}")`;
    document.documentElement.append(overlay);
    return overlay;
  }

  async function wipeFromScreenshot(dataUrl, apply, reverse) {
    if (window !== window.top || prefersReducedMotion() || wiping || !dataUrl) {
      apply();
      return;
    }

    wiping = true;
    const overlay = makeShotOverlay(dataUrl, reverse);
    try {
      apply();
      await frames(2);
      const { radius } = wipeOrigin();
      const animation = overlay.animate(
        [
          { ["--chromods-wipe-r"]: reverse ? `${radius}px` : "0px" },
          { ["--chromods-wipe-r"]: reverse ? "0px" : `${radius}px` },
        ],
        {
          duration: WIPE_MS,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "forwards",
        }
      );
      await animation.finished.catch(() => {});
    } finally {
      overlay.remove();
      wiping = false;
    }
  }

  function applyDark(enabled) {
    if (!hasEngine()) return;
    writeHint(enabled);
    if (enabled) {
      injectFallback();
      DarkReader.enable(CHROMODS_DARK_THEME);
    } else {
      DarkReader.disable();
    }
  }

  async function syncFromStorage() {
    const host = currentHost();
    if (!host || !hasEngine()) return;
    const sites = await chromodsGetDarkSites();
    const enabled = chromodsIsDarkHostEnabled(sites, host);
    const currentlyOn = DarkReader.isEnabled();
    if (enabled === currentlyOn) {
      writeHint(enabled);
      return;
    }
    applyDark(enabled);
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;
    if (message.type === CHROMODS_DARK_PING) {
      sendResponse({
        ok: true,
        host: currentHost(),
        enabled: hasEngine() ? DarkReader.isEnabled() : false,
      });
      return;
    }
    if (message.type === CHROMODS_DARK_WIPE) {
      const enabled = Boolean(message.enabled);
      const screenshot = typeof message.screenshot === "string" ? message.screenshot : "";
      wipeFromScreenshot(screenshot, () => applyDark(enabled), enabled);
      sendResponse({ ok: true });
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[CHROMODS_DARK_STORAGE_KEY]) return;
    if (wiping) return;
    syncFromStorage();
  });

  if (readHint()) injectFallback();
  setupFetchProxy();
  syncFromStorage();
})();
