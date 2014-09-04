if(localStorage.savedTabs == undefined){
    localStorage.savedTabs = "";
}

$(document).ready(function(){
    openIndex();

    chrome.browserAction.onClicked.addListener(function(tab) {
        saveIt(tab);
    });

    //----------------------------------------->

    function saveIt(tab) {
        tabUrl = tab.url;
        tab.starred = false;

        if(tabUrl.indexOf("http") != -1){
            tab.date = new Date();

            localStorage.savedTabs = JSON.stringify(tab) + "^" + localStorage.savedTabs;

            chrome.tabs.remove(tab.id);
        }

        else{
            var notification = webkitNotifications.createNotification(
                '../resources/icon/error.png',  // icon url - can be relative
                'Error',  // notification title
                'This URL is not supported'  // notification body text
            );

            notification.show();
        }
    }
});

function openIndex() {
    source = "../index.html";
    chrome.tabs.query({}, function(tabs) {
        var Open = true;
        for(i = 0; i < tabs.length; i++){
            Open = Open && (tabs[i].url.indexOf(chrome.extension.getURL("")) == -1);
        }
        if(Open == true && tabs.length > 0){
            chrome.tabs.create({
                url : source,
                pinned : true,
                active : false,
                index : 0
            });
        }
    });

    setTimeout(function() {
        openIndex();
    }, 1000);
}
