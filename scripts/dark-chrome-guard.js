if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
  globalThis.__chromodsSendMessage = chrome.runtime.sendMessage.bind(chrome.runtime);
}
