/* global requestAnimationFrame */

import b8r from 'https://rawgit.com/tonioloewald/bindinator.js/master/source/b8r.js'
import { galaxy } from './galaxy.js'

window.b8r = b8r
const settings = { count: 1000, seed: 1234, filter: { search: '', habitability: 5 } }
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

function pickStar (evt) {
  const star = b8r.getListInstance(evt.target)
  if (!evt.target.matches('.current')) {
    b8r.setByPath('settings', 'star', b8r.getByPath('galaxy', 'stars').indexOf(star))
    const zoom = b8r.getByPath('settings', 'zoom')
    if (!zoom || zoom > 1000) {
      b8r.setByPath('settings', 'zoom', 500)
    }
  }
  update()
}

function deselect () {
  b8r.setByPath('settings', 'star', undefined)
  b8r.setByPath('settings', 'zoom', undefined)
  b8r.setByPath('settings', 'x', undefined)
  b8r.setByPath('settings', 'y', undefined)
  update()
  return true
}

function zoomIn () {
  const { zoom } = b8r.getByPath('settings')
  if (zoom) {
    b8r.setByPath('settings', 'zoom', zoom * 0.5)
  } else {
    b8r.setByPath('settings', 'zoom', 1000)
  }
  update()
}

function zoomOut () {
  const { zoom } = b8r.getByPath('settings')
  if (zoom < 1000) {
    b8r.setByPath('settings', 'zoom', zoom * 2)
  } else {
    b8r.setByPath('settings', 'zoom', undefined)
    b8r.setByPath('settings', 'x', undefined)
    b8r.setByPath('settings', 'y', undefined)
  }
  update()
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

b8r.register('galaxy-controls', { update, pickStar, starFill, filter, deselect, zoomIn, zoomOut })

const lastRenderParams = {}
const xPos = b8r.findOne('.x-position')
const yPos = b8r.findOne('.y-position')
const systemInfo = b8r.findOne('.system')
const galaxyFrame = b8r.findOne('.galaxy-frame')
function render () {
  const { seed, count, star, zoom } = window.location.hash
    ? JSON.parse(unescape(window.location.hash.substr(1)))
    : b8r.getByPath('settings')
  if (
    lastRenderParams.seed !== seed ||
    lastRenderParams.count !== count
  ) {
    b8r.set('galaxy', galaxy(parseInt(seed, 10), parseInt(count, 10)))
    if (b8r.get('settings.filter.search') || b8r.get('settings.filter.habitability') < 5) {
      filter()
    }
  }
  b8r.find('.current')
    .forEach(elt => elt.classList.remove('current'))
  if (star === undefined) {
    [systemInfo, xPos, yPos].forEach(elt => b8r.hide(elt))
  } else if (
    typeof star === 'number' &&
    star !== lastRenderParams.star
  ) {
    const _star = b8r.getByPath('galaxy', 'stars')[star]
    const planets = _star.planetsDetail()
    console.log(_star, planets)
    b8r.set('system', { star: _star, planets })
    b8r.find(`[data-list-instance="galaxy.stars[name=${_star.name}]"]`)
      .forEach(elt => {
        elt.classList.add('current')
        const y = elt.offsetTop - elt.parentElement.scrollTop
        if (y < 0 || y + elt.offsetHeight > elt.parentElement.offsetHeight) {
          elt.scrollIntoView({ behavior: 'smooth' })
        }
      })
    xPos.setAttribute('x1', _star._x)
    xPos.setAttribute('x2', _star._x)
    yPos.setAttribute('y1', _star._y)
    yPos.setAttribute('y2', _star._y);
    [systemInfo, xPos, yPos].forEach(elt => b8r.show(elt))
  }
  if (zoom && star !== undefined) {
    const _star = b8r.getByPath('galaxy', 'stars')[star]
    changeViewBox(_star._x - zoom * 0.5, _star._y - zoom * 0.5, zoom)
  } else {
    changeViewBox(0, 0, 2000)
  }
  Object.assign(lastRenderParams, { star, zoom, seed, count })
}

function changeViewBox (x, y, w) {
  if (w === undefined || x === undefined || y === undefined) {
    x = 0
    y = 0
    w = 2000
  }
  /*
  galaxyFrame.setAttribute('viewBox', `${x} ${y} ${w} ${w}`);
  return;
  */
  const [x0, y0, w0] = galaxyFrame.getAttribute('viewBox').split(' ')

  const duration = 500
  const animationEnds = Date.now() + duration

  function iterate () {
    if (Date.now() > animationEnds) {
      galaxyFrame.setAttribute('viewBox', `${x} ${y} ${w} ${w}`)
    } else {
      let t = 1 - (animationEnds - Date.now()) / duration
      t = (Math.sin((t - 0.5) * Math.PI) + 1) * 0.5
      const xt = Math.lerp(x0, x, t)
      const yt = Math.lerp(y0, y, t)
      const wt = Math.lerp(w0, w, t)
      galaxyFrame.setAttribute('viewBox', `${xt} ${yt} ${wt} ${wt}`)
      requestAnimationFrame(iterate)
    }
  }

  requestAnimationFrame(iterate)
}

render()

window.addEventListener('hashchange', render)
