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
        site:           "",     // ?"39763",
        onHold:         "N",    // Y=Yes N=No A=Either
        orderBy:        "",     // ‘’ Empty String,‘ID’,‘Name’,‘Breed’,‘Sex’
        primaryBreed:   "All",  // All or empty=All breeds or breed ID, (for example ‘5’=Terrier)
        secondaryBreed: "",     // All or empty=All breeds or breed ID (for example ‘7’=Shepherd)
        specialNeeds:   "A",    // Y=Yes, N=No, A=Either
        noDogs:         "A",
        noCats:         "A",
        noKids:         "A"
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // Bind jQuery Events Here...
        (function($) {
            $("#hidden_search_form").bind("submit", app.procSearch);
            $(".landing").bind("pagebeforeshow",function() {
                $("#content-dnd-logo").removeAttr("class");
                app.clearSearchResults();
                app.onDeviceReady();
            });
            $("#search-results").bind("pagehide", app.clearSearchResults);
            $(".search-results-wrap").on("click", ".search-result", app.loadPetDetails);
            /*
            deBouncer($,'smartresize', 'resize', 100);
            deBouncer($,'smartscroll', 'scroll', 100);
            deBouncer($,'smartmousemove', 'mousemove', 100);
            deBouncer($,'touchpause', 'touchmove', 100);
            */
        })(jQuery);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        (function($) {
            $("#content-dnd-logo").draggable({
                revert: true,
                containment: "#content-categories"
            });

            $(".category-off").droppable({
                accept: "#content-dnd-logo",
                drop: app.initSearch
            });
        })(jQuery);
    },
    // Update DOM on a Received Event
    /*receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },*/
    // Initialize search, select category.
    initSearch: function(ev, ui) {
        var $this = $(this);
        var id    = $this.attr("id");
        var logo  = ui.draggable;
        logo.draggable({
            revert: false,
            destroy: true
        })
        .switchClass(null,id, "slow", function() {
            var species = $this.parents(".content-category").data("species-id") || 0;
            $("#hidden_search_form").trigger("submit", [species]);
        });
    },
    // Process search
    procSearch: function(e, species) {
        e.preventDefault();
        var searchData = $.extend( {
            speciesId: species
        }, app.searchDefaults);
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
            }
        })
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

        console.log({
            "numResults"   : numResults,
            "searchOffset" : app.searchOffset,
            "resultsLoaded": $(".search-result").length
        });

        if(numResults-app.searchOffset) {
            var resultSet = $(app.searchResults).clone(),
                resultSet = resultSet.splice(app.searchOffset,app.searchPerPage),
                $animal, animal, result;
            if(!resultSet) return false;
            console.log({"resultSet":resultSet});

            $(resultSet).each(function(dex) {
                $animal   = $(this);
                result    = template;
                animal    = {
                    __id__      : $animal.children("id").text(),
                    __photo__   : $animal.children("photo").text(),
                    __name__    : $animal.children("name").text(),
                    __species__ : $animal.children("species").text(),
                    __breed__   : $animal.children("primaryBreed").text().replace(",",",<br><div class='hanging-indent'></div>"),
                    __gender__  : $animal.children("sex").text(),
                    __age__     : $animal.children("age").text()
                };
                result    = array_replace(result, animal);
                $(result).appendTo(".search-results-wrap");
            });

            $("#search-results").removeClass("loading");

            $(".search-result").each(function(i) {
                if(i<app.searchOffset) return true;
                $(this).delay(10*(i-app.searchOffset)).fadeIn("fast");
            });

            app.searchOffset = (numResults - app.searchOffset < app.searchPerPage ? numResults : app.searchOffset + app.searchPerPage);

            console.log({
                "numResults"   : numResults,
                "searchOffset" : app.searchOffset,
                "resultsLoaded": $(".search-result").length
            });

            if(app.searchOffset < numResults) {
                console.log("bind smartscroll");
                $("#search-results .global-content").bind("scroll", debounce(function() {
                    console.log("scrolling" + $(this).scrollTop());
                    var scrollTarget = $("#search-results .search-results-wrap").height() - $("#search-results .global-content").height() +
                                       ($("#search-results footer").height() * 1.5);
                    console.log(scrollTarget, $("#search-results .search-results-wrap").height(),$("#search-results .global-content").height(), ($("#search-results footer").height() * 1.5));
                    if($("#search-results .global-content").scrollTop()+50 > scrollTarget) {
                        $(this).unbind("scroll");
                        app.loadSearchResults();
                    }
                }, 100));
            }
        } else {
            console.log("no search results",app.searchResults);
        }
    },
    // Clear search results
    clearSearchResults: function() {
        $("#search-results .search-result").empty().remove();
        app.searchResults = null;
        app.searchOffset  = 0;
        app.searchPerPage = 10;
    },
    // Load Pet Details: go to pet result page and load data.
    loadPetDetails: function() {
        var $this = $(this),
            petId = $this.data("animal-id");
        if(!petId) return false;
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
                animal = $("adoptableDetails", xml);
                animalDetails = app.fillPetDetails(animal);
                console.log({
                    "SearchDetailsSuccess": {
                        "animal": animal,
                        "animalDetails": animalDetails
                    }
                });
                $(animalDetails).appendTo(".detailed-result-wrap");
            },
            error: function() {
                console.log({
                    "SearchDetailsError": arguments
                });
            }
        })
    },
    // Fill Pet Details: create, fill, and return an array with the pet's details from ajax request.
    fillPetDetails: function($animal) {
        var retArr = {};
        try {
            retArr = {
                CompanyID:			        $animal.children("CompanyID").text().flatSpace(),
                ID:			                $animal.children("ID").text().flatSpace(),
                AnimalName:			        $animal.children("AnimalName").text().flatSpace(),
                Species:			        $animal.children("Species").text().flatSpace(),
                Sex:			            $animal.children("Sex").text().flatSpace(),
                Altered:			        $animal.children("Altered").text().flatSpace(),
                PrimaryBreed:			    $animal.children("PrimaryBreed").text().flatSpace(),
                SecondaryBreed:			    $animal.children("SecondaryBreed").text().flatSpace(),
                PrimaryColor:			    $animal.children("PrimaryColor").text().flatSpace(),
                SecondaryColor:			    $animal.children("SecondaryColor").text().flatSpace(),
                Age:			            $animal.children("Age").text().flatSpace(),
                Size:			            $animal.children("Size").text().flatSpace(),
                Housetrained:			    $animal.children("Housetrained").text().flatSpace(),
                Declawed:			        $animal.children("Declawed").text().flatSpace(),
                Price:			            $animal.children("Price").text().flatSpace(),
                LastIntakeDate:			    $animal.children("LastIntakeDate").text().flatSpace(),
                Location:			        $animal.children("Location").text().flatSpace(),
                Dsc:			            $animal.children("Dsc").text().flatSpace(),
                Photos:                     $.makeArray($animal.children("Photo*").text().flatSpace()),
                OnHold:			            $animal.children("OnHold").text().flatSpace(),
                SpecialNeeds:			    $animal.children("SpecialNeeds").text().flatSpace(),
                NoDogs:			            $animal.children("NoDogs").text().flatSpace(),
                NoCats:			            $animal.children("NoCats").text().flatSpace(),
                NoKids:			            $animal.children("NoKids").text().flatSpace(),
                BehaviorResult:			    $animal.children("BehaviorResult").text().flatSpace(),
                MemoList:                   {},
                Site:			            $animal.children("Site").text().flatSpace(),
                DateOfSurrender:			$animal.children("DateOfSurrender").text().flatSpace(),
                TimeInFormerHome:			$animal.children("TimeInFormerHome").text().flatSpace(),
                ReasonForSurrender:			$animal.children("ReasonForSurrender").text().flatSpace(),
                PrevEnvironment:			$animal.children("PrevEnvironment").text().flatSpace(),
                LivedWithChildren:			$animal.children("LivedWithChildren").text().flatSpace(),
                LivedWithAnimals:			$animal.children("LivedWithAnimals").text().flatSpace(),
                LivedWithAnimalTypes:		$animal.children("LivedWithAnimalTypes").text().flatSpace(),
                BodyWeight:			        $animal.children("BodyWeight").text().flatSpace(),
                DateOfBirth:			    $animal.children("DateOfBirth").text().flatSpace(),
                ARN:			            $animal.children("ARN").text().flatSpace(),
                VideoID:			        $animal.children("VideoID").text().flatSpace(),
                Stage:			            $animal.children("Stage").text().flatSpace(),
                AnimalType:			        $animal.children("AnimalType").text().flatSpace(),
                AgeGroup:			        $animal.children("AgeGroup").text().flatSpace(),
                WildlifeIntakeInjury:		$animal.children("WildlifeIntakeInjury").text().flatSpace(),
                WildlifeIntakeCause:		$animal.children("WildlifeIntakeCause").text().flatSpace(),
                BuddyID:			        $animal.children("BuddyID").text().flatSpace()
            };
        } catch(e) {
            retArr = null;
        }
        return retArr;
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

/*

var example_details_getting = {
    CompanyID: $animal.children("CompanyID").text(),
    ID: $animal.children("ID").text(),
    AnimalName: $animal.children("AnimalName").text(),
    Species: $animal.children("Species").text(),
    Sex: $animal.children("Sex").text(),
    Altered: $animal.children("Altered").text(),
    PrimaryBreed: $animal.children("PrimaryBreed").text(),
    SecondaryBreed: $animal.children("SecondaryBreed").text(),
    PrimaryColor: $animal.children("PrimaryColor").text(),
    SecondaryColor: $animal.children("SecondaryColor").text(),
    Age: $animal.children("Age").text(),
    Size: $animal.children("Size").text(),
    Housetrained: $animal.children("Housetrained").text(),
    Declawed: $animal.children("Declawed").text(),
    Price: $animal.children("Price").text(),
    LastIntakeDate: $animal.children("LastIntakeDate").text(),
    Location: $animal.children("Location").text(),
    Dsc: $animal.children("Dsc").text(),
    Photos: $.makeArray($animal.children("Photo*").text()),
    OnHold: $animal.children("OnHold").text(),
    SpecialNeeds: $animal.children("SpecialNeeds").text(),
    NoDogs: $animal.children("NoDogs").text(),
    NoCats: $animal.children("NoCats").text(),
    NoKids: $animal.children("NoKids").text(),
    BehaviorResult: $animal.children("BehaviorResult").text(),
    MemoList: {},
    Site: $animal.children("Site").text(),
    DateOfSurrender: $animal.children("DateOfSurrender").text(),
    TimeInFormerHome: $animal.children("TimeInFormerHome").text(),
    ReasonForSurrender: $animal.children("ReasonForSurrender").text(),
    PrevEnvironment: $animal.children("PrevEnvironment").text(),
    LivedWithChildren: $animal.children("LivedWithChildren").text(),
    LivedWithAnimals: $animal.children("LivedWithAnimals").text(),
    LivedWithAnimalTypes: $animal.children("LivedWithAnimalTypes").text(),
    BodyWeight: $animal.children("BodyWeight").text(),
    DateOfBirth: $animal.children("DateOfBirth").text(),
    ARN: $animal.children("ARN").text(),
    VideoID: $animal.children("VideoID").text(),
    Stage: $animal.children("Stage").text(),
    AnimalType: $animal.children("AnimalType").text(),
    AgeGroup: $animal.children("AgeGroup").text(),
    WildlifeIntakeInjury: $animal.children("WildlifeIntakeInjury").text(),
    WildlifeIntakeCause: $animal.children("WildlifeIntakeCause").text(),
    BuddyID: $animal.children("BuddyID").text()
};*/
