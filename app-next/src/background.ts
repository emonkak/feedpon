chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'app.html' });
});
