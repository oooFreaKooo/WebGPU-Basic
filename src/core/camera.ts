// CameraSetup.ts
import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'
import { FreeCameraMouseInput, FreeCameraMouseWheelInput } from './controls'

export class CameraSetup {
    private scene: BABYLON.Scene
    private canvas: HTMLCanvasElement
    private camera: BABYLON.UniversalCamera
    private gui: GUI.AdvancedDynamicTexture

    constructor (scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        this.scene = scene
        this.canvas = canvas
        this.setupCamera()
    }

    setupCamera (): void {
        // Define camera movement types
        const ECameraMovement = {
            KEYS: 0,
            MOUSE: 1,
        }

        // Create a UniversalCamera
        this.camera = new BABYLON.UniversalCamera('RTSCamera', new BABYLON.Vector3(7, 10, 7), this.scene)
        this.camera.setTarget(new BABYLON.Vector3(0, 0, 0))
        this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA
        this.camera.speed = 0.6
        this.camera.fov = 0.8

        this.scene.onBeforeRenderObservable.add(() => {
            this.camera.inputs.checkInputs()
        })

        // Initialize camera metadata
        this.camera.metadata = {
            movedBy: null,
            targetPosition: this.camera.position.clone(),
            radius: new BABYLON.Vector3(this.camera.position.x, 0, this.camera.position.z)
                .subtract(new BABYLON.Vector3(this.camera.getTarget().x, 0, this.camera.getTarget().z))
                .length(),
            rotation: BABYLON.Tools.ToRadians(180) + this.camera.rotation.y,
            rotationSpeed: 0.02,
            minX: -50,
            maxX: 50,
            minZ: -50,
            maxZ: 50,
            targetZoom: 10, // Distance from the target for zooming
            maxZoom: 20.0,
            minZoom: 2.0,
            zoomSteps: 1.5,
        }

        // Clear default camera inputs and attach control
        this.camera.inputs.clear()
        this.camera.attachControl(this.canvas, true)

        // Create GUI for edge scrolling
        this.gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')

        // Add custom mouse inputs
        this.camera.inputs.add(new FreeCameraMouseInput(this.camera, this.gui, ECameraMovement))
        this.camera.inputs.add(new FreeCameraMouseWheelInput()) // Adjusted for dolly zoom

        // Handle window resize
        window.addEventListener('resize', () => {
            this.scene.getEngine().resize()
        })
    }
}
