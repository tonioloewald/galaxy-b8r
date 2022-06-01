/* global requestAnimationFrame */

import b8r from '../node_modules/@tonioloewald/b8r/source/b8r.js'
import { galaxy } from './galaxy.js'
import babylon from './babylon.js'

window.b8r = b8r
b8r.makeComponent('babylon', babylon)
const settings = { count: 10000, seed: 1234, filter: { search: '', habitability: 5 } }
if (window.location.hash) {
  try {
    const hash = JSON.parse(unescape(window.location.hash.substr(1)))
    for (const key in hash) {
      settings[key] = hash[key]
    }
  } catch (e) {}
}
b8r.reg.settings = settings

function update () {
  window.location.hash = JSON.stringify(b8r.getByPath('settings'))
}

function pickStar (evt, target) {
  const star = b8r.getListInstance(target)
  if (!target.matches('.current')) {
    const idx = b8r.getByPath('galaxy', 'stars').indexOf(star)
    b8r.reg.settings.star = idx
    b8r.reg.system = { star, planets: star.planetsDetail() }

    const { SPS } = b8r.reg['galaxy-controls'].stars
    const particle = SPS.particles[idx]
    b8r.findOne('.babylon-component').data.animateCameraMove(particle.position, 4)
    update()
  }
}

function pickStar3d (evt, target) {
  const { pickResult } = target.data
  const { SPS, mesh } = b8r.reg['galaxy-controls'].stars
  if (pickResult.pickedMesh === mesh) {
    const { idx } = SPS.pickedParticle(pickResult) // why it doesn't just return the particle...?
    const star = b8r.reg.galaxy.stars[idx]
    b8r.reg.settings.star = idx
    b8r.reg.system = { star, planets: star.planetsDetail() }
    const particle = SPS.particles[idx]
    b8r.findOne('.babylon-component').data.animateCameraMove(particle.position, 4)
    update()
  } else {
    b8r.reg.system = { star: null }
  }
}

function deselect () {
  b8r.setByPath('settings', 'star', undefined)
  b8r.setByPath('settings', 'x', undefined)
  b8r.setByPath('settings', 'y', undefined)
  update()
  return true
}

const filter = b8r.debounce(() => {
  let filterIndex = 0
  const needle = b8r.get('settings.filter.search').toLowerCase()
  const habitability = b8r.get('settings.filter.habitability')
  const stars = b8r.get('galaxy.stars')

  const filterStar = star => {
    if (needle && star.name.toLowerCase().indexOf(needle) === -1) {
      star.filtered = true
    } else if (habitability < 5 && star.habitability() > habitability) {
      star.filtered = true
    } else {
      star.filtered = false
    }
  }

  const filterSlice = () => {
    const start = Date.now()
    for (; (filterIndex < stars.length) && (Date.now() - start < 30); filterIndex++) {
      filterStar(stars[filterIndex])
    }
    if (filterIndex < stars.length) {
      requestAnimationFrame(filterSlice)
    } else {
      b8r.touch('galaxy.stars')
    }
  }

  filterSlice()
  update()
}, 250)

const starFill = (element, [color, filtered]) => {
  if (filtered) {
    color = color.replace(/rgb/, 'rgba').replace(/\)/, ',0.25)')
  }
  element.setAttribute('fill', color)
}

const closeSystem = () => {
  b8r.reg.system = { star: null }
}

b8r.register('galaxy-controls', { update, pickStar, pickStar3d, closeSystem, starFill, filter, deselect })

const lastGalaxyParams = {}
async function generateGalaxy () {
  const { seed, count, star } = window.location.hash
    ? JSON.parse(unescape(window.location.hash.substr(1)))
    : b8r.getByPath('settings')
  if (
    lastGalaxyParams.seed !== seed ||
    lastGalaxyParams.count !== count
  ) {
    b8r.set('galaxy', galaxy(parseInt(seed, 10), parseInt(count, 10)))
    if (b8r.get('settings.filter.search') || b8r.get('settings.filter.habitability') < 5) {
      filter()
    }
    b8r.trigger('ready', b8r.findOne('.babylon-component'))
  }
  Object.assign(lastGalaxyParams, { star, seed, count })
}

generateGalaxy()

window.addEventListener('hashchange', generateGalaxy)

b8r.reg.app = {
  buildGalaxy (evt, target) {
    const { data } = target
    const BABYLON = data.BABYLON._b8r_value
    const { scene } = data
    const { stars } = b8r.reg.galaxy

    console.time('galaxy')

    if (!scene.getMeshByName('core')) {
      BABYLON.MeshBuilder.CreateSphere('core', { diameter: 0.5, segments: 8 }, scene)
      const core = BABYLON.MeshBuilder.CreateSphere('core-halo', { diameter: -0.6, segments: 8 }, scene)
      const coreMaterial = new BABYLON.StandardMaterial('core-material', scene)
      coreMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
      coreMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
      coreMaterial.emissiveColor = new BABYLON.Color3(1, 0.33, 0)
      coreMaterial.ambientColor = new BABYLON.Color3(0, 0, 0)
      core.material = coreMaterial
    }

    let SPS = scene.getMeshByName('stars')
    if (SPS) {
      SPS.dispose()
    }
    SPS = new BABYLON.SolidParticleSystem('stars', scene, { isPickable: true })
    const sphere = BABYLON.MeshBuilder.CreateSphere('s', { diameter: 0.3, segments: 4 })
    SPS.addShape(sphere, stars.length)
    sphere.dispose() // dispose of original model sphere

    const mesh = SPS.buildMesh() // finally builds and displays the SPS mesh

    // initiate particles function
    SPS.initParticles = () => {
      for (let p = 0; p < SPS.nbParticles; p++) {
        const particle = SPS.particles[p]
        const { x, y, z } = stars[p].position
        const rgb = stars[p]._detail.template.rgb.map(x => x / 255)
        particle.position.x = x * 50
        particle.position.y = z * 50
        particle.position.z = y * 50
        particle.scale.x = particle.scale.y = particle.scale.z = stars[p].scale
        particle.color = new BABYLON.Color3(...rgb)
        stars[p]._particle = particle
      }
    }

    console.timeEnd('galaxy')

    const starMat = new BABYLON.StandardMaterial('stars')
    starMat.emissiveColor = new BABYLON.Color3(0.75, 0.75, 0.75)
    mesh.material = starMat

    // block frustrrum culling
    mesh.alwaysSelectAsActiveMesh = true

    // Update SPS mesh
    SPS.initParticles()
    SPS.setParticles()
    SPS.refreshVisibleSize()

    b8r.reg['galaxy-controls'].stars = {
      mesh,
      SPS,
    }
  },
  isCurrent (elt, system) {
    if (b8r.reg.system && b8r.reg.system.star === elt._b8rListInstance) {
      elt.classList.add('current')
      elt.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      elt.classList.remove('current')
    }
  }
}
