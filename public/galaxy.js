import { PRNG } from './prng.js'
import { isBadWord } from './badwords.js'
import { randomName } from './random-name.js'
import { Star } from './star.js'

const DEFAULTS = {
  spiralArms: 4,
  spiralAngleDegrees: 240,
  minRadius: 0.02,
  maxRadius: 0.9,
  thickness: 0.06
}

function galaxy (seed, numberOfStars, options = {}) {
  const {
    spiralArms,
    spiralAngleDegrees,
    minRadius,
    maxRadius,
    thickness
  } = Object.assign(options, DEFAULTS)
  const scatterTheta = Math.PI / spiralArms * 0.2
  const scatterRadius = minRadius * 0.4
  const spiralB = spiralAngleDegrees / Math.PI * minRadius / maxRadius
  const start = Date.now()
  const names = []
  const rejects = { badwords: 0, duplicates: 0 }
  const stars = []
  let i,
    position

  const pseudoRandom = new PRNG(seed)

  for (i = 0; i < numberOfStars; i++) {
    const numberOfSyllables = Math.floor(pseudoRandom.value() * 2 + 2)
    let newName

    while (true) {
      newName = randomName(pseudoRandom, numberOfSyllables)
      if (names.indexOf(newName) >= 0) {
        rejects.duplicates++
      } else if (isBadWord(newName)) {
        rejects.badwords++
      } else {
        break
      }
    }
    names.push(newName)
    const star = new Star(newName, pseudoRandom.range(1, 100000))

    let x, y, r = pseudoRandom.realRange(minRadius, maxRadius)

    if (star.detail.inSpiralArm) {
      r += pseudoRandom.gaussrandom(scatterRadius)
      let theta = spiralB * Math.log(r / maxRadius) + pseudoRandom.gaussrandom(scatterTheta)
      theta += pseudoRandom.range(0, spiralArms - 1) * Math.PI * 2 / spiralArms
      x = Math.cos(theta) * r
      y = Math.sin(theta) * r
    } else {
      r *= pseudoRandom.realRange(1, 1.1)
      const theta = pseudoRandom.realRange(0, Math.PI * 2)
      x = Math.cos(theta) * r
      y = Math.sin(theta) * r
    }

    const z = pseudoRandom.gaussrandom(thickness * 0.5 * (1 - r))
    star.position = { x, y, z } 

    stars.push(star)
  }

  stars.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))

  stars.forEach(star => {
    const x = star.position.x * 1000 + 1000
    const y = star.position.y * 1000 + 1000
    const z = star.position.z * 1000 + 1000

    star._transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(0deg)`
    let s = Math.log(star.detail.luminosity) + 4
    s = Math.max(Math.min(s, 20), 2) * 0.5
    star.scale = s/5
    const color = star.detail.template.color
    star._x = x.toFixed(1)
    star._y = y.toFixed(1)
    star._z = z.toFixed(1)
    star._cx = (star.position.x * 50000).toFixed(2)
    star._cy = (star.position.y * 50000).toFixed(2)
    star._cz = (star.position.z * 50000).toFixed(2)
    star._r = s
    star._starStyle = {
      width: s + 'px',
      height: s + 'px',
      backgroundColor: color,
      border: `${s * 0.25}px solid rgba(0,0,0,0.7)`
    }
  })

  console.log('names rejected', rejects)
  console.log('generate elapsed', (((new Date()).getTime() - start) * 0.001).toFixed(3) + 's')

  return { stars }
}

export { galaxy }
