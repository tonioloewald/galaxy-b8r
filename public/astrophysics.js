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

const starTypeData = {
	"O": {
		luminosity: 50000,
		color: 'rgb(255,192,255)',
		planets: [0,3]
	},
	"B": {
		luminosity: 15000,
		color: 'rgb(192,160,255)',
		planets: [1,5]
	},
	"A": {
		luminosity: 25,
		color: 'rgb(128,192,255)',
		planets: [1,7]
	},
	"F": {
		luminosity: 2.5,
		color: 'rgb(160,255,128)',
		planets: [1,11]
	},
	"G": {
		luminosity: 1,
		color: 'rgb(255,255,64)',
		planets: [1,19]
	},
	"K": {
		luminosity: 0.25,
		color: 'rgb(255,192,64)',
		planets: [1,9]
	},
	"M": {
		luminosity: 0.05,
		color: 'rgb(255,64,0)',
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
const fixed_value = val => (() => val);

var atmosphereData = {
  Breathable: {albedo: 0.2, density: 1},
  Filterable: {albedo: 0.3, density: 1},
  Inert: {albedo: 0.1, density: 0.5},
  Corrosive: {albedo: 0.5, density: 2},
  Toxic: {albedo: 0.4, density: 1.5},
  Trace: {albedo: 0.05, density: 0.1},
  Crushing: {albedo: 0.8, density: 100},
};

function HI( insolation, radius, density, hydrographics, atmosphere ){
  const g = gravity(radius, density).toFixed(2);
  const {albedo} = atmosphereData[atmosphere];
  const tempK = blackbody( insolation, albedo + hydrographics * 0.002 ).toFixed(1);
  var tempC = (tempK - 275.15);
  var temp;
  if(tempC < -150) {
    temp = "frigid";
  } else if (tempC < -80) {
    temp = "extremely cold";
  } else if (tempC < -40) {
    temp = "very cold";
  } else if (tempC < -10) {
    temp = "cold";
  } else if (tempC < 30) {
    temp = "temperate";
  } else if (tempC < 50) {
    temp = "hot";
  } else if (tempC < 90) {
    temp = "very hot";
  } else if (tempC < 150) {
    temp = "extremely hot";
  } else {
    temp = "inferno";
  }
  tempC = tempC.toFixed(1);
  var data;
  if( atmosphere === "Breathable" && hydrographics > 0 && g < 1.25 && ['cold','hot','temperate'].indexOf(temp) > -1 ){
    data = {HI: 1, description: 'earthlike'};
  } else if ( ['Breathable', 'Filterable'].indexOf(atmosphere) > -1 && g < 2 && ['inferno', 'extremely hot', 'extremely cold', 'frigid'].indexOf(temp) === -1 ){
    data = {HI: 2, description: 'survivable'};
  } else if ( atmosphere === "Crushing" || g > 3 || ['inferno', 'frigid'].indexOf(temp) > -1 ){
    data = tempC > 800 ? {HI: 5, description: 'inimical'} : {HI: 4, description: 'robot accessible'};
  } else {
    data = {HI: 3, description: 'EVA possible'};
  }
  return Object.assign(data, {g, albedo, tempC, temp});
}

var planetTypeData = [
	{
		classification: "rocky",
		radius: [1000, 15000],
		density: [2, 8],
		hydrographics: function( pnrg, insolation, radius, density ){
			var g = gravity( radius, density ),
					tempK = blackbody( insolation, 0 );
			return Math.clamp(pnrg.realRange(-50, 150 - Math.abs(tempK - 270)) * g - Math.abs( density - 5.5 ) * 10, 0, 100).toFixed(0);
		},
		atmosphere: function( pnrg, insolation, radius, density, hydrographics ){
			if( hydrographics > 0 && insolation > 0.25 && insolation < 2 ){
				return pnrg.pick(['Breathable', 'Filterable', 'Inert', 'Toxic', 'Corrosive', 'Trace'], [1,2,2,1,1,1]);
			} else {
				return pnrg.pick(['Breathable', 'Filterable', 'Inert', 'Toxic', 'Corrosive', 'Trace'], [1,2,3,4,5,5]);
			}
		},
		HI
	},
	{
		classification: "gas giant",
		radius: [15000, 120000],
		density: [0.6, 2.0],
		hydrographics: fixed_value(0),
		atmosphere: fixed_value("Crushing"),
		HI
	},
	{
		classification: "brown dwarf",
		radius: [120000, 250000],
		density: [0.6, 2.0],
		hydrographics: fixed_value(0),
		atmosphere: fixed_value("Crushing"),
		HI
	}
];

export {
  gravity,
  blackbody,
  starTypeData,
  planetTypeData,
};