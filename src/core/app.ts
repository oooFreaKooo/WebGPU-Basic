import { Scene } from '@babylonjs/core'
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine'
import { CameraSetup } from './camera'
import { LightSetup } from './light'
import { SceneSetup } from './scene'

export class Application {
    private canvas: HTMLCanvasElement
    private engine: WebGPUEngine | undefined
    private scene: Scene | undefined

    constructor (canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    async start (): Promise<void> {
        const webgpuSupported = await WebGPUEngine.IsSupportedAsync

        if (webgpuSupported) {
            this.engine = new WebGPUEngine(this.canvas, { antialias: true })
            await this.engine.initAsync()
            this.scene = new Scene(this.engine)
            
            const dirLight = new LightSetup(this.scene).setupLights()

            // Initialize scene elements with the directional light
            new SceneSetup(this.scene).setupScene(dirLight, this.canvas)

            // Start rendering the scene
            this.engine.runRenderLoop(() => {
                this.scene?.render()
            })

            // Resize the engine if the window is resized
            window.addEventListener('resize', () => {
                this.engine?.resize()
            })
        } else {
            console.warn('WebGPU not supported on this device.')
        }
    }
}
