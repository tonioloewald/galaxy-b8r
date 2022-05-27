/**
# babylonjs component

<b8r-component path="../components/b3d.js"></b8r-component>
*/

export default {
  css: `
  ._component_ {
    display: block;
  }

  ._component_ .maximize {
    position: absolute;
    top: 2px;
    right: 2px;
  }

  ._component_ .babylonjs {
    width: 100%;
    height: 100%;
    background: #213;
  }
`,
  html: `
<canvas class="babylonjs" data-event="mousedown:_component_.pick">
</canvas>
<button class="maximize" data-event="click:_component_.toggleFullscreen">
  <span data-bind="class(icon-shrink7|icon-enlarge7)=_component_.isFullscreen"></span>
</button>
`,
  async initialValue ({ b8r, component, findOne, get, set }) {
    const { viaTag } = await import('https://rawgit.com/tonioloewald/bindinator.js/master/lib/scripts.js')
    const { BABYLON } = await viaTag('https://cdn.babylonjs.com/babylon.max.js')
    await viaTag('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js')
    const canvas = findOne('canvas')
    const engine = new BABYLON.Engine(canvas, true)
    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color3(0.07, 0.03, 0.1)

    // Adding an Arc Rotate Camera
    const camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 3, 80, BABYLON.Vector3.Zero(), scene)
    camera.lowerRadiusLimit = 3
    camera.upperRadiusLimit = 120
    camera.lowerBetaLimit = Math.PI * 0.05
    camera.upperBetaLimit = Math.PI * 0.48
    scene.activeCamera.attachControl(canvas, true)

    // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // const xr = scene.createDefaultXRExperienceAsync();
    /*
    const highlightLayer = new BABYLON.HighlightLayer("hl1", scene);
    scene.onPointerDown = (evt, info) =>{
      highlightLayer.removeAllMeshes()
      if (info.hit) {
        highlightLayer.addMesh(info.pickedMesh, BABYLON.Color3.FromHexString('#aaaaff'))
      }
    }
    */

    scene.onPointerDown = scene.onPointerDown = (evt, pickResult) => {
      set({ pickResult })
      b8r.trigger('pick', component)
    }

    const slerp = (a, b, t) => {
      t = Math.sin(t * Math.PI * 0.5)
      return (1 - t) * a + t * b
    }

    const glowLayer = new BABYLON.GlowLayer('glow', scene)
    glowLayer.intensity = 1
    let lastUpdate = 0
    const fps = 30
    let cameraAnimation = null
    const render = () => {
      if (Date.now() - lastUpdate > 1000 / get('fps')) {
        scene.render()
        lastUpdate = Date.now()
        camera.alpha += 0.001
        if (cameraAnimation) {
          try {
            const { duration, start, toPosition, toRadius, fromPosition, fromRadius } = cameraAnimation
            const t = (lastUpdate - start) / duration
            if (t < 1) {
              BABYLON.Vector3.SlerpToRef(fromPosition, toPosition, t, camera.target)
              camera.radius = slerp(fromRadius, toRadius, t)
            } else {
              camera.target = toPosition
              camera.radius = toRadius
              cameraAnimation = null
            }
          } catch (e) {
            console.error(e)
          }
        }
      }
    }
    engine.runRenderLoop(render)

    return {
      BABYLON,
      fps,
      engine,
      camera,
      scene,
      pickResult: null,
      destroy () {
        engine.stopRenderLoop(render)
      },
      isFullScreen: false,
      async toggleFullscreen () {
        const { isFullscreen } = get()
        if (isFullscreen) {
          await document.exitFullscreen()
          engine.resize()
        } else {
          await component.requestFullscreen()
          engine.resize()
        }
        set({ isFullscreen: !isFullscreen })
      },
      animateCameraMove (toPosition, toRadius, duration = 2000) {
        const { camera } = get()
        const fromPosition = camera.target.clone()
        const fromRadius = camera.radius
        const start = Date.now()
        cameraAnimation = {
          start,
          duration,
          fromPosition,
          fromRadius,
          toPosition,
          toRadius
        }
      }
    }
  },
  async load ({ b8r, component }) {
    b8r.trigger('ready', component)
  }
}
