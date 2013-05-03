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
        return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(this);
    };

    /*Array.prototype.clean = function(deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };*/

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
        return (years > 0 ? (years + " year" + (years>1?"s":'')) : '') + (extra ? " " + extra + " month"+(extra>1?"s":''):'');
    }

    function cleanObject(obj, delVal) {
        for (i in obj) {
            if (obj[i] === null || obj[i] === delVal) {
                delete obj[i];
            }
        }
        return obj;
    }

function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type="mousemove"; break;
        case "touchend":   type="mouseup"; break;
        default: return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //           screenX, screenY, clientX, clientY, ctrlKey,
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function functionName(fun) {
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}

function count(obj) {
    if(typeof(obj)!==typeof({})) return false;
    var count = 0;
    for(var i in obj) {
        count++
    }
    return count;
}

function x2(delay, func) {
    var args = $.makeArray(arguments).slice(2) || [];
    var that = this.caller;
    func.apply(that, args);
    setTimeout(function() {
        func.apply(that,args);
    }, delay);
}

function xn(times, delay, func) {
    var args = $.makeArray(arguments).slice(3) || [];
    var orgArgs = arguments;
    orgArgs[0]--;
    var that = this.caller;
    func.apply(that, args);
    if(times==1) return;
    setTimeout(function() {
        xn.apply(that,orgArgs);
    }, delay);
}

function x2if(condition, delay, func) {
    var args = $.makeArray(arguments).slice(2) || [];
    var that = this.caller;
    func.apply(that, args);
    if(eval(condition)) {
        setTimeout(function() {
            func.apply(that,args);
        }, delay);
    }
}

function xnif(condition, times, delay, func) {

}

/**
 * Some jQuery stuff
 */
var $_;
(function($, $_) {
    $_ = function(selector, context) {

    };
})(jQuery, $_);