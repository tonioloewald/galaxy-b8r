import { romanNumeral, capitalize, objToHTML } from './utils.js'
import { starTypeData } from './astrophysics.js'
import { Planet } from './planet.js'
import { PRNG } from './prng.js'

class Star {
  constructor (name, seed, position) {
    this.name = name
    this.seed = seed
    this.position = position

    return this
  }

  detail () {
    const pseudoRandom = new PRNG(this.seed)
    const detail = {}
    // actual frequency
    // spectralClass = pseudoRandom.pick(["O","B","A","F","G","K","M"], [0.0001,0.2,1,3,8,12,76]),
    const spectralClass = pseudoRandom.pick(['O', 'B', 'A', 'F', 'G', 'K', 'M'], [0.0001, 0.2, 1, 3, 8, 12, 20])
    const spectralIndex = pseudoRandom.range(0, 9)
    const stellarTemplate = starTypeData[spectralClass]

    detail.spectralType = spectralClass + spectralIndex
    detail.luminosity = stellarTemplate.luminosity * (4 / (spectralIndex + 2))
    detail.numberOfPlanets = pseudoRandom.range(stellarTemplate.planets[0], stellarTemplate.planets[1])
    detail.planetSeed = pseudoRandom.range(0, 1000000)
    detail.template = stellarTemplate

    return detail
  }

  planets () {
    const detail = this.detail()
    const planets = []
    const pseudoRandom = new PRNG(detail.planetSeed)
    const radiusMin = 0.4 * pseudoRandom.realRange(0.5, 2)
    const radiusMax = 50 * pseudoRandom.realRange(0.5, 2)
    const totalWeight = (Math.pow(detail.numberOfPlanets, 2) + detail.numberOfPlanets) * 0.5
    let r = radiusMin

    for (let i = 0; i < detail.numberOfPlanets; i++) {
      r += i / totalWeight * pseudoRandom.realRange(0.5, 1) * (radiusMax - radiusMin)
      planets.push(new Planet(capitalize(this.name) + '-' + romanNumeral(i + 1), pseudoRandom.range(0, 100000), r, detail.luminosity / Math.pow(r, 2)))
    }

    return planets
  }

  planetsDetail () {
    return this.planets().map(planet => planet.detail())
  }

  habitability () {
    if (!this._habitability) {
      const list = this.planetsDetail().map(detail => detail.HI).sort()
      this._habitability = list.length ? list.shift() : 5
    }
    return this._habitability
  }

  description () {
    let output = ''
    output += '<h3>' + capitalize(this.name) + '</h3>\n'
    output += objToHTML(this.detail(), true)
    for (const planet of this.planets()) {
      output += '<div class="subrecord">' + planet.description() + '</div>'
    }
    return output
  }
}

export { Star }
