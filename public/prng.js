import {MersenneTwister} from './mersenne_twister.js';

// Pseudo-random number generator -- convenience wrapper for Mersenne Twister
export function PRNG( seed ){
	this.mt = new MersenneTwister(seed);
	
	return this;
}

PRNG.prototype.value = function(){
	return this.mt.random();
};

PRNG.prototype.range = function( min, max ){
	return Math.floor( this.value() * (max - min + 1) + min );
};

PRNG.prototype.realRange = function( min, max, skew_function ){
	var v = this.value();
	if( typeof skew_function === 'function' ){
		v = skew_function(v);
	}
	return v * (max - min) + min;
};

PRNG.prototype.gaussrandom = function( dev ){
/*
	Box Muller transform per Knuth
*/
    var X;
    var context = this.gaussrandom.context;
    if( context === undefined ){
        context = this.gaussrandom.context = { phase: 0 };
    }
    if( context.phase === 0 ){
        do {
            context.V1 = this.realRange(-1,1);
            context.V2 = this.realRange(-1,1);
            context.S = context.V1 * context.V1 + context.V2 * context.V2;
        } while( context.S >= 1 || context.S === 0 );
        
        X = context.V1 * Math.sqrt( -2 * Math.log(context.S) / context.S );
    } else {
        X = context.V2 * Math.sqrt( -2 * Math.log(context.S) / context.S );
    }
    
    context.phase = 1 - context.phase;
    
    if( dev === undefined ){
        dev = 1.0;
    }
    
    return X * dev;
};

// Benchmark gaussian randoms
/*
(function(){
    function benchmark( expr, iterations ){
        var f = eval( "(function(){" + expr + "})" ),
            start = (new Date()).getTime(),
            i;
        if( iterations === undefined ){
            iterations = 1000;
        }
        for( i = 0; i < iterations; i++ ){
            f();
        }
        console.log ("benchmark", iterations, " x ", expr, ((new Date()).getTime() - start) + "ms");
    }
    
    var p = new PRNG();
    benchmark('var r = p.gaussrandom();', 100000);
}());
*/

PRNG.prototype.pick = function( a, weights ){
	var s = 0, idx;
	if( weights !== undefined ){
		for( idx = 0; idx < weights.length; idx++ ){
			s += weights[idx];
		}
		s = this.value() * s;
		for( idx = 0; idx < weights.length; idx++ ){
			s -= weights[idx];
			if( s < 0 ){
				break;
			}
		}
	} else {
		idx = this.range(0, a.length - 1);
	}
	return a[idx];
};