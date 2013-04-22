/**
 * Database Class
 */

/**
 * Define the Database Class for use with the Cleveland APL PhoneGap app
 * @constructor
 */
function DB() {
    /**
     * Private Class Vaiables
     */
    var Db  = this;
    var _objTemplate = "{\"favorites\":[],\"search\":{},\"pets\":{}}";
    var _obj = {favorites: [], search: {}, pets: {}};

    /**
     * Public Class Variables
     */
    this.inited    = false;
    this.dbName    = "clevelandAPL";

    /**
     * Private Methods
     */
    function privateMethod() {
        return "privateMethod";
    }

    this.init = function() {
        var dbObj = window.localStorage.getItem(Db.dbName) || _objTemplate;
        _obj = JSON.parse(dbObj);
        if(dbObj==_objTemplate) Db.save();
    };

    this.getFavorites = function() {
        return _obj.favorites;
    };

    this.addFavorite = function(favoriteId) {
        _obj.favorites.push(favoriteId);
        return Db.save();
    };

    this.getSearch = function(key) {
        if(_obj.search.hasOwnProperty(key)) return _obj.search[key];
        return null;
    };

    this.cacheSearch = function(key, data) {
        _obj.search[key] = {
            results: data,
            cacheTimestamp: (new Date()).getTime()
        };
        return Db.save();
    }

    this.getPet = function(petId) {
        if(_obj.pets.hasOwnProperty(petId)) return _obj.pets[petId];
        return false;
    }

    this.cachePet = function(petId, petData) {
        var data = {};
        data[petId] = {
            results: petData,
            cacheTimestamp: (new Date()).getTime()
        };
        var pets = $.extend(true, {}, _obj.pets, data);
        _obj.pets = pets;
        return Db.save();
    }

    this.getDb = function() {
        return _obj;
    }

    this.save = function() {
        return window.localStorage.setItem(Db.dbName, JSON.stringify(_obj));
    };

    if(!this.inited) {
        this.inited = true;
        this.init();
    }
}