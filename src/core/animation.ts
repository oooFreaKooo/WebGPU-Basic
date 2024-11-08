// AnimationController.ts
import * as BABYLON from '@babylonjs/core'

export class AnimationController {
    private scene: BABYLON.Scene
    private model: BABYLON.AbstractMesh
    private currentAnimationGroup: BABYLON.AnimationGroup | null = null
    private idleAnimations: BABYLON.AnimationGroup[] = []
    private walkAnimation: BABYLON.AnimationGroup | null = null
    private isWalking: boolean = false
    private idleSwitchTimer: number = 0
    private readonly runSpeedMultiplier: number = 1.25

    constructor (
        scene: BABYLON.Scene,
        model: BABYLON.AbstractMesh,
        animationGroups: BABYLON.AnimationGroup[]
    ) {
        this.scene = scene
        this.model = model

        // Enable animation blending
        this.scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride()
        this.scene.animationPropertiesOverride.enableBlending = true
        this.scene.animationPropertiesOverride.blendingSpeed = 0.05

        // Initialize animation groups
        for (const animGroup of animationGroups) {
            if (animGroup.name.toLowerCase().includes('run')) {
                this.walkAnimation = animGroup
                this.walkAnimation.speedRatio = this.runSpeedMultiplier
            } else if (animGroup.name.toLowerCase().includes('idle')) {
                this.idleAnimations.push(animGroup)
            }
        }
        

        // Play initial idle animation
        this.playIdleAnimation()
    }

    public update (deltaTime: number): void {
        if (!this.isWalking) {
            this.idleSwitchTimer += deltaTime / 1000
            if (this.idleSwitchTimer >= 5) {
                this.playIdleAnimation()
                this.idleSwitchTimer = 0
            }
        }
    }

    public setWalking (walking: boolean): void {
        if (walking === this.isWalking) { return }
    
        this.isWalking = walking
    
        // Enable blending and set the blending speed for smooth transitions
        this.scene.animationPropertiesOverride.enableBlending = true
        this.scene.animationPropertiesOverride.blendingSpeed = 0.05 // Adjust as needed for smoothness
    
        if (this.isWalking && this.walkAnimation) {
            // Start the walking animation and ensure it blends smoothly
            if (this.currentAnimationGroup) {
                this.walkAnimation.start(true, this.currentAnimationGroup.weight) // Blends to walk animation
            } else {
                this.walkAnimation.play(true)
            }
            this.currentAnimationGroup = this.walkAnimation
        } else {
            this.stopCurrentAnimation()
            this.playIdleAnimation()
        }
    }
    

    private playIdleAnimation (): void {
        if (this.idleAnimations.length === 0) {return}

        const rand = Math.random()
        let selectedAnimation: BABYLON.AnimationGroup | undefined

        if (rand < 0.7) {
            selectedAnimation = this.idleAnimations.find(anim => anim.name === 'Idle1')
        } else if (rand < 0.85) {
            selectedAnimation = this.idleAnimations.find(anim => anim.name === 'Idle2')
        } else {
            selectedAnimation = this.idleAnimations.find(anim => anim.name === 'Idle3')
        }

        selectedAnimation = selectedAnimation || this.idleAnimations[0]

        selectedAnimation.play(true)
        this.currentAnimationGroup = selectedAnimation
    }

    private stopCurrentAnimation (): void {
        if (this.currentAnimationGroup) {
            this.currentAnimationGroup.stop()
            this.currentAnimationGroup = null
        }
    }
}
