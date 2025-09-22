chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'main.html' });
});
