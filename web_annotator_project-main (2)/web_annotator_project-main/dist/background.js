chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      chrome.scripting
        .executeScript({
          target: { tabId },
          files: ["./contentScript.js"]
        })
        .then(() => {
          console.log("we have injected the content script");
        })
        .catch((err) => console.log(err, "error in background script line 10"));
    }
  });
  
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (activeInfo.tabId) {
      chrome.tabs.sendMessage(activeInfo.tabId, {action:"URL", msg: activeInfo },function (response) {
        if (!chrome.runtime.lastError) {
          console.log(response);
        } else {
          console.log(chrome.runtime.lastError, "error line 14");
        }
      });
    }
  });
  