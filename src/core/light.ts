import { Scene, Vector3, HemisphericLight, DirectionalLight } from '@babylonjs/core'

export class LightSetup {
    private scene: Scene

    constructor (scene: Scene) {
        this.scene = scene
    }

    setupLights (): DirectionalLight {
        // Ambient light
        const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene)
        hemiLight.intensity = 0.6

        // Directional light for shadows
        const dirLight = new DirectionalLight('dirLight', new Vector3(-1, -2, -1), this.scene)
        dirLight.position = new Vector3(10, 10, 10)
        dirLight.intensity = 1.0

        return dirLight
    }
}
