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
var app = {
    // Public Properties
    searchResultsURI: "http://www.petango.com/webservices/wsadoption.asmx/AdoptableSearch",
    searchDetailsURI: "http://www.petango.com/webservices/wsadoption.asmx/AdoptableDetails",
    PetPointAuthKey: "23lomcf2c0qa811xz4iy0qbpj9uq0w65n4ch964i141640p811",
    searchResults: null,
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
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // Bind Device Ready
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // Bind jQuery Events Here...
        (function($) {
            /**
             * Bind page state actions
             */
            $("#hidden_search_form").bind("submit", app.procSearch);
            $("#search-start").bind("pagebeforeshow", app.resetSearchStart);
            $("#detailed-result").bind("pagehide", app.clearDetailedResult);
            $("#favorites-list").on("pagebeforeshow", app.favoritesList);

            /**
             * Define button bindings
             */
            $(".search-results-wrap,.favorites-list-wrap").on("vclick", ".search-result,.favorites-item", app.loadPetDetails);

            /*$("#search-start .footer-icons-more").on("vclick", function() {
                console.log(app.db.addFavorite(~~(Math.random()*10+1)));
            });

            $("#search-start .footer-icons-favorites").on("vclick", function() {
                console.log(app.db.getFavorites());//, app.db.getFavorites().length);
            });*/

            $(".detailed-result-favorite").on("vclick", function(e) {
                var $this = $(this);
                var petId = $this.parents("#detailed-result").data("pet-id");
                if(!petId) return false;
                if($this.data("favorite")) {
                    console.log("pet is favorited, time to un-favorite.");
                    app.unfavoritePet(e, petId);
                } else {
                    console.log("pet is un-favorited, time to favorite.");
                    app.favoritePet(e, petId);
                }
            });

            $("#search-start .footer-icons-search").on("vclick", app.resetSearchStart);

            $("#search-start .category").on("vclick", function(e) {
                if($(".content-category.selected").length) app.resetSearchStart();
                var ui = {};
                ui.draggable = $("#content-dnd-logo");
                app.selectSearchCategory.apply($(this),[e,ui]);
            })

            /**
             * Other misc event bindings
             */
            /*$(".detailed-result-img-wrap").bind("click", function() {
                var curScroll = $(this).scrollLeft();
                var nextImg = $(".detailed-result-img").filter(function() {
                    return ($(this).parent().offset().left + $(this).parent().outerWidth() > curScroll);
                });
                if(!nextImg.eq(1).length) {
                    $(this).animate({
                        scrollLeft: "0px"
                    }, "fast");
                } else {
                    $(this).animate({
                        scrollLeft: (nextImg.eq(1).parent().offset().left - $(this).offset().left) + "px"
                    }, "fast");
                }


            });*/
        })(jQuery);

        window.fbAsyncInit = app.initFacebook;
    },
    // Reset search start
    resetSearchStart: function() {
        $("#content-dnd-logo, #content-go-btn").removeAttr("class style");
        $(".content-category").removeClass("selected");
        app.clearSearchResults();
        app.onDeviceReady();
    },
    // Clear search results
    clearSearchResults: function() {
        $(".search-results-wrap").empty();
        app.searchResults = null;
        app.searchOffset  = 0;
        app.searchPerPage = 10;
    },
    // Clear detailed result
    clearDetailedResult: function() {
        $(".detailed-result-wrap").removeAttr("style");
        $(".detailed-result-img-wrap").removeOverscroll();
    },
    //initialize modules
    initModules: function() {
        app.db = new DB();
    },
    initFacebook: function() {
        // init the FB JS SDK
        FB.init({
            appId      : '396642740442879',                    // App ID from the app dashboard
            channelUrl : 'channel.html',                       // Channel file for x-domain comms
            status     : true,                                 // Check Facebook Login status
            xfbml      : true                                  // Look for social plugins on the page
        });

        // Additional initialization code such as adding Event Listeners goes here

        if(typeof(arguments[0])=="function")(arguments[0])(arguments.splice(1));
    },
    // deviceready Event Handler
    onDeviceReady: function() {

        app.initModules();


        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=396642740442879";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        (function($) {
            $("#content-dnd-logo").draggable({
                revert: true,
                containment: "#content-categories"
            });

            $(".category").droppable({
                accept: "#content-dnd-logo",
                drop: app.selectSearchCategory
            });
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
                    $("<h1/>").text("You have not added any pets to your favorites.")
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
    fetchFavorites: function() {
        var $favWrap  = $(".favorites-list-wrap");
        $favWrap.empty();
        var data = $.extend(app.searchDefaults,{
            animalID: app.db.getFavorites().join(",")
        });
        $.ajax({
            url: app.searchResultsURI,
            data: data,
            dataType: "xml",
            type: "POST",
            success: function(data) {
                app.favoriteResults = $("adoptableSearch", data);
                app.loadFavorites();
            },
            error: function() {
                console.log({
                    "FavoritesError": arguments
                });
                $.mobile.navigate("#search-start");
            }
        });
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

        $("#favorites-list").removeClass("loading");

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
    selectSearchCategory: function(ev, ui) {
        var $this   = $(this);
        var contCat = $this.parents(".content-category");
        var species = contCat.data("species-id") || 0;
        var id      = $this.attr("id");
        var logo    = ui.draggable;
        logo.draggable({
            revert: false,
            destroy: true
        }).
            switchClass(null,id, "fast", function() {
                $(this).animate({
                    width: logo.width()*1.5,
                    height: logo.height()*1.5,
                    marginLeft: logo.width()*-0.75,
                    marginTop: logo.height()*-0.75,
                    opacity: 0
                }, "fast", function() {
                    $(this).removeAttr("style").hide();
                });
                contCat.switchClass(null, "selected", "fast");
                $("#content-go-btn").fadeIn("fast", function() {
                    $(this).data("species", species).one("vclick", app.initSearch);
                })
            });
    },
    // Initialize search, select category.
    initSearch: function(ev) {
        var species = $(this).data("species");
        $("#hidden_search_form").trigger("submit", [species]);
    },

    // Process search
    procSearch: function(e, species) {
        e.preventDefault();
        var searchData = $.extend(app.searchDefaults, {
            speciesID: species
        });
        $.ajax({
            url: app.searchResultsURI,
            data: searchData,
            dataType: "xml",
            type: "POST",
            beforeSend: function() {
                $("#search-results").addClass("loading");
                $.mobile.navigate("#search-results");
            },
            success: function(data) {
                app.searchResults = $("adoptableSearch", data);
                app.loadSearchResults();
            },
            error: function() {
                console.log({
                    "SearchError": arguments
                });
                $.mobile.navigate("#search-start");
            }
        });
    },
    // Load search results into the DOM based on a hidden template
    loadSearchResults: function() {

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

        if(numResults-app.searchOffset) {
            var resultSet = $(app.searchResults).clone(),
                resultSet = resultSet.splice(app.searchOffset,app.searchPerPage),
                $animal, animal, result;
            if(!resultSet) return false;
            /*console.log({"resultSet":resultSet});*/

            $(resultSet).each(function(dex) {
                $animal   = $(this);
                result    = template;
                animal    = {
                    __id__      : $animal.children("id").text(),
                    __photo__   : $animal.children("photo").text(),
                    __name__    : $animal.children("name").text(),
                    __species__ : $animal.children("AnimalType").text().match(/^[a-zA-Z\s]+$/g) ? $animal.children("AnimalType").text() : $animal.children("Species").text(),
                    __breed__   : $animal.children("primaryBreed").text().replace(",",",<br><div class='hanging-indent'></div>"),
                    __gender__  : $animal.children("sex").text(),
                    __age__     : monthsToYears($animal.children("age").text())
                };
                result    = array_replace(result, animal);
                $(result).appendTo(".search-results-wrap");
            });

            $("#search-results").removeClass("loading");
            $("#search-results .search-results-load-more").slideUp("fast", $(".search-results-load-more").remove);

            $(".search-result").each(function(i) {
                if(i<app.searchOffset) return true;
                //$(this).delay(10*(i-app.searchOffset)).fadeIn("fast");
                $(this).css({
                    "opacity": "0",
                    "display": "block"
                }).animate({
                    opacity: "1",
                    delay: (10 * (i - app.searchOffset))
                }, "fast");
            });

            app.searchOffset = (numResults - app.searchOffset < app.searchPerPage ? numResults : app.searchOffset + app.searchPerPage);

            /*console.log({
                "numResults"   : numResults,
                "searchOffset" : app.searchOffset,
                "resultsLoaded": $(".search-result").length
            });*/

            if(app.searchOffset < numResults) {
                console.log("bind smartscroll");
                $("#search-results .global-content").bind("scroll", debounce(function() {
                    /*var scrollTarget = $("#search-results .search-results-wrap").height()
                                     - $("#search-results .global-content").height()
                                     + ($("#search-results footer").height() * 1.5);*/
                    var scrollTarget = $(".search-results-wrap").height()
                                     - ($("#search-results .global-content").scrollTop());
                                     //+  $("#search-results .global-footer").height());
                    var targetHeight = $("#search-results .global-content").height();
                                     //- $("#search-results .global-footer").height();
                    console.log({
                        "scrollStats": {
                            "scrollTarget": scrollTarget,
                            "targetHeight": targetHeight
                        }
                    });
                    if(scrollTarget < targetHeight) {
                        $(this).unbind("scroll");
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
        } else {
            console.log("no search results",app.searchResults);
            $("#search-results .search-results-wrap").append(
                $("<div/>").addClass("search-results-load-more").html("No Search Results")
            );
        }
    },
    // Load Pet Details: go to pet result page and load data.
    loadPetDetails: function() {
        var $this = $(this),
            petId = $this.data("animal-id");
        if(!petId) return false;
        $this.addClass("active").delay(1000).removeClass("active");
        $("#detailed-result").addClass("loading");
        $.mobile.navigate("#detailed-result");
        $.ajax({
            url: app.searchDetailsURI,
            data: {
                authkey: app.searchDefaults.authkey,
                animalID: petId
            },
            dataType: "xml",
            type: "post",
            success: function(xml) {
                app.petDetails = $("adoptableDetails", xml);
                app.fillPetDetails();
            },
            error: function() {
                console.log({
                    "SearchDetailsError": arguments
                });
            }
        })
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
         * Set Pet Id as a data property of the #detailed-result page
         */
        $("#detailed-result").data("pet-id", petId);

        /**
         * Set favorite button state
         */
        if(petId in app.db.getFavorites()) {
            app.updateFavoriteButton(true);
        } else {
            app.updateFavoriteButton(false);
        }

        /* Top Half */

        /**
         * Create Photo elements and append to DOM
         */
        var photos      = app.getPetDetail("Photo");
        if(photos) {
            $(".detailed-result-img-row").empty()
            for(var i in photos) {
                if(typeof(photos[i])!="string") continue;
                $("<img />").attr({
                    "src": photos[i],
                    "class": "detailed-result-img"
                }).wrap("<td/>").parent().appendTo(".detailed-result-img-row");
            }
            /*$(".detailed-result-img-wrap").css("visibility", "hidden");*/
        } else {
            $("<div />").addClass("detailed-result-img-none").appendTo(".detailed-result-img-wrap");
        }

        /**
         * Fill pet name
         * @type {*}
         */
        var name = app.getPetDetail("AnimalName");
        if(name) {
            $(".detailed-result-name").show().html(name);
        }else{
            $(".detailed-result-name").hide().html('');
        }

        /**
         * Fill pet breed
         * @type {XML|string|void}
         */
        var primaryBreed   = app.getPetDetail("primaryBreed");
        var secondaryBreed = app.getPetDetail("secondaryBreed");
        if(primaryBreed || secondaryBreed) {
            $(".detailed-result-breed").show().html((primaryBreed ? primaryBreed.replace(", ", ",<br/>") : '') + (secondaryBreed ? (primaryBreed?"<br/>":'')+secondaryBreed:''));
        } else {
            $(".detailed-result-breed").hide().html('');
        }

        /**
         * Fill Availability stage
         * @type {*}
         */
        var availablity = app.getPetDetail("stage");
        if(availablity) {
            $(".detailed-result-availability").show().html(availablity);
        } else {
            $(".detailed-result-availability").hide().html('');
        }

        /* Bottom Half */

        /**
         * Fill gender and 'altered' fields
         * @type {*}
         */
        var gender  = app.getPetDetail("sex");
        var altered = app.getPetDetail("altered") == "Yes" ? (
                gender=="Male" ? (
                    "Neutered"
                ) : (
                    gender=="Female" ? (
                        "Spayed"
                    ) : (
                        "Fixed"
                    )
                )
            ) : (
                null
            );
        if(gender) {
            $(".detailed-result-gender").show().html(gender + (gender=="Unknown" ? " Gender" : '') + (altered ? " ("+altered+")" : ''));
        } else {
            $(".detailed-result-gender").hide().html('');
        }

        /**
         * Fill pet color data
         */
        var color1 = app.getPetDetail("primaryColor");
        var color2 = app.getPetDetail("secondaryColor");
        if(color1) {
            $(".detailed-result-color").show().html(color1 + (color2 ? " " + color2 : ''));
        } else {
            $(".detailed-result-color").hide().html('');
        }

        /**
         * Fill pet weight data
         */
        var weight = app.getPetDetail("BodyWeight");
        if(weight) {
            $(".detailed-result-weight").show().html(weight);
        } else {
            $(".detailed-result-weight").hide().html('');
        }

        /**
         * Fill pet age
         */
        var age = app.getPetDetail("age");
        if(age) {
            $(".detailed-result-age").show().html(monthsToYears((typeof(age)==typeof([]) ? age[0] : age)));
        } else {
            $(".detailed-result-age").hide().html('');
        }

        /**
         * Fill pet identification number
         */
        /*var petId = app.getPetDetail("id");*/
        if(petId) {
            $(".detailed-result-petid").show().html("Pet ID: " + petId);
        } else {
            $(".detailed-result-petid").hide().html('');
        }

        /**
         * Fill intake date
         */
        var intakeDate = new Date(app.getPetDetail("LastIntakeDate"));
        if(intakeDate) {
            $(".detailed-result-intake-date").show().html(
                "Intake Date: " + intakeDate.format("mmmm dS, yyyy")
            );
        } else {
            $(".detailed-result-intake-date").hide().html('');
        }

        /**
         * Fill out misc other optional data
         */
        var miscDetails = {
        	houseTrained:     app.getPetDetail("houseTrained") == "Yes" ? "House Trianed" : null,
        	onHold:           app.getPetDetail("onHold") == "Yes" ? "On Hold" : null,
            declawed:         app.getPetDetail("declawed") ? (app.getPetDetail("declawed")=="No" ? "Not" : tmpdeclawed) + " Declawed" : null,
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

        /**
         * Fill the pet's description
         */
        var desc = app.getPetDetail("dsc");
        if(desc) {
            $(".detailed-result-desc").show().html(desc.replace(/[\n\r]/g,"<br/>"));
        } else {
            $(".detailed-result-desc").hide().html('');
        }



        /**
         * Construct the share URL
         */
        https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.petango.com%2FAdopt%2FCat-Domestic-Shorthair-Purebred-19440252
        var shareLink = "http://www.petango.com/Adopt/" + (app.getPetDetail("AnimalType") + " " + primaryBreed + " " + secondaryBreed + " " + petId ).flatSpace().replace(" ", "-");
        if(shareLink.validURL()) {
            $(".fb-like").show().data("href", shareLink);
            try {
                FB.XFBML.parse();
            } catch(e) {
                app.initFacebook(function() {
                    try{FB.XFBML.parse();}catch(e){}
                });
            }
        } else {
            $(".fb-like").hide().data("href", shareLink);
        }

        $("#detailed-result").removeClass("loading").find(".detailed-result-wrap").fadeIn("fast", function() {
            /*if($(".detailed-result-img").length>1) {
                $(".detailed-result-img-wrap").overscroll({direction: 'horizontal'}).fadeOut(0).css("visibility","visible").fadeIn("fast");
            }*/

            var bottomHeight = $("#detailed-result .global-footer").offset().top - $("#detailed-result .detailed-result-bottom").offset().top;

            $(".detailed-result-bottom").css({
                "height"  : bottomHeight + "px",
                "overflow-x": "hidden",
                "overflow-y": "scroll"
            });
        });

    },
    updateFavoriteButton: function(highlighted) {
        highlighted = typeof(highlighted)!=="undefined" ? highlighted : false;
        var theme = highlighted ? 'e' : 'c';
        $('#detailed-result .detailed-result-favorite')
            .removeClass(
                'ui-btn-up-a ui-btn-up-b ui-btn-up-c ui-btn-up-d ui-btn-up-e ' +
                'ui-btn-hover-a ui-btn-hover-b ui-btn-hover-c ui-btn-hover-d ui-btn-hover-e ' +
                'ui-btn-down-a ui-btn-down-b ui-btn-down-c ui-btn-down-d ui-btn-down-e'
            )
            .addClass('ui-btn-up-' + theme)
            .attr({
                'data-theme': theme,
                'data-favorite': highlighted
            });
    },
    favoritePet: function(event, petId) {
        app.db.addFavorite(petId, $.xml2json(app.petDetails[0]));
        app.updateFavoriteButton(true);
    },
    unfavoritePet: function(event, petId) {
        app.db.removeFavorite(petId);
        app.updateFavoriteButton(false);
    }
};

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