/*
	Rough and ready astrophysics data and functions
*/

// gravity (in Earth "g"s) from radius and density
function gravity( radius, density ){
	return density / 5.56 * radius / 6557;
}

// black body temperature given insolation (1.0 = Earth flux from Sol)
function blackbody( insolation, albedo ){
	if( albedo === undefined ){
		albedo = 0;
	}
	return Math.pow((1367 * insolation * (1 - albedo) )/ (4 * 0.0000000567), 0.25);
}

/*
	Stars
	=====
*/

var starTypeData = {
	"O": {
		luminosity: 50000,
		color: 'rgb(192,128,255)',
		planets: [0,3]
	},
	"B": {
		luminosity: 15000,
		color: 'rgb(128,192,255)',
		planets: [1,5]
	},
	"A": {
		luminosity: 25,
		color: 'rgb(128,192,255)',
		planets: [1,7]
	},
	"F": {
		luminosity: 2.5,
		color: 'rgb(220,255,192)',
		planets: [1,11]
	},
	"G": {
		luminosity: 1,
		color: 'rgb(255,192,64)',
		planets: [1,19]
	},
	"K": {
		luminosity: 0.25,
		color: 'rgb(255,128,64)',
		planets: [1,9]
	},
	"M": {
		luminosity: 0.05,
		color: 'rgb(255,100,0)',
		planets: [1,5]
	},
	"black hole": {
	    luminosity: 100000,
	    color: 'rgb(128,0,64)',
	    planets: [0,0]
	}
};

/*
	Planets
	=======
	
	radius --> km (Earth = 6357)
	density --> g/cc (Earth = 5.52)
	hydrographics --> percentage of planet covered in water
	
	HI --> Habitability Index
	1  --> Earthlike
	2  --> Survivable
	3  --> EVA possible
	4  --> Robot accessible
	5  --> Inimical
*/

// Convenience factory function for creating a fixed-value function
function fixed_value( val ){
	return function(){
		return val;
	}
}

var planetTypeData = [
	{
		classification: "rocky",
		radius: [1000, 15000],
		density: [2, 8],
		hydrographics: function( pnrg, insolation, radius, density ){
			var g = gravity( radius, density ),
					tempK = blackbody( insolation, 0 );
			return Math.clamp(pnrg.realRange(-50, 150 - Math.abs(tempK - 270)) * g - Math.abs( density - 5.5 ) * 10, 0, 100);
		},
		atmosphere: function( pnrg, insolation, radius, density, hydrographics ){
			var g = gravity( radius, density );
			if( hydrographics > 0 && insolation > 0.25 && insolation < 2 ){
				return pnrg.pick(['Breathable', 'Filterable', 'Inert', 'Toxic', 'Corrosive', 'Trace'], [1,2,2,1,1,1]);
			} else {
				return pnrg.pick(['Breathable', 'Filterable', 'Inert', 'Toxic', 'Corrosive', 'Trace'], [1,2,3,4,5,5]);
			}
		},
		HI: function( insolation, radius, density, hydrographics, atmosphere ){
			var g = gravity( radius, density ),
					tempK = blackbody( insolation, 0 );
			if( atmosphere === "Breathable" && hydrographics > 0 && g < 1.25 && tempK > 230 && tempK < 280 ){
				return 1;
			} else if ( (atmosphere === "Breathable" || atmosphere === 'Filterable') && g < 2 && tempK > 200 && tempK < 310 ){
				return 2;
			} else if ( atmosphere === "Corrosive" || g > 2 || tempK > 400 ){
				return tempK > 1000 ? 5 : 4;
			} else {
				return 3;
			}
		}
	},
	{
		classification: "gas giant",
		radius: [15000, 120000],
		density: [0.6, 2.0],
		hydrographics: fixed_value(0),
		atmosphere: fixed_value("Crushing"),
		HI: fixed_value(4)
	},
	{
		classification: "brown dwarf",
		radius: [120000, 250000],
		density: [0.6, 2.0],
		hydrographics: fixed_value(0),
		atmosphere: fixed_value("Crushing"),
		HI: fixed_value(5)
	}
];

if (module) {
  module.exports = {
    blackbody,
    starTypeData,
    planetTypeData
  }
}