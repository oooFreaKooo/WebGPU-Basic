import * as BABYLON from '@babylonjs/core'
import { FurMaterial } from '@babylonjs/materials'
import '@babylonjs/loaders/glTF'
import { Unit } from './unit' // Adjust the path as needed
import { CameraSetup } from './camera'
import { UnitControls } from './unit_controls'

export class SceneSetup {
    private scene: BABYLON.Scene
    private ground: BABYLON.Mesh
    private furMaterial: FurMaterial
    private knight: Unit

    constructor (scene: BABYLON.Scene) {
        this.scene = scene
        this.setupMouseControl()
    }

    setupScene (dirLight: BABYLON.DirectionalLight, canvas: HTMLCanvasElement): void {
        // Set up the ground and shadows
        this.createGround(dirLight)
        // Create the knight character
        const units: Unit[] = []
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(0, 0, 0)))
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(1, 0, 0)))
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(2, 0, 0)))
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(3, 0, 0)))
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(4, 0, 0)))
        units.push(new Unit(this.scene, 'Knight.glb', new BABYLON.Vector3(5, 0, 0)))
        // Set up the unit controls
        new UnitControls(this.scene, units)
        // Initialize camera and lights
        const cameraSetup = new CameraSetup(this.scene, canvas)
        cameraSetup.setupCamera( )

        this.createGrass(dirLight)
        
        // Set background color
        this.scene.clearColor = new BABYLON.Color4(0.4, 0.6, 0.9, 1.0)
    }

    private setupMouseControl (): void {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (pickResult.hit && pickResult.pickedMesh === this.ground) {
                // Set target position to clicked point on the ground
                const targetPosition = pickResult.pickedPoint
                this.knight.moveTo(targetPosition)
            }
        }
    }

    private createGround (dirLight: BABYLON.DirectionalLight): void {
        this.ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, this.scene)
        this.ground.receiveShadows = true

        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene)
        groundMaterial.diffuseTexture = new BABYLON.Texture('src/assets/textures/grass_ground.jpg', this.scene)
        groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2)
        this.ground.material = groundMaterial

        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight)
        shadowGenerator.addShadowCaster(this.ground)
    }

    private createGrass (dirLight: BABYLON.DirectionalLight): void {
        // Apply fur material to the ground
        this.furMaterial = new FurMaterial('furMaterial', this.scene)
        const furTexture = FurMaterial.GenerateTexture('furTexture', this.scene)

        this.furMaterial.furTexture = furTexture
        this.furMaterial.furLength = 0.3
        this.furMaterial.furAngle = 0
        this.furMaterial.furColor = new BABYLON.Color3(1.2, 1.5, 1.2)
        this.furMaterial.furSpacing = 0.25
        this.furMaterial.furGravity = new BABYLON.Vector3(0, 1, 0)
        this.furMaterial.furSpeed = 100 // Adjusted for dynamic visual response
        this.furMaterial.furDensity = 30
        this.furMaterial.highLevelFur = true
        this.furMaterial.diffuseTexture = new BABYLON.Texture('src/assets/textures/grass_ground3.webp', this.scene)

        this.ground.material = this.furMaterial

        const quality = 10
        FurMaterial.FurifyMesh(this.ground, quality)
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight)
        shadowGenerator.addShadowCaster(this.ground)
    }
}
