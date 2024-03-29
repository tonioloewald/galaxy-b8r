'use strict'

import { gravity, blackbody, planetTypeData } from './astrophysics.js'
import { capitalize, objToHTML } from './utils.js'
import { PRNG } from './prng.js'

class Planet {
  constructor (name, seed, orbitalRadius, insolation) {
    this.name = name
    this.seed = seed
    this.orbitalRadius = orbitalRadius // AU
    this.insolation = insolation // Earth incident radiation from Sol == 1

    return this
  }

  detail () {
    const pseudoRandom = new PRNG(this.seed)
    const detail = {}

    detail.name = this.name
    detail.orbitalRadius = this.orbitalRadius.toFixed(2)
    detail.insolation = this.insolation.toFixed(2)
    detail.blackbodyK = blackbody(detail.insolation)

    const template = pseudoRandom.pick(planetTypeData, [detail.insolation * 100, 10, 1])

    detail.classification = template.classification
    detail.radius = pseudoRandom.range(template.radius[0], template.radius[1])
    detail.density = pseudoRandom.realRange(template.density[0], template.density[1])
    detail.gravity = gravity(detail.radius, detail.density)
    detail.hydrographics = template.hydrographics(pseudoRandom, detail.insolation, detail.radius, detail.density)
    detail.atmosphere = template.atmosphere(pseudoRandom, detail.insolation, detail.radius, detail.density, detail.hydrographics)
    Object.assign(detail, template.HI(detail.insolation, detail.radius, detail.density, detail.hydrographics, detail.atmosphere))
    return detail
  }

  description () {
    let output = ''
    output += '<h3>' + capitalize(this.name) + '</h3>\n'
    output += objToHTML(this.detail())
    return output
  }
}

export { Planet }
