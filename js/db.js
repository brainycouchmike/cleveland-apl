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
    var _objTemplate = "{\"favorites\":{},\"search\":{},\"pets\":{}}";
    var _obj = {favorites: {}, search: {}, pets: {}};

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

    this.addFavorite = function(favoriteId, favoriteData) {
        _obj.favorites[favoriteId] = favoriteData;
        return Db.save();
    };

    this.removeFavorite = function(favoriteId) {
        if(typeof(_obj.favorites[favoriteId])=="undefined") return false;
        delete _obj.favorites[favoriteId];
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
        var retval = false;
        try {
            window.localStorage.setItem(Db.dbName, JSON.stringify(_obj));
            retval = true;
        } catch(ex) {
            console.log("DB.save: " + ex.toString());
            retval = false;
        }
        return retval;
    };

    if(!this.inited) {
        this.inited = true;
        this.init();
    }
}