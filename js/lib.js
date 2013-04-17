/**
 * Javascript Misc. Library Functions
 */

/**
 * Object Prototypes
 */

    String.prototype.flatSpace = function() {
        return this.replace(/[\n\r]+/ig,"").replace(/\s+/ig," ").replace(/^\s$/,"");
    };

    String.prototype.validURL = function() {
        var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
        return (!pattern.test(this));
    };

    Array.prototype.clean = function(deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

/**
 * General Library Functions
 */

    /**
     * Replaces occurances of each array key in the string with the array value for that key.
     *
     * @param str
     * @param arr
     * @returns {*}
     */
    function array_replace(str, arr) {
        for(i in arr) {
            str = str.replace(new RegExp(i),arr[i]);
        }
        return str;
    }

    var deBouncer = function($,cf,of, interval){
        // deBouncer by hnldesign.nl
        // based on code by Paul Irish and the original debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        var debounce = function (func, threshold, execAsap) {
            var timeout;
            return function debounced () {
                var obj = this, args = arguments;
                function delayed () {
                    if (!execAsap)
                        func.apply(obj, args);
                    timeout = null;
                }
                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);
                timeout = setTimeout(delayed, threshold || interval);
            };
        };
        jQuery.fn[cf] = function(fn){  return fn ? this.bind(of, debounce(fn)) : this.trigger(cf); };
    };

    function debounce(func, wait, immediate) {
        var timeout, result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    }

    function calcAge(dateString) {
        var birthday = +new Date(dateString);
        return ~~((Date.now() - birthday) / (31557600000));
    }

    function monthsToYears(months) {
        var years = ~~(months / 12);
        var extra = ~~(months % 12);
        return years + " year" + (years>1?"s":'') + (extra ? " " + extra + " month"+(extra>1?"s":''):'');
    }

    function cleanObject(obj, delVal) {
        for (i in obj) {
            if (obj[i] === null || obj[i] === delVal) {
                delete obj[i];
            }
        }
        return obj;
    }

/**
 * Some jQuery stuff
 */
var $_;
(function($, $_) {
    $_ = function(selector, context) {

    };
})(jQuery, $_);