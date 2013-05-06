/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var jQuery = jQuery || {}, $ = $ || jQuery;
var app = app || {};
app = $.extend(true, {}, app, {
    // Public Properties
    inited: false,
    deviceReadyDeferred: app.deviceReadyDeferred || null,
    jqmReadyDeferred: app.jqmReadyDeferred || null,
    searchResultsURI: "http://www.petango.com/webservices/wsadoption.asmx/AdoptableSearch",
    searchDetailsURI: "http://www.petango.com/webservices/wsadoption.asmx/AdoptableDetails",
    PetPointAuthKey: "23lomcf2c0qa811xz4iy0qbpj9uq0w65n4ch964i141640p811",
    promise: {
        search: null,
        searchLoad: [],
        detail: null,
        detailLoad: []
    },
    searchResults: [],
    searchResultsRaw: null,
    searchOffset: 0,
    searchPerPage: 10,
    searchDefaults: {
        authkey:        "23lomcf2c0qa811xz4iy0qbpj9uq0w65n4ch964i141640p811",
        stageId:        "",
        speciesID:      "0",    //0=All,1=Dog,2=Cat,3=Rabbit,4=Horse,5=Small&Furry,6=Pig,7=Reptile,8=Bird,9=Barnyard,1003=Other than Dog and Cat
        sex:            "A",    // A=All M=Male F=Female
        ageGroup:       "All",  //All=All,OverYear=Over 1 year old,UnderYear=Under 1 year old
        location:       "",
        site:           "",     // 859",
        onHold:         "N",    // Y=Yes N=No A=Either
        orderBy:        "",     // ‘’ Empty String,‘ID’,‘Name’,‘Breed’,‘Sex’
        primaryBreed:   "All",  // All or empty=All breeds or breed ID, (for example ‘5’=Terrier)
        secondaryBreed: "",     // All or empty=All breeds or breed ID (for example ‘7’=Shepherd)
        specialNeeds:   "A",    // Y=Yes, N=No, A=Either
        noDogs:         "A",
        noCats:         "A",
        noKids:         "A"
    },
    petDetails: null,
    // database global
    db: null,
    lastFavorites: {},
    ignoreReferrer: {
        "#detailed-result": "#favorites-list",
        /*"#favorites-list":  "#detailed-result",*/
        "#more":            "#detailed-result",
        "#info":            "#detailed-result",
        "#donate":          "#detailed-result"
    },
    photoDotSrc:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJl"+
        "YWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5"+
        "UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExID"+
        "Y2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xO"+
        "Tk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRv"+
        "YmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA"+
        "6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNi"+
        "AoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDRTNGOUY3RkE1MDMxMUUyQjQ5Q0FDQzIwRDE1QkYzNyIgeG1wTU06R"+
        "G9jdW1lbnRJRD0ieG1wLmRpZDpDRTNGOUY4MEE1MDMxMUUyQjQ5Q0FDQzIwRDE1QkYzNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjpp"+
        "bnN0YW5jZUlEPSJ4bXAuaWlkOkNFM0Y5RjdEQTUwMzExRTJCNDlDQUNDMjBEMTVCRjM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkN"+
        "FM0Y5RjdFQTUwMzExRTJCNDlDQUNDMjBEMTVCRjM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3"+
        "hwYWNrZXQgZW5kPSJyIj8+v8nIXQAAB+JJREFUeNrEV4l22zYW5QIQ4CZKsmzHSaf5/6+aOZ2m8SZZXEEQANn7QNnTpGmbmTlzxj6IGBnEv"+
        "W+77yFcliX4f/6w79nknEt0q8tx0JkZXGqsFbNd2GLnKPSnRC5mkeUJ01zEo6xEm6RJH8ex+a8IzPPMVa223YvaD+dxPw2m1KPJ7GSkc0sy"+
        "2yAKwCCKA8fiaGKSjyLlPVYjStFsDvlTVslTEITLv01g0rqoP3d33UkdVKurvhm3Y6c3ExHQRtppTuZl8R6I4tDFPJ4SyRRZLrKkzwp51p0"+
        "uy0Nebm6Ke8bZ+N0Ehm7c1p/qH5rn4bZ7GQ59o3ZEgpbup9JqK61xfJ6XmPbHEQgkRADWZ3wQedKOVXbS45RPyuZmNHL3YfNzIkX3lwSGTm"+
        "+P/zx/bB/7d82xu22Pw01fD3tVj7uh0Vvd62IabeaMS2Y3ewLRa/wlVyLnbVrKWg8G+6bMgKyzM1vcEu1+rH4SX5H4gsA0mZwsbx+7d/VT9"+
        "7557t41z/1Ndxqu+xd1pdpxqxAGeKI0CAMI+Pe9+wUfZSE6rDqvptOkzApuZo5CC/G7BHE4X3/c/z1msf4dgWVeWP25AWh/2xyxAH5+6O7a"+
        "J5A4gsTLcN0eu+uhGSscmgRL+IXnQvyXJdGYVmmtD0UBgintW2Z4CeARwsRZbETWDru76qcgCL8kMCDO3fNw6M7DoYXFZHlD4I/d3fmpfX9"+
        "+aO6m3qRRzIKES7idBVG4HjIvc+CsDSg564dW6mHKkSdidpQjC5I0MixhE4eXuIyHtJKNzOT5jQBcyeHmveqmChZu+7M6dMfhuoPlBH76dP"+
        "6b0TOXaRokQgao7yCMUIFhtHoPBGbnAidsMI06QL4Uizt/JLcA3DEkKPJjTFCiMku67lldiR9lA/prDMdebwC6J3DEuVJw81CrfYsKqB+a9"+
        "wSe5VnAAc4Y9ysiAqsMUfggVtYvAHpyYzfI80P9PhFsBc6TRpWiHsqxxtnbjSoyfN95AlSv02Bz1XnwHdYW1VC1x/567I1cLRcB50nALst7"+
        "wYcghGA5D26t8dkWyMB7RDW6hBFXEsCqFWdfxsNUoELysR83ngBKJBk71CsExow2xR+zEbVOXiAyBETgMVuBebISiS9eQIg9AQ9+CQkUNED"+
        "N++/687ArdtlG9yhLVIavDmWzaZgyvBwxME2MdtJMVmBJ1HhqsAmqV1IJMS4CSjyGpGOce/BXElHsc2x1ffQvcMZXjxBJJGamFQxEVdjREg"+
        "5EDFjjjM+FMWcskSBPcEfqBoGByoGUTalRomb94VFEn8wf6klQPsTcg1ozUSYEDp6ILRoD7QU58h60JYQSpiRcFt4mDFJRO1k+Lw4E5jlCV"+
        "4sXvItkiqDvMUksKiNa6zvycaV4o5ZReisZApdp7oEVqiCya2X45Az9G36/9wrOR/OCGs6E4RdKNyJ5YHh/8SoSkL0hnbf4f7/6Wd4+11//"+
        "BGB6bbmsy9dfvkFfe0KE8yZbr4+IAYtn0nLqaOuiZ+rvsfUgcOsKMPv4+oUMN3A7PfsQINnI/fT97PfP/h140dvEWGRoXoB3DDBsyEI8x9g"+
        "YzixOmAUBw6Dn1NHYuqh2FdU5Kdx8OdzXOsAMLCKANQlJA9YqcM5c9GAlYr0uhA5nDThT+/M5M5zHhnDimFkGVpr6OIdgoKNBKqmn8yEtRM"+
        "NErMxgUi6NTy64xseXQkAA4Wvmw1ICJ69Yu+oBMt2TzyrR0XxAnZJwmMDi6JxprJAAIACXi0L0F2BSrC7FNJNu5LnYZqfTUH+YlEbPh7W+z"+
        "pdV+RCh8NILltdeQAskyEt6HAPil++yU4b2jHPbBETIuCRlvcjlQJOSV0K00IY20EZVpS9po6u01NvyKn+CTJf9y7gJIbHCy+7sXewJRWu6"+
        "vvYCewnRqJQngknoCBE6kjF+QRHTXDQ0M2Boad6aEYEX++yk2qlK0QvQrc55r49Uv2ZygspItSonECHRjBxbhefNA2tIoCnecgpBvs/q7e3"+
        "mU7nLnvJtesRs+HIhcYZXXhBu9Zt2HM75VXqkjpht0hfIZQ4hEtTPqaVS2NGO3w81OmVrvCoigd6a0Uwhsa/NKJir6/wE8F82h+IeXnwsrk"+
        "Binz0XVeaJ4Pn4u4FEZqIub/MHOzpMMTZx1nESDAJHCRkkqaI5YTgPW/SMzBjNluAyVvjJODJZKfq8ys7lHqAApBBiKL0HkYdylz8VW3msb"+
        "osHTE/9N0aycNleV/eOCGA+gFWRn2RIE6g6kDwyF62+ygvKC5Cgff59xkEQWU69XmSiy7fylMHtRILAN4fyfnOVPW5ui/sCpP5wJkTNTtWH"+
        "4mc7+2FzBWeoW8lQlkmrWonRfCqoT6DMknXiQb9Yhw5NJDEVd2i/DcWdEhCWP5YIwQ75sL3dfoIGuj+dihMuhqsfqn9w3Gpi7l0/UpKqzXi"+
        "mYYWmXRrL3eS4oxB54tHrWD4k2Tr1UKxRxscCRGD55wo5EbNw+hov/KO7IazjzXN7gznxZqA7QaMwEU8bQ3PDRNMuOicuJt5zGDi9wolVSy"+
        "A8HQlZsUufyxvKh+KJxq9v4YR/dTmd1FTQuIaxfI85YaNHm/uLCfIEs35MnQsXkxl6r0nlhMTNKGe13Mga5Xaky8qfnR9+7+2YJiaMVNIqI"+
        "wxViHYRvPR6OZ0jEbsEYzeT8SSrdEiSb1/F/mMC/6ufXwUYAMAakQh6zjOfAAAAAElFTkSuQmCC",
    photoDotSrcS:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlY"+
        "WR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5U"+
        "Y3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY"+
        "2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOT"+
        "k5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvY"+
        "mUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6"+
        "Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiA"+
        "oTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDRTNGOUY4M0E1MDMxMUUyQjQ5Q0FDQzIwRDE1QkYzNyIgeG1wTU06RG"+
        "9jdW1lbnRJRD0ieG1wLmRpZDpDRTNGOUY4NEE1MDMxMUUyQjQ5Q0FDQzIwRDE1QkYzNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppb"+
        "nN0YW5jZUlEPSJ4bXAuaWlkOkNFM0Y5RjgxQTUwMzExRTJCNDlDQUNDMjBEMTVCRjM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkNF"+
        "M0Y5RjgyQTUwMzExRTJCNDlDQUNDMjBEMTVCRjM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3h"+
        "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"+
        "JMABsmn5SRpkWAAAAAABJRU5ErkJggg==",
    setReady:function() {
        console.log("deviceReadyEventHandler");
        app.deviceReadyDeferred.resolve();
    },
    // Application Constructor
    initialize: function() {
        (function($) {
            $.when(app.deviceReadyDeferred, app.jqmReadyDeferred).then(app.onDeviceReady);
        })(jQuery);
        this.bindDeviceReady();
    },
    bindDeviceReady: function() {
        document.addEventListener("deviceReady", app.setReady, false);
        if(typeof(window.top.ripple)=="function") app.setReady();
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        // console.log({"app.onDeviceReady": this});
        // $.mobile.loading("hide");
        /**
         * Specify code to only be run once
         */
        if(app.inited) return false;

        //console.log(app.jqmReadyDeferred.state(), typeof($.mobile), $.mobile, $.mobile.loader);
        /*$.mobile.loadingBak = $.mobile.loading;

        $.mobile.loading = function(showHide, opts) {
            $.mobile.loadingBak.apply(this, arguments);
            console.log("loading fired on " + $.mobile.activePage.attr('id') + " with args: [" + arguments.join(", ") + "]");
        }*/

        // Bind Facebook init
        try {window.fbAsyncInit = app.initFacebook;} catch(ex) {console.log(ex.toString());}
        try {app.initModules();} catch(ex) {console.log(ex.toString());}
        try {app.bindEvents();} catch(ex) {console.log(ex.toString());}
        try {app.resetSearchStart();} catch(ex) {console.log(ex.toString());}
        try {app.inited = true;} catch(ex) {console.log(ex.toString());}

    },
    // Reset search start
    resetSearchStart: function() {
        // console.log("resetSearchStart");
        $("#content-dnd-logo").switchClass("cats dogs small all", null,"fast", function() {
            $(this).removeAttr("class").removeAttr("style");
        });
        $(" #content-go-btn").fadeOut("fast", function() {
            $(this).removeAttr("class").removeAttr("style");
        });
        $(".content-category").removeClass("selected");
        app.clearSearchResults();
        $("#content-dnd-logo").draggable({
            revert: true,
            containment: "#content-categories"
        }).css("opacity", 1);

        $(".category").droppable({
            accept: "#content-dnd-logo",
            drop: app.selectSearchCategory
        });

        try { $.mobile.loading('hide'); } catch(ex) { console.log(ex.toString()); }
        setTimeout(function() {
            if($.mobile.activePage.attr("id")=="search-start") {
                try { $.mobile.loading('hide'); } catch(ex) { console.log(ex.toString()); }
            }
        }, 1000);
    },
    // Clear search results
    clearSearchResults: function() {
        $(".search-results-wrap").empty();
        $("#search-results .global-content").unbind("scroll");
        $("#search-results").unbind(".rebindSearchScroll");
        app.searchResults = null;
        app.searchOffset  = 0;
        app.searchPerPage = 10;
    },
    // Clear detailed result
    clearDetailedResult: function() {
        $(".detailed-result-wrap").removeAttr("style");
        $(".detailed-result-img-wrap").jqmData("animating", false);
        $(".detailed-result-error").remove();
        app.updateFavoriteButton(false);
    },
    //initialize modules
    initModules: function() {

        // console.log("init modules");

        app.db = new DB();

        // console.log({"app.db": app.db});

        // Load the Facebook SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=396642740442879";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        /*$.getScript("js/jquery.overscroll.min.js", function(data, textStatus, jqxhr) {
            *//*console.log(data); //data returned
            console.log(textStatus); //success
            console.log(jqxhr.status); //200*//*
            console.log('Overscroll load was performed.');
        });*/

    },
    facebookInited: false,
    initFacebook: function() {
        if(!app.facebookInited) {
        // init the FB JS SDK
            FB.init({
                appId      : '396642740442879',                    // App ID from the app dashboard
                channelUrl : '../channel.html',                       // Channel file for x-domain comms
                status     : true,                                 // Check Facebook Login status
                xfbml      : true                                  // Look for social plugins on the page
            });
            app.facebookInited = true;
        } else {
            try {
                FB.XFBML.parse();
            } catch(ex) {
                console.log(ex.toString());
            }
        }

        // Additional initialization code such as adding Event Listeners goes here

        if(typeof(arguments[0])=="function")(arguments[0])(arguments.splice(1));
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        if(app.inited || $("body").hasClass("eventsBound")) return false;
        $("body").addClass("eventsBound");
        console.log({
            "onDeviceReady": typeof(this.onDeviceReady),
            "app.inited": app.inited
        });
        // Bind Device Ready
        // document.addEventListener('deviceready', this.onDeviceReady, false);

        // Bind jQuery Events Here...
        (function($) {
            /**
             * Bind Default AJAX before and after loader
             */
            $(document).ajaxSend(function() {
                try{$.mobile.loading("show");}catch(ex){console.log(ex.toString());}
            });
            $(document).ajaxComplete(function() {
                try{$.mobile.loading("hide");}catch(ex){console.log(ex.toString());}
            });

            /**
             * Bind page state actions
             */
            $("#hidden_search_form").on("submit", app.procSearch);
            $("#search-start").on("pagebeforeshow", app.resetSearchStart);
            $("#detailed-result").on("pagehide", app.clearDetailedResult)
                                 .on("pagebeforeshow", function(ev, data) {
                                     $("#detailed-result .global-header > a").fadeOut("fast");
                                 })
                                 .on("pageshow", function(e, data) {
                                     $.when(app.promise.detail).done(function() {
                                         setTimeout(function() {
                                             if($(".detailed-result-wrap:visible,.detailed-result-wrap:animated").length==0) {
                                                 app.fillPetDetails(); //$.mobile.navigate("#search-start");
                                             } else {
                                                 if(!$("#detailed-result .global-header > a").is(":visible")) {
                                                     try {
                                                         if (app.getPetDetail("ID") in app.db.getFavorites()) {
                                                             app.updateFavoriteButton(true);
                                                         } else {
                                                             app.updateFavoriteButton(false);
                                                         }
                                                     } catch (ex) {
                                                         app.updateFavoriteButton(false);
                                                     }
                                                 }
                                                 $("#detailed-result .global-header > a").fadeIn("fast");
                                             }
                                         }, 1000);
                                     });
                                     $(".footer-icon", this).removeClass("selected").filter(
                                         $(this).jqmData("referrer")=="#favorites-list"?".footer-icons-favorites":".footer-icons-search"
                                     ).addClass("selected");
                                 })
                .on("tap", ".global-footer a", function(e) {
                    e.preventDefault();
                    var href = $(this).attr("href");
                    if(href=="#" || !href) return false;
                    $.mobile.changePage(href, {changeHash: false});
                });
            $("#search-results").on("pageshow", function() {
                $.when.apply($, app.promise.searchLoad.concat(app.promise.search)).done(function() {
                    if($(".search-result:visible,.search-result:animated").length==0) {
                        app.loadSearchResults()
                        if($(".search-result:visible,.search-result:animated").length==0) {
                            $.mobile.changePage("#search-start");
                        }
                    }
                });
            }).on("pagehide", function() {
                $("#search-results .global-content").unbind("scroll");
                $(this).one("pageshow.rebindSearchScroll", function(e, data) {
                    $.when.apply($, app.promise.searchLoad.concat(app.promise.search)).done(app.bindSearchOverscroll);
                });
            });

            $("[rel='external'],[data-rel='external']").on("tap", function(e) {
                window.open(this.href,'_system'); return false;
            });

            $(document).on('keydown', function(event) {
                console.log("keydown: " + event.keyCode);
                if((event.keyCode == 27) && ($.mobile.activePage.attr('id')=="search-start")) {
                    event.preventDefault();
                    var app_ns = (navigator.app) ? navigator.app : navigator.device;
                    if(!navigator.notification.confirm) {
                        navigator.notification.confirm = function(msg, fun, title, btns) {
                            if(confirm(msg)) (fun)(2);
                        }
                    }
                    navigator.notification.confirm("Are you sure you want to exit?", function(btnDex) {
                        console.log("btnDex: "+ btnDex);
                        if(btnDex==2) {
                            app_ns.exitApp();
                        }
                    }, "Exit App?", "No, Yes")
                }
            });

            $("#favorites-list").on("pagebeforeshow", app.favoritesList);

            $("[data-role='page']").
                on("pagebeforeshow", function(ev, prevPage) {
                    prevPage = prevPage.prevPage;
                    if(!prevPage.length) return true;
                    var thisId = "#"+$(this).attr('id');
                    var prevId = "#"+prevPage.attr("id");
                    // console.log(thisId, prevId, (prevId in app.ignoreReferrer), (app.ignoreReferrer[prevId]==thisId));
                    if((prevId in app.ignoreReferrer) && (app.ignoreReferrer[prevId]==thisId)) return true;
                    $(this).jqmData("referrer", prevId);
                    // console.log("referrer updated: "+ prevId);
                    return true;
                }).
                on("pagechange ", function(event, data) {
                    var thisPage = $(this).attr("id");
                    var nextPage = data.toPage.attr("id");
                    console.log("Page change from '#" + thisPage + "' to '#" + nextPage + "'");
                });

            /**
             * Define button bindings
             */
            $(".search-results-wrap,.favorites-list-wrap").on("tap", ".search-result,.favorites-item", app.loadPetDetails);

            $("#detailed-result a[data-rel='back']").on("tap", function(e) {
                var target = $.mobile.activePage.jqmData("referrer");
                if(!target) return true;
                e.preventDefault();
                $.mobile.changePage(target, {
                    reverse: true
                });

                $.mobile.urlHistory.clearForward();
            });

            /*$("[data-rel='back']").on("tap", function(e) {
                var target = $.mobile.activePage.jqmData("referrer");
                var backTo = !!$(this).jqmData("back-button-navigated");
                if(backTo) $(this).jqmData("back-button-navigated", false);
                if(!target || backTo) return (console.log("normal back button event", target, backTo) || true);
                e.preventDefault();
                $(target).jqmData("back-button-navigated", true);
                $.mobile.navigate(target);
            });*/

            $(".detailed-result-favorite").on("tap", function(e) {
                var $this = $(this);
                var $page = $this.parents("#detailed-result");
                var petId = $page.jqmData("pet-id");
                var isFav = $page.jqmData("favorite");
                if(!petId) return false;
                if(isFav) {
                    // console.log("pet is favorited, time to un-favorite.");
                    app.unfavoritePet(e, petId);
                } else {
                    // console.log("pet is un-favorited, time to favorite.");
                    app.favoritePet(e, petId);
                }
            });

            $(".global-footer").on("tap", ".footer-icons-search", app.resetSearchStart);

            $("#search-start .category").on("tap", function(e) {
                if($("#search-start").hasClass("selectingCategory")) return false;
                $("#search-start").addClass("selectingCategory");
                if($(".content-category.selected").length) app.resetSearchStart();
                var ui = {};
                ui.draggable = $("#content-dnd-logo");
                app.selectSearchCategory.apply($(this),[e,ui]);
            });

            /**
             * Other misc event bindings
             */
            $(".detailed-result-img-wrap,.search-results-img-wrap").on("error",".detailed-result-img,.search-results-img", function() {
                $("img",this).attr('src','http://sms.petpoint.com/sms3/emails/images/Photo-Not-Available-'+($("img",this).attr('data-species')||'other')+'.gif');
                return false;
            });

            $(".detailed-result-img-wrap").
                on("click swipeleft", function() {
                    var $this = $(this);
                    if($this.jqmData("animating")) return false;
                    $this.jqmData("animating", true);
                    var $imgs = $this.find("img");
                    if($imgs.length<2) return;
                    var $seld = $imgs.filter(".selected");
                    var $next = $seld.next("img");
                    var revrt = false;
                    if(!$next.length) {
                        $next = $this.find("img").filter(":first");
                        revrt = true;
                    }
                    var nxPos = $imgs.index($next);
                    $imgs.each(function(dex, elem) {
                        $(this).animate({
                            marginLeft: ((revrt) ? ((dex*100)+"%") : ((nxPos - dex)*100+"%"))
                        }, "fast", function() {
                            if(dex==0) {
                                $seld.removeClass("selected");
                                $next.addClass("selected");
                                $this.jqmData("animating", false);
                            }
                        });
                    });
                    var $dots = $(".detailed-result-img-dot");
                    var $sDot = $dots.filter(".selected");
                    var $nDot = $dots.eq(nxPos);
                        $sDot.removeClass("selected").attr("src", app.photoDotSrc);
                        $nDot.addClass("selected").attr("src", app.photoDotSrcS);
                });
//            console.log(typeof($.mobile), $.mobile, typeof($.mobile.loader), $.mobile.loader);
            try { $.mobile.loading("hide"); } catch(ex) { console.log(ex.toString()); }

        })(jQuery);
    },
    // Favorites pre-show processing
    favoritesList: function(event, ui) {
        var $favWrap  = $(".favorites-list-wrap");
        var favorites = app.db.getFavorites();
        var numFavs   = count(favorites);

        if(!numFavs) {
            $favWrap.empty().append(
                $("<div />").addClass("favorites-list-empty").html(
                    $("<h1/>").text("You have not added any pets to your favorites")
                )
            );
        } else {
            var lastFavoritesKeys = [];
            if(app.lastFavorites.length) {
                for(var key in app.lastFavorites) {
                    lastFavoritesKeys.push(key);
                }
            }
            if(lastFavoritesKeys!=favorites) {
                $favWrap.empty();
                // app.fetchFavorites();
                app.loadFavorites();
            }
        }
    },
    loadFavorites: function() {
        var favorites = app.db.getFavorites();
        var template   =   $(".favorites-item-template").
                            clone().
                            removeClass("favorites-item-template").
                            addClass("favorites-item").
                            css("display", "none").
                            wrap("<div/>").
                            parent().
                            html();
        var result, animal;
        for(var petId in favorites) {
            animal   = favorites[petId];
            result    = template;
            animal    = {
                __id__      : petId,
                __photo__   : animal.Photo || animal.Photo1,
                __name__    : animal.AnimalName,
                __species__ : animal.AnimalType.match(/^[a-zA-Z\s]+$/g) ? animal.AnimalType : animal.Species,
                __breed__   : animal.PrimaryBreed.replace(",",",<br><div class='hanging-indent'></div>"),
                __gender__  : animal.Sex,
                __age__     : monthsToYears(animal.Age)
            };
            result    = array_replace(result, animal);
            $(result).appendTo(".favorites-list-wrap");
        }

        $.mobile.loading("hide");

        $(".favorites-item").each(function(i) {
            $(this).css({
                "opacity": "0",
                "display": "block"
            }).animate({
                opacity: "1",
                delay: (10 * (i - app.searchOffset))
            }, "fast");
        });

    },
    // Handle the selection of a search category
    /*selectSearchCategory: function(ev, ui) {
        var $this   = $(this);
        var contCat = $this.parents(".content-category");
        var species = contCat.jqmData("species-id") || 0;
        var id      = $this.attr("id");
        var logo    = ui.draggable;
        *//*var logoClone = logo.clone().css("visibility", "hidden").addClass(id).appendTo(logo.parent());
         var newProps = {
         top: logoClone.position().top + "px",
         left: logoClone.position().left + "px"
         };
         console.log(newProps);
         logoClone.remove();*//*
        var newProps = {
            "cats": {
                top:  "9.5%",
                left: "9.5%"
            },
            "dogs": {
                top:  "9.5%",
                left: "59.5%"
            },
            "small": {
                top:  "59.5%",
                left: "9.5%"
            },
            "all": {
                top:  "59.5%",
                left: "59.5%"
            }
        };
        logo.draggable({
            revert: false,
            destroy: true
        });
        logo.animate(newProps, "fast", function() {
            // return console.log("killin it");
            console.log({
                aniProps: $.extend(
                    newProps[id],
                    {
                        width:   "45%",
                        height:  "45%",
                        opacity: "45%"
                    }
                )
            });
            $(this).animate(newProps[id], "fast", function() {
                $(this).hide().removeAttr("style");
            });
            contCat.switchClass(null, "selected", "fast");
            $("#content-go-btn").fadeIn("fast", function() {
                $(this).jqmData("species", species).one("tap", app.initSearch);
            })
        });
    },*/
    selectSearchCategory: function(ev, ui) {
        var $this   = $(this);
        var contCat = $this.parents(".content-category");
        var species = contCat.jqmData("species-id") || 0;
        var id      = $this.attr("id");
        var logo    = ui.draggable;
        var docX    = logo.parent().width();
        var docY    = logo.parent().height();
        var newWid  = docX * 0.45;
        var newHei  = docY * 0.45;
        var newMarT = (newHei - logo.height()) / 2;
        var newMarL = (newWid - logo.width()) / 2;
        var newProps = {
            "cats": {
                top:  0.095 * docY,
                left: 0.095 * docX
            },
            "dogs": {
                top:  0.095 * docY,
                left: 0.595 * docX
            },
            "small": {
                top:  0.595 * docY,
                left: 0.095 * docX
            },
            "all": {
                top:  0.595 * docY,
                left: 0.595 * docX
            }
        };
        // Animate the logo thing.
        logo.
            draggable({
                revert: false,
                destroy: true
            }).
            animate(newProps[id], "fast", function() {
                $(this).delay(50).animate({
                    width:  docX * 0.45,
                    height: docY * 0.45,
                    left: parseFloat($(this).css("left")) - newMarL,
                    top: parseFloat($(this).css("top")) - newMarT,
                    opacity: 0
                }, "fast", function() {
                    $(this).removeAttr("style").hide();
                });
                contCat.delay(100).switchClass(null, "selected", "fast");
                $("#content-go-btn").fadeIn("fast", function() {
                    $(this).jqmData("species", species).one("tap", app.initSearch);
                    $("#search-start").removeClass("selectingCategory");
                })
            });
    },
    // Initialize search, select category.
    initSearch: function(ev) {
        $.mobile.loading("show");
        var species = $(this).jqmData("species");
        $("#hidden_search_form").trigger("submit", [species]);
    },
    // Process search
    procSearch: function(e, species) {
        e.preventDefault();
        var searchData = $.extend(app.searchDefaults, {
            speciesID: species
        });
        if(app.promise.search && app.promise.search.state()!="resolved") {
            return false;
        }
        app.lastSearchSpecies = species;
        app.promise.search = $.ajax({
            url: app.searchResultsURI,
            data: searchData,
            dataType: "xml",
            type: "POST",
            beforeSend: function() {
                $.mobile.loading("show");
                $.mobile.changePage("#search-results", {keepLoading: true});
            },
            success: function(data) {
                app.searchResultsRaw = data;
                app.searchResults = $.makeArray(data.getElementsByTagName("adoptableSearch"));
                console.log({
                    "app.searchResultsRawLength": app.searchResultsRaw.getElementsByTagName("adoptableSearch").length,
                    "app.searchResultsLength":    app.searchResults.length
                });
                if(app.searchResults!=null && app.searchResults.length>0) {
                    try {
                        app.loadSearchResults();
                    } catch(ex) {
                        console.log("app.loadSearchResults Error: " + ex.toString());
                    }
                } else {
                    $.mobile.changePage("#search-start");
                }
            },
            error: function() {
                console.log({
                    "SearchError": arguments
                });
                $.mobile.changePage("#search-start");
            }
        }).promise();
    },
    // Load search results into the DOM based on a hidden template
    loadSearchResults: function() {

        /**
         * Make sure stuff isn't still loading.
         */
        if(app.promise.search.state()=="pending") {
            $.when(app.promise.search).done(app.loadSearchResults);
            return false;
        }
        if(app.promise.searchLoad.length) {
            var loadingSearch = false;
            $.each(app.promise.searchLoad, function() {
                loadingSearch = loadingSearch && (this.state() == "pending");
            });
            if(loadingSearch) {
                $.when.apply($, app.promise.searchLoad).done(app.loadSearchResults);
                return false;
            }
        }

        if(app.searchResults==null) {
            var lastSpecies = arguments[0] || app.lastSearchSpecies;
            return app.procSearch({preventDefault:function(){}}, lastSpecies);
        }

        var numResults =   app.searchResults.length;
        var template   =   $(".search-results-template").
                           clone().
                           removeClass("search-results-template").
                           addClass("search-result").
                           css("display", "none").
                           wrap("<div/>").
                           parent().
                           html();

        /*console.log({
            "numResults"   : numResults,
            "searchOffset" : app.searchOffset,
            "resultsLoaded": $(".search-result").length
        });*/

        if(numResults>0) {

            if($("#search-results-wrap").hasClass("loadingResults")) {
                $.when.apply($, app.promise.searchLoad).done(app.loadSearchResults);
                return false;
            }
            $("#search-results-wrap").addClass("loadingResults");

            if(!(app.searchOffset < numResults)) {
                $("#search-results .search-results-load-more").slideUp("fast", function() {
                    $(".search-results-load-more").remove();
                    try {$.mobile.loading("hide");} catch(ex) {console.log(ex.toString());}
                    $("#search-results .search-results-wrap").append(
                        $("<div/>").addClass("search-results-load-more").html("No More Results")
                    );
                });
                return false;
            }

            var resultSet = $(app.searchResults).clone().get(),
                resultSet = resultSet.splice(app.searchOffset,app.searchPerPage),
                $animal, animal, result, species;
            if(!resultSet) return false;
            /*console.log({"resultSet":resultSet});*/

            $(resultSet).each(function(dex) {
                $animal   = $(this);
                result    = template;
                species   = $animal.children("AnimalType").text().match(/^[a-zA-Z\s]+$/g) ? $animal.children("AnimalType").text() : $animal.children("Species").text();
                animal    = {
                    __id__      : $animal.children("id").text(),
                    __photo__   : $animal.children("photo").text(),
                    __name__    : $animal.children("name").text(),
                    __species__ : species,
                    __breed__   : $animal.children("primaryBreed").text().replace(",",",<br><div class='hanging-indent'></div>"),
                    __gender__  : $animal.children("sex").text(),
                    __age__     : monthsToYears($animal.children("age").text())
                };
                result    = array_replace(result, animal);
                $(result).find("img").attr({
                    "data-species": ((species.toLowerCase() in {'dog':1,'cat':1}) ? species.toLowerCase() : "other")
                }).end().appendTo(".search-results-wrap");
            });


            $("#search-results .search-results-load-more").slideUp("fast", $(".search-results-load-more").remove);

            $(".search-result").each(function(i) {
                if(i<app.searchOffset) return true;
                app.promise.searchLoad.push($(this).css({
                    "opacity": "0",
                    "display": "block"
                }).animate({
                    opacity: "1",
                    delay: (10 * (i - app.searchOffset))
                }, "fast", function() {
                    $.mobile.loading("hide");
                }));
            });


            app.searchOffset = (app.searchResults.length - app.searchOffset < app.searchPerPage ? app.searchResults.length : app.searchOffset + app.searchPerPage);

            $.when.apply($, app.promise.searchLoad.concat(app.promise.search)).done(app.bindSearchOverscroll);

        } else {
            console.log("no search results",app.searchResults);
            $("#search-results .search-results-wrap").append(
                $("<div/>").addClass("search-results-load-more").html("No Search Results")
            );
        }
    },
    // Load more search results (handle overscroll on results page)
    bindSearchOverscroll: function() {

        $("#search-result-wrap").removeClass("loadingResults");
        $("#search-results .search-results-load-more").slideUp("fast", $(".search-results-load-more").remove);

        var scrollEvents = $("#search-results .global-content").data("events");
        try {
            if(scrollEvents && scrollEvents.scroll) {
                if(scrollEvents.scroll.length) {
                    return false;
                }
            }
        } catch(ex) {
            console.log(ex.toString());
        }

        /*
         console.log({
         "numResults"   : numResults,
         "searchOffset" : app.searchOffset,
         "resultsLoaded": $(".search-result").length
         });
         */

        if(app.searchResults===null) {
            if(!$(".search-result:visible").length) {
                $.when($.mobile.changePage("#search-start")).done(function() {
                    $.mobile.urlHistory.stack.pop();
                });
            }
        } else
        if(app.searchOffset < app.searchResults.length) {
            // console.log("bind smartscroll");
            $("#search-results .global-content").bind("scroll.loadMore", debounce(function() {
                var scrollTarget = $(".search-results-wrap").height()
                    - ($("#search-results .global-content").scrollTop());
                var targetHeight = $("#search-results .global-content").height() + 50 // add 50 for padding;

                /*
                 console.log({
                 "scrollStats": {
                 "scrollTarget": scrollTarget,
                 "targetHeight": targetHeight
                 }
                 });
                 */

                if(scrollTarget < targetHeight) {
                    $.mobile.loading("show");
                    $("#search-results .global-content").unbind("scroll.loadMore");
                    $("<div/>").addClass("search-results-load-more").html("Loading More...").appendTo(".search-results-wrap");
                    $("#search-results .global-content").animate({
                        scrollTop: $(".search-results-wrap").height()
                    }, "fast", app.loadSearchResults);
                }
            }, 100));
        } else {
            $("#search-results .search-results-wrap").append(
                $("<div/>").addClass("search-results-load-more").html("No More Results")
            );
        }
    },
    // Load Pet Details: go to pet result page and load data.
    loadPetDetails: function() {
        var $this = $(this),
            petId = $this.jqmData("animal-id"),
            finished = false;
        if(!petId) return false;
        var headerFadeout = $("#detailed-result .global-header > a, #detailed-result .detailed-result-wrap").fadeOut(0).promise();
        $.mobile.loading("show");
        $this.addClass("active").delay(1000).removeClass("active");
        $("#detailed-result").addClass("AJAXing").find(".global-header a[data-rel='back']").one("tap.sudoBack",function(e) {
            var target = $("#detailed-result").jqmData("referrer");
            if(!target) return false;
            e.preventDefault();
            e.stopPropagation();
            $.mobile.changePage(target, {changeHash: false});
            return false;
        }).end().one("pagebeforechange", function() {
            $(this).find(".global-header a[data-rel='back']").unbind(".sudoBack");
        });
        var orgPage = $.mobile.activePage.attr("id");
        app.promise.detail = $.ajax({
            url: app.searchDetailsURI,
            data: {
                authkey: app.searchDefaults.authkey,
                animalID: petId
            },
            dataType: "xml",
            type: "post",
            beforeSend: function() {
                $.mobile.loading("show");
            },
            success: function(xml) {
                app.petDetails = $("adoptableDetails", xml);
                app.promise.detailLoad = $.Deferred();
                app.fillPetDetails();
                $("#detailed-result").removeClass("AJAXing");
            },
            error: function(obj, textError, errorDetail) {
                console.log({
                    "SearchDetailsError": arguments,
                    promise: app.promise.detail.state(),
                    "finished": finished,
                    "$this": $this
                });
                if(textError=="parsererror" && (errorDetail.message.match(/^Invalid\sXML\:/).length)) {
                    $("#detailed-result .detailed-result-wrap").after(
                        $("<div/>").addClass("detailed-result-error").html(
                            $("<h1/>").html("This pet has been removed").wrap('<span/>').parent().html() +
                            $("<p/>").html("Due to this pet no longer being available, it has been removed from your favorites. Sorry for the inconvenience.").wrap('<span/>').parent().html()
                        ).fadeIn("slow")
                    );
                    $("#detailed-result .global-header a[data-rel='back']").fadeIn("fast");
                    app.db.removeFavorite(petId);
                } else {
                    if($.mobile.activePage.attr('id')!=orgPage) {
                        $.mobile.changePage("#"+orgPage);
                        $.mobile.urlHistory.clearForward();
                    }
                }
            }
        }).promise();

    },
    getPetDetail: function(key) {
        if(!app.petDetails) return false;
        var retval  = false;
        var petProp = app.petDetails.children().filter(function() {
            return this.tagName.match(new RegExp("^"+key+"\d*", "i"));
        });
        if(petProp.length > 1) {
            retval = [];
            petProp.each(function() {
                retval.push($(this).text().flatSpace());
            });
        } else
        if(petProp.length === 1) {
            retval = petProp.text().flatSpace();
        }
        return retval;
    },
    // Fill Pet Details: fill the detail template with values from the animal
    fillPetDetails: function() {
        /*
        var petDetailsArray = [];
        app.petDetails.children().each(function() {
            if(this.tagName) petDetailsArray.push(this.tagName);
        });
        var petDetailsObj = {};
        for(var i in petDetailsArray) {
            if(typeof(petDetailsArray[i])!="string") continue;
            petDetailsObj[petDetailsArray[i]] = app.getPetDetail(petDetailsArray[i]);
        }
        console.log(petDetailsObj);
        */

        /**
         * Get pet id value
         */
        var petId = app.getPetDetail("id");

        /**
         * Update cached favorite
         */
        try{
            if(petId in app.db.getFavorites()) {
                app.favoritePet(null, petId);
            }
        } catch(ex) {
            console.log(ex.toString());
        }

        /**
         * Set Pet Id as a data property of the #detailed-result page
         */
        $("#detailed-result").jqmData("pet-id", petId);

        /**
         * Set favorite button state
         */
        try {
            if (petId in app.db.getFavorites()) {
                app.updateFavoriteButton(true);
            } else {
                app.updateFavoriteButton(false);
            }
        } catch (ex) {
            app.updateFavoriteButton(false);
        }

        // console.log("fillPetDetails:1");

        /**
         * Get The species for use with a fall-back photo
         */
        var species = app.getPetDetail("AnimalType").match(/^[a-zA-Z\s]+$/g) ? app.getPetDetail("AnimalType") : app.getPetDetail("Species");

        // console.log("fillPetDetails:2");

        /* Top Half */

        /**
         * Create Photo elements and append to DOM
         */
        var photos = app.getPetDetail("Photo");
        if(photos) {
            $(".detailed-result-img-wrap,"
            + ".detailed-result-img-dots").empty();
            for(var i in photos) {
                if(typeof(photos[i])!="string"||!photos[i].length) continue;
                $("<img />").attr({
                    "src":          photos[i],
                    "class":        "detailed-result-img" + (i==0 ? ' selected' : ''),
                    "data-species": ((species.toLowerCase() in {'dog':1,'cat':1}) ? species.toLowerCase() : "other")
                }).css({
                    "margin-left": 100*i+"%"
                }).appendTo(".detailed-result-img-wrap");
                $("<img />").attr({
                    "src": i==0 ? app.photoDotSrcS : app.photoDotSrc,
                    "class": "detailed-result-img-dot" + (i==0 ? ' selected' : '')
                }).wrap("<div class='detailed-result-img-dot-wrap'/>").parent().appendTo(".detailed-result-img-dots");
            }
        } else {
            $("<div />").addClass("detailed-result-img-none").appendTo(".detailed-result-img-wrap");
        }

        // console.log("fillPetDetails:3");

        /**
         * Fill pet name
         * @type {*}
         */
        var name = app.getPetDetail("AnimalName");
        try {
            if(name) {
                $(".detailed-result-name").show().html(name);
            }else{
                $(".detailed-result-name").hide().html('');
            }
        } catch(ex) {
            $(".detailed-result-name").hide().html('');
        }

        // console.log("fillPetDetails:4");

        /**
         * Fill pet breed
         * @type {XML|string|void}
         */
        var primaryBreed   = app.getPetDetail("primaryBreed");
        var secondaryBreed = app.getPetDetail("secondaryBreed");
        try {
            if(primaryBreed || secondaryBreed) {
                $(".detailed-result-breed").show().html((primaryBreed ? primaryBreed.replace(", ", ",<br/>") : '') + (secondaryBreed ? (primaryBreed?"<br/>":'')+secondaryBreed:''));
            } else {
                $(".detailed-result-breed").hide().html('');
            }
        } catch(ex) {
            $(".detailed-result-breed").hide().html('');
        }

        // console.log("fillPetDetails:5");

        /**
         * Fill Availability stage
         * @type {*}
         */
        var availablity = app.getPetDetail("stage");
        try {
            if (availablity) {
                $(".detailed-result-availability").show().html(availablity);
            } else {
                $(".detailed-result-availability").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-availability").hide().html('');
        }

        // console.log("fillPetDetails:6");

        /* Bottom Half */

        /**
         * Fill gender and 'altered' fields
         * @type {*}
         */
        var gender = app.getPetDetail("sex");
        var altered = app.getPetDetail("altered") == "Yes" ? (
            gender == "Male" ? (
                "Neutered"
                ) : (
                gender == "Female" ? (
                    "Spayed"
                    ) : (
                    "Fixed"
                    )
                )
            ) : (
            null
            );
        try {
            if (gender) {
                $(".detailed-result-gender").show().html(gender + (gender == "Unknown" ? " Gender" : '') + (altered ? " (" + altered + ")" : ''));
            } else {
                $(".detailed-result-gender").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-gender").hide().html('');
        }

        // console.log("fillPetDetails:7");

        /**
         * Fill pet color data
         */
        var color1 = app.getPetDetail("primaryColor");
        var color2 = app.getPetDetail("secondaryColor");
        try {
            if (color1) {
                $(".detailed-result-color").show().html(color1 + (color2 ? " " + color2 : ''));
            } else {
                $(".detailed-result-color").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-color").hide().html('');
        }

        // console.log("fillPetDetails:8");

        /**
         * Fill pet weight data
         */
        var weight = app.getPetDetail("BodyWeight");
        try {
            if (weight) {
                $(".detailed-result-weight").show().html(weight);
            } else {
                $(".detailed-result-weight").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-weight").hide().html('');
        }

        // console.log("fillPetDetails:9");

        /**
         * Fill pet age
         */
        var age = app.getPetDetail("age");
        try {
            if (age) {
                $(".detailed-result-age").show().html(monthsToYears((typeof(age) == typeof([]) ? age[0] : age)));
            } else {
                $(".detailed-result-age").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-age").hide().html('');
        }

        // console.log("fillPetDetails:10");

        /**
         * Fill pet identification number
         */
        try {
            if (petId) {
                $(".detailed-result-petid").show().html("Pet ID: " + petId);
            } else {
                $(".detailed-result-petid").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-petid").hide().html('');
        }

        // console.log("fillPetDetails:11");

        /**
         * Fill intake date
         */
        try {
            var intakeDate = new Date(app.getPetDetail("LastIntakeDate"));
            if(intakeDate) {
                $(".detailed-result-intake-date").show().html(
                    "Intake Date: " + intakeDate.format("mmmm dS, yyyy")
                );
            } else {
                $(".detailed-result-intake-date").hide().html('');
            }
        } catch(ex) {
            $(".detailed-result-intake-date").hide().html('');
        }

        // console.log("fillPetDetails:12");

        /**
         * Fill out misc other optional data
         */
        try {
            var miscDetails = {
                houseTrained:     app.getPetDetail("houseTrained") == "Yes" ? "House Trianed" : null,
                onHold:           app.getPetDetail("onHold") == "Yes" ? "On Hold" : null,
                declawed:         app.getPetDetail("declawed") ? (app.getPetDetail("declawed")=="No" ? "Not" : app.getPetDetail("declawed")) + " Declawed" : null,
                noDogs:           app.getPetDetail("noDogs") == "Yes" ? "Cannot Live With Dog(s)" : null,
                noCats:           app.getPetDetail("noCats") == "Yes" ? "Cannot Live With Cat(s)" : null,
                noKids:           app.getPetDetail("noKids") == "Yes" ? "Cannot Live With Children" : null,
                specialNeeds:     app.getPetDetail("specialNeeds") ? "Special Needs: " + app.getPetDetail("specialNeeds") : null,
                behaviorResult:   app.getPetDetail("behaviorResult") ? "Behavior Report: " + app.getPetDetail("behaviorResult") : null
            };
            $(".detailed-result-misc-details").empty();
            for(var i in miscDetails) {
                if(!miscDetails[i]) continue;
                $(".detailed-result-misc-details").append(
                    $("<div />").addClass("detailed-result-misc-details-"+i+" detailed-result-misc-details-item").html(miscDetails[i])
                );
            }
        } catch(ex) {
            $(".detailed-result-misc-details").empty();
        }

        // console.log("fillPetDetails:13");

        /**
         * Fill the pet's description
         */
        var desc = app.getPetDetail("dsc");
        try {
            if (desc) {
                $(".detailed-result-desc").show().html(desc.replace(/[\n\r]/g, "<br/>"));
            } else {
                $(".detailed-result-desc").hide().html('');
            }
        } catch (ex) {
            $(".detailed-result-desc").hide().html('');
        }

        // console.log("fillPetDetails:14");



        /**
         * Construct the share URL
         */
        https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.petango.com%2FAdopt%2FCat-Domestic-Shorthair-Purebred-19440252
        try{
            var shareLink = "http://www.petango.com/Adopt/" + (app.getPetDetail("AnimalType") + " " + primaryBreed + " " + secondaryBreed + " " + petId ).flatSpace().toLowerCase().replace(",","").replace(/\s/g, "-");
            if(shareLink.validURL()) {
                console.log({"shareLinkValid":shareLink});
                $(".fb-like").show().attr({
                    "data-href": shareLink,
                    "fb-xfbml-state": "unrendered"
                });
                $(".detailed-result-petango").attr("href", shareLink);
                try {
                    FB.XFBML.parse();
                } catch(e) {
                    app.initFacebook(function() {
                        try{FB.XFBML.parse();}catch(e){console.log(e.toString());}
                    });
                }
            } else {
                console.log({"shareLinkNotValid":shareLink});
                $(".fb-like").hide().jqmData("href", shareLink);
                $(".detailed-result-petango").attr("href", "http://www.petango.com/");
            }
        } catch(ex) {
            $(".fb-like").hide();
        }

        // console.log("fillPetDetails:15");



        // console.log("fillPetDetails:16");

        $.mobile.changePage("#detailed-result",{loadPetDetails:true, changeHash: false});

        $("#detailed-result .global-header > a,#detailed-result .detailed-result-wrap").fadeIn("fast", function() {

            app.promise.detailLoad.resolve();

            app.detailedResultBottomFix();

            $.mobile.loading("hide");
        });


        // console.log("fillPetDetails:17");

    },
    detailedResultBottomFix: function() {
        var bottomHeight = $("#detailed-result .global-footer").offset().top - ($("#detailed-result .detailed-result-top").offset().top + $("#detailed-result .detailed-result-top").height());

        if(bottomHeight===0) {
            bottomHeight = "auto";
        } else {
            bottomHeight = bottomHeight + "px";
        }

        $(".detailed-result-bottom").css({
            "height"  : bottomHeight,
            "overflow-x": "hidden",
            "overflow-y": "scroll"
        });
    },
    updateFavoriteButton: function(highlighted) {
        console.log("updating favorite button. highlighted argument is: " + (highlighted ? "true" : "false"));
        highlighted = typeof(highlighted)!="undefined" ? highlighted : false;
        var theme = highlighted ? 'e' : 'c';
        $('#detailed-result .detailed-result-favorite')
            .delay(500)
            .removeClass(
                'ui-btn-up-a ui-btn-up-b ui-btn-up-c ui-btn-up-d ui-btn-up-e ' +
                'ui-btn-hover-a ui-btn-hover-b ui-btn-hover-c ui-btn-hover-d ui-btn-hover-e ' +
                'ui-btn-down-a ui-btn-down-b ui-btn-down-c ui-btn-down-d ui-btn-down-e'
            )
            .addClass('ui-btn-up-' + theme)
            .attr({
                'data-theme': theme
            })
            .parents("#detailed-result")
            .jqmData("favorite", highlighted);
    },
    favoritePet: function(event, petId) {
        app.db.addFavorite(petId, $.xml2json(app.petDetails[0]));
        app.updateFavoriteButton(true);
    },
    unfavoritePet: function(event, petId) {
        app.db.removeFavorite(petId);
        x2(500, app.updateFavoriteButton, false);
    }
});

var example_details = {
    CompanyID: "859",
	ID: "19640031",
	AnimalName: "Chuck",
	Species: "Dog",
	Sex: "Male",
	Altered: "Yes",
	PrimaryBreed: "Retriever",
	SecondaryBreed: "Mix",
	PrimaryColor: "Black",
	SecondaryColor: "",
	Age: "2",
	Size: "S",
	Housetrained: "Unknown",
	Declawed: "No",
	Price: "0.00",
	LastIntakeDate: "2013-04-12 17:04:00",
	Location: "Dog Adoption",
	Dsc: "",
	Photos: [
	    "http://www.petango.com/sms/photos/859/20706102-02de-432a-aa10-fcb52cc91eb2.jpg",
	    "http://www.petango.com/sms/photos/859/eea832c0-a176-4edc-9ab6-dd8ff1754e58.jpg",
	    "http://www.petango.com/sms/photos/859/abf7919a-a301-4e52-b634-22f209975f42.jpg"
    ],
	OnHold: "No",
	SpecialNeeds: "",
	NoDogs: "",
	NoCats: "",
	NoKids: "",
	BehaviorResult: "",
	MemoList: {},
	Site: "Cleveland Animal Protective League",
	DateOfSurrender: "",
	TimeInFormerHome: "",
	ReasonForSurrender: "",
	PrevEnvironment: "",
	LivedWithChildren: "Unknown",
	LivedWithAnimals: "Unknown",
	LivedWithAnimalTypes: "",
	BodyWeight: "",
	DateOfBirth: "2013-02-12",
	ARN: "",
	VideoID: "",
	Stage: "Available",
	AnimalType: "Dog",
	AgeGroup: "Baby",
	WildlifeIntakeInjury: "",
	WildlifeIntakeCause: "",
	BuddyID: "0"
};