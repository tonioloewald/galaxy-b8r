// standard clamp function -- clamps a value into a range
Math.clamp = function(a, min, max){
	return a < min ? min : ( a > max ? max : a );
};

// linear interpolation from a to b by parameter t
Math.lerp = function(a, b, t) {
  return a * (1 - t) + b * t;
};

// dumb ass roman numeral generator for naming planets after their star
export const romanNumeral = n => {
	var units = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];
	
	if( !n ){
	    return "";
	} else if( n < 0 || n >= 20 ){
		return n;
	} else if( n >= 10 ){
		return "x" + romanNumeral(n-10);
	} else {
		return units[n-1];
	}
};

// capitalizes first character of a string
String.prototype.capitalize = function(){
	if( this ){
		return this.substr(0,1).toUpperCase() + this.substr(1);
	} else {
		return '';
	}
};

// renders an object / array as HTML
Object.prototype.toHTML = function( recurse ){
	var html = '';
	for( var key in this ){
		var label = key.replace(/([a-z])([A-Z])/g, '$1 $2').capitalize();
		
		switch( typeof( this[key] ) ){
			case 'string':
				html += '<b>' + label + '</b>: ' + this[key] + '<br/>\n';
				break;
			case 'number':
				if( this[key] % 1 === 0 ){
					html += '<b>' + label + '</b>: ' + this[key] + '<br/>\n';
				} else {
					html += '<b>' + label + '</b>: ' + this[key].toFixed(2) + '<br/>\n';
				}
				break;
			case 'object':
				if( recurse ){
				    html += '<h4>' + label + '</h4>\n';
					if( this[key] !== null ){
						var obj = this[key];
						if( obj.length !== undefined ){
							html += obj.toHTML( recurse );
						} else {
							html += '<div class="subrecord">' + obj.toHTML( recurse ) + '</div>';
						}
					}
				}
				break;
		}
	}
	return html;
};

Array.prototype.toHTML = Object.prototype.toHTML;