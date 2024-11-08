// Unit.ts
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { AnimationController } from './animation'

export class Unit {
    private scene: BABYLON.Scene
    public model: BABYLON.AbstractMesh | null = null
    public isSelected: boolean = false
    private targetPosition: BABYLON.Vector3 | null = null
    private animationController: AnimationController | null = null
    private modelLoaded: boolean = false

    constructor (
        scene: BABYLON.Scene,
        modelFilename: string,
        initialPosition: BABYLON.Vector3
    ) {
        this.scene = scene
        this.loadModel(modelFilename, initialPosition)
        this.scene.onBeforeRenderObservable.add(() => this.update())
    }

    private loadModel (filename: string, initialPosition: BABYLON.Vector3): void {
        if (this.modelLoaded) {return}
        this.modelLoaded = true

        BABYLON.SceneLoader.ImportMesh(
            '',
            'src/assets/models/',
            filename,
            this.scene,
            (meshes, _, skeletons, animationGroups) => {
                this.model = meshes[0]
                this.model.position = initialPosition.clone()
                this.model.checkCollisions = true

                // Initialize AnimationController
                this.animationController = new AnimationController(
                    this.scene,
                    this.model,
                    animationGroups
                )
            }
        )
    }

    public moveTo (position: BABYLON.Vector3): void {
        this.targetPosition = position
        this.animationController?.setWalking(true)
    }

    private update (): void {
        if (!this.model) {return}

        const deltaTime = this.scene.getEngine().getDeltaTime()
        this.animationController?.update(deltaTime)

        if (this.targetPosition) {
            this.updatePosition()
        }
    }

    private updatePosition (): void {
        if (!this.model || !this.targetPosition) {return}

        const direction = this.targetPosition.subtract(this.model.position).normalize()
        const targetRotationY = Math.atan2(-direction.x, -direction.z)
        const targetQuaternion = BABYLON.Quaternion.FromEulerAngles(0, targetRotationY, 0)

        this.model.rotationQuaternion = BABYLON.Quaternion.Slerp(
            this.model.rotationQuaternion || BABYLON.Quaternion.Identity(),
            targetQuaternion,
            0.1
        )

        const distance = BABYLON.Vector3.Distance(this.model.position, this.targetPosition)
        if (distance > 0.1) {
            const moveSpeed = 0.05
            this.model.position.addInPlace(direction.scale(moveSpeed))
        } else {
            this.targetPosition = null
            this.animationController?.setWalking(false)
        }
    }
}
