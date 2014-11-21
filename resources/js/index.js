$(document).ready(function(){
    chrome.browserAction.onClicked.addListener(function(tab) {
        //delay to let background page finish
        setTimeout(function() {
            location.reload();
        }, 10);
    });

    saveit.ini();
});

var saveit = {
    ini : function() {
        var tabs = JSON.parse(localStorage.tabs);

        //sort array by date
        tabs.sort(function(a, b){
            soryBy = "date"; //json element to sort by
            if(a[soryBy] < b[soryBy]) return 1;
            if(a[soryBy] > b[soryBy]) return -1;
            return 0;
        });

        $.each(tabs, function(key,val){
            val.date = new Date(val.date);
            var date = val.date.getDate() + "/" + val.date.getUTCMonth() + "/" + val.date.getFullYear();
            if($(".title").length == 0 || date != $(".title").last().attr("date")){
                $('<h1 class="title" date="' + date + '">' + date + '</h1>').appendTo("#content");
            }


            $(saveit.tab.create(val)).appendTo("#content").click(function(){
                $(this).remove();
                localStorage.tabs = JSON.stringify(jQuery.grep(JSON.parse(localStorage.tabs), function(x){
                    return !(x.id == val.id && x.time == val.time);
                }));
            });
        });
    },

    tab : {
        create : function(tab){
            return '<div class="tab-container"><img class="favicon" src="' + tab.favIconUrl + '"><div class="url">"' + tab.title + '"</div><div class="right"><div class="remove" >x</div></div></div>';
        }
    }
}
