$(document).ready(function(){
    reloadOldUrls(function() {
        updateUrls();
    });

    chrome.browserAction.onClicked.addListener(function(tab) {
        //delay to let background page finish
        setTimeout(function() {
            reloadOldUrls();
        }, 100);
    });
});

function reloadOldUrls(callback, variable) {
    $("#content").children().remove(); //removes current tab items
    var tabs = localStorage.savedTabs.split('^'); //get array of new tabs
    var starredTabs = new Array;
    var numberOfTabs = tabs.length; //set number of tabs

    tabs.splice(tabs.length - 1, tabs.length); //remove trailing item

    //parse tabs as array of objects
    for (var i = 0; i < tabs.length; i++){
        tabs[i] = jQuery.parseJSON(tabs[i]);

        if(tabs[i].starred == true){
            starredTabs.push(tabs[i]);
        }
    }

    //sort array by date
    tabs.sort(function(a, b){
        a.url = a.url.replace("http://", ""); //remove http:// prefix
        a.url = a.url.replace("https://", ""); //remove https:// prefix
        a.url = a.url.replace("www.", ""); //remove www. prefix

        soryBy = "date"; //json element to sort by

        if(a[soryBy] < b[soryBy]) return -1;
        if(a[soryBy] > b[soryBy]) return 1;
        return 0;
    });

    //sort array by date
    starredTabs.sort(function(a, b){
        a.url = a.url.replace("http://", ""); //remove http:// prefix
        a.url = a.url.replace("https://", ""); //remove https:// prefix
        a.url = a.url.replace("www.", ""); //remove www. prefix

        soryBy = "date"; //json element to sort by

        if(a[soryBy] < b[soryBy]) return -1;
        if(a[soryBy] > b[soryBy]) return 1;
        return 0;
    });

    //repeat for number of tabs
    for (var i = 0; i < tabs.length; i++){
        var tab = tabs[tabs.length - (i + 1)]; //get html tab element

        if(tab.starred == false){
            var dateContainer = $("nav > .title > h1")[$("nav > .title > h1").length - 1];

            var date = new Date(tab.date)
            date = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();

            var nav = "";

            if($(dateContainer).text() != date){
                nav = $("<nav><div class='title'><h1>" + date + "</h1><h2>restore session</h2></div></nav>").appendTo("#content");

                $(nav).children(".title").children("h2").click(function() {
                    var tabs = $(this).parent().parent().children(".tab-container").children(".url");

                    for(var i = 0; i < tabs.length; i++){
                        var element = $(tabs)[i];
                        var tab = jQuery.parseJSON($(element).parent().attr("json"));

                        restore(element, tab, function(i) {
                            if(i == tabs.length - 1){
                                updateUrls();
                            }
                        }, i);
                    }
                });
            }

            else{
                nav = $("#content > nav")[$("nav > .title > h1").length - 1];
            }

            if(tab.favIconUrl != undefined){
                var favicon = tab.favIconUrl;
            } else{
                var favicon = tab.url.replace(/\.com.+/i,".com/favicon.ico");
            }

            var url = tab.url;
            var title = tab.title.replace(/ is not available/,"");

            var tabContainer = $("<div json='" + JSON.stringify(tab) + "' class=\"tab-container\"><img class=\"favicon\" src=\"" + favicon + "\"><div class=\"url\">" + title + "</div><div class='right'><div class='star'>&#9734;</div><div class=\"remove\" >x</div></div></div>").appendTo(nav);

            $(tabContainer).on("click", ".remove", function() {
                var tab = jQuery.parseJSON($(this).parent().parent().attr("json"));
                remove(this, tab, function() {
                    updateUrls();
                });
            });

            $(tabContainer).on("click", ".url", function() {
                var tab = jQuery.parseJSON($(this).parent().attr("json"));
                restore(this, tab, function() {
                    updateUrls();
                });
            });

            $(tabContainer).on("click", ".star", function() {
                var tab = jQuery.parseJSON($(this).parent().parent().attr("json"));
                star(this, tab, function() {
                    updateUrls();
                });
            });
        }
    }

    if(starredTabs.length > 0){
        var starredTabsContainer = $("<nav id='starred-tabs'><div class='title'><h1>Starred Tabs</h1><h2>restore starred</h2></div></nav>").prependTo("#content");

        for(i= 0; i < starredTabs.length; i++){
            var tab = starredTabs[starredTabs.length - (i + 1)]; //get html tab element

            if(tab.favIconUrl != undefined){
                var favicon = tab.favIconUrl;
            } else{
                var favicon = tab.url.replace(/\.com.+/i,".com/favicon.ico");
            }

            var url = tab.url;
            var title = tab.title.replace(/ is not available/,"");

            var tabContainer = $("<div json='" + JSON.stringify(tab) + "' class=\"tab-container\"><img class=\"favicon\" src=\"" + favicon + "\"><div class=\"url\">" + title + "</div><div class='right'><div class='star'>&#9733;</div><div class=\"remove\" >x</div></div></div>").appendTo("#starred-tabs");

            $(tabContainer).unbind().on("click", ".remove", function() {
                var tab = jQuery.parseJSON($(this).parent().parent().attr("json"));
                remove(this, tab, function() {
                    updateUrls();
                });
            });

            $(tabContainer).unbind().on("click", ".url", function() {
                var tab = jQuery.parseJSON($(this).parent().parent().attr("json"));
                restore(this, tab, function() {
                    updateUrls();
                });
            });

            $(tabContainer).unbind().on("click", ".star", function() {
                var tab = jQuery.parseJSON($(this).parent().parent().attr("json"));
                unstar(this, tab, function() {
                    updateUrls();
                });
            });
        }
    }

    //check if callback function is defined
    if(callback != undefined){
        callback(); //call callback function
    }
    return; //return undefined
}

function updateUrls() {
    localStorage.savedTabs = ""; //clear local storage

    //repeat for number of tab element
    for(var i = 0; i < $(".tab-container").length; i++){
        var tab = $(".tab-container")[$(".tab-container").length - (i + 1)]; //get html tab element
        var json = jQuery.parseJSON($(tab).attr("json"));

        json.date = new Date(json.date); //fix date errors

        localStorage.savedTabs = JSON.stringify(json)  + "^" + localStorage.savedTabs; //write to localstorage.savedTabs
    }

    reloadOldUrls(); //reload saved tabs
    return; //return undefined
}

function remove(element, tab, callback) {
    $(element).parent().parent().slideUp(200, "linear", function() {
        $(this).remove();//remove element clicked on

        //check if callback function is defined
        if(callback != undefined){
            callback(); //call callback function
        }
        return; //return undefined
    });
}

function restore(element, tab, callback, count) {
    $(element).parent().slideUp(200, "linear", function() {
        var tab = jQuery.parseJSON($(this).attr("json")); //get needed json for tab

        //add http:// if needed
        if(tab.url.indexOf("http") == -1){
            tab.url = "http://" + tab.url
        }

        //create tab from url clicked on
        chrome.tabs.create({
            url: tab.url,
            pinned: tab.pinned
        });

        $(this).remove(); //remove element clicked on

        //check if callback function is defined
        if(callback != undefined){
            callback(count); //call callback function
        }
        return; //return undefined
    });
}

function star(element, tab, callback, count) {
    tab.starred = true;

    $(element).parent().parent().attr("json", JSON.stringify(tab));

    //check if callback function is defined
    if(callback != undefined){
        callback(count); //call callback function
    }
    return; //return undefined
}

function unstar(element, tab, callback, count) {
    tab.starred = false;

    $(element).parent().parent().attr("json", JSON.stringify(tab));

    //check if callback function is defined
    if(callback != undefined){
        callback(count); //call callback function
    }
    return; //return undefined
}
