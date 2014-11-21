if(localStorage.tabs == undefined){
    localStorage.tabs = JSON.stringify(new Array);
}

$(document).ready(function(){
    openIndex();
    chrome.browserAction.onClicked.addListener(function(tab) {
        tab.starred = false;
        tab.time = new Date().getTime();
        tab.date = new Date();
        var savedTabs = JSON.parse(localStorage.tabs);
        savedTabs.push(tab);
        localStorage.tabs = JSON.stringify(savedTabs);
    });
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
