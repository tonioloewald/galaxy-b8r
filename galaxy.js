/* global module, require, console */
'use strict';

function galaxy(seed, number_of_stars){
  const PRNG = require('prng.js');
  const {isBadWord} = require('badwords.js');
  const random_name = require('random_name.js');
  const Star = require('star.js');
  const spiral_arms = 2,
        spiral_angle_degrees = 360,
        min_radius = 0.05, 
        max_radius = 0.9,
        thickness = 0.1,
        scatter_theta = Math.PI / spiral_arms * 0.2,
        scatter_radius = min_radius * 0.4,
        spiral_b = spiral_angle_degrees / Math.PI * min_radius / max_radius,
        start = (new Date()).getTime(),
        names = [],
        rejects = { badwords: 0, duplicates: 0 },
        stars = [];
  var i,
      position;
  
  var pseudoRandom = new PRNG(seed);
  
  for( i = 0; i < number_of_stars; i++ ){
    var number_of_syllables = Math.floor( pseudoRandom.value() * 2 + 2 ),
        new_name;
    
    while( true ){
      new_name = random_name( pseudoRandom, number_of_syllables );
      if( names.indexOf( new_name ) >= 0 ){
        rejects.duplicates++;
      } else if ( isBadWord(new_name) ) {
        rejects.badwords++;
      } else {
        break;
      }
    }
    names.push( new_name );
    
    var r = pseudoRandom.realRange(min_radius, max_radius );
    var theta = spiral_b * Math.log( r / max_radius ) + pseudoRandom.gaussrandom( scatter_theta );
    r += pseudoRandom.gaussrandom( scatter_radius );
    // assign to a spiral arm
    theta += pseudoRandom.range(0, spiral_arms - 1) * Math.PI * 2 / spiral_arms;
    position = {
      x: Math.cos(theta) * r,
      y: Math.sin(theta) * r,
      z: pseudoRandom.gaussrandom( thickness * 0.5 )
    };

    stars.push(new Star( new_name, pseudoRandom.range(1,100000), position )  );
  }
  
  stars.sort( (a, b) => a.name > b.name ? 1 : ( a.name < b.name ? -1 : 0 ) );
  
  stars.forEach(star => {
    const x = star.position.x * 1000 + 1000;
    const y = star.position.y * 1000 + 1000;
    const z = star.position.z * 1000 + 1000;
    
    star._transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(0deg)`;
    star._detail = star.detail();
    var s = Math.log(star._detail.luminosity) + 8;
    s = Math.max(Math.min(s, 20), 2);
    const color = star._detail.template.color;
    star._x = x.toFixed(1);
    star._y = y.toFixed(1);
    star._z = z.toFixed(1);
    star._cx = (star.position.x * 50000).toFixed(2);
    star._cy = (star.position.y * 50000).toFixed(2);
    star._cz = (star.position.z * 50000).toFixed(2);
    star._r = s;
    star._star_style = {
      width: s + 'px',
      height: s + 'px',
      backgroundColor: color,
      border: `${s * 0.25}px solid rgba(0,0,0,0.7)`,
    };
  });
  
  console.log( 'names rejected', rejects );
  console.log( 'generate elapsed', (((new Date()).getTime() - start) * 0.001).toFixed(3) + "s" );
  
  return {stars};
}

module.exports = galaxy;