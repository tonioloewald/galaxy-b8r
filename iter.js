(function(window) {
    if (window.Iter) {
        return;
    }

    function compare(a, b, f) {
        var different = false,
            i;
        if (f === undefined) {
            f = function(a, b) {
                if (typeof a !== "object" || typeof b !== "object") {
                    return a === b;
                } else {
                    return compare(a, b, arguments.callee);
                }
            };
        }
        for (i in a) {
            if (typeof a[i] !== "function" && !f(a[i], b[i])) {
                different = true;
                break;
            }
        }
        if (!different) {
            for (i in b) {
                if (typeof b[i] !== "function" && !f(a[i], b[i])) {
                    different = true;
                    break;
                }
            }
        }
        return !different;
    }

    function each(a, f) {
        for (var i in a) {
            if (typeof a[i] !== "function") {
                if (f(a[i]) === false) {
                    break;
                }
            }
        }
        return a;
    }

    function filter(a, f, match) {
        var filtered = [];
        if (match === undefined) {
            match = true;
        }
        for (var i in a) {
            if (typeof a[i] !== "function" && f(a[i]) === match) {
                filtered.push(a[i]);
            }
        }
        return filtered;
    }

    function repeat(iterations, f, match_and_exit) {
        if (match_and_exit === undefined) {
            match_and_exit = false;
        }
        for (var i = 0; i < iterations; i++) {
            if (f(i) === match_and_exit) {
                break;
            }
        }
    }

    function map(a, f) {
        var results = [];
        this.each(a, function(elt) {
            results.push(f(elt));
        });
        return results;
    }

    function range(first, last) {
        var results = [];
        for (var i = first; i <= last; i++) {
            results.push(i);
        }
        return results;
    }

    function reduce(a, f) {
        var result = a[0];
        for (var i = 1; i < a.length; i++) {
            result = f(result, a[i]);
        }
        return result;
    }
    
    function keys( a ){
    		var result = [], idx;
    		each( a, function( item ){
    				result.push( item );
    		} );
    		return result;
    }

    window.Iter = {
    	compare: compare,
    	each: each,
    	map: map,
    	repeat: repeat,
    	range: range,
    	reduce: reduce,
    	filter: filter,
    	keys: keys
    };
})(window);