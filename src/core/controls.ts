// controls.ts
import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'

export class FreeCameraMouseInput implements BABYLON.ICameraInput<BABYLON.UniversalCamera> {
    camera: BABYLON.UniversalCamera
    private gui: GUI.AdvancedDynamicTexture
    private ECameraMovement: any

    private _enabled: boolean = true
    private _topEdgeScroll: boolean = true
    private _rightEdgeScroll: boolean = true
    private _bottomEdgeScroll: boolean = true
    private _leftEdgeScroll: boolean = true

    private _alphaEdgeScroll: number = 0 // Make edges transparent
    private _widthEdgeScroll: number = 0.025
    private _heightEdgeScroll: number = 0.025

    // GUI elements for edge areas
    private topEdge: GUI.Rectangle
    private topRightCorner: GUI.Rectangle
    private rightEdge: GUI.Rectangle
    private bottomRightCorner: GUI.Rectangle
    private bottomEdge: GUI.Rectangle
    private bottomLeftCorner: GUI.Rectangle
    private leftEdge: GUI.Rectangle
    private topLeftCorner: GUI.Rectangle

    constructor (camera: BABYLON.UniversalCamera, gui: GUI.AdvancedDynamicTexture, ECameraMovement: any) {
        this.camera = camera
        this.gui = gui
        this.ECameraMovement = ECameraMovement

        this._disableEdgeScroll = this._disableEdgeScroll.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)

        this.createEdgeGUI()
    }

    getClassName (): string {
        return 'FreeCameraMouseInput'
    }

    getSimpleName (): string {
        return 'mouse'
    }

    attachControl (noPreventDefault?: boolean): void {
        const engine = this.camera.getEngine()
        const element = engine.getInputElement()
        element && element.addEventListener('contextmenu', this.onContextMenu, false)
    }

    detachControl (): void {
        const engine = this.camera.getEngine()
        const element = engine.getInputElement()
        element && element.removeEventListener('contextmenu', this.onContextMenu)

        // Remove GUI controls
        this.gui.removeControl(this.topEdge)
        this.gui.removeControl(this.topRightCorner)
        this.gui.removeControl(this.rightEdge)
        this.gui.removeControl(this.bottomRightCorner)
        this.gui.removeControl(this.bottomEdge)
        this.gui.removeControl(this.bottomLeftCorner)
        this.gui.removeControl(this.leftEdge)
        this.gui.removeControl(this.topLeftCorner)
    }

    // Updated checkInputs in FreeCameraMouseInput
    checkInputs (): void {
        if (this._enabled) {
            const speed = this.camera.speed
            
            // Calculate the forward vector based on the current zoom level and position, ignoring Y component
            const forwardVector = this.camera.getForwardRay().direction
            forwardVector.y = 0 // Zero out Y to ensure movement only in X and Z axes
            forwardVector.normalize()
    
            // Edge scrolling logic with smooth transitions using lerp
            const movementVector = new BABYLON.Vector3(0, 0, 0)
    
            if (this._topEdgeScroll) {
                movementVector.addInPlace(forwardVector.scale(speed))
            }
            if (this._bottomEdgeScroll) {
                movementVector.addInPlace(forwardVector.scale(-speed))
            }
    
            // Calculate the right vector to move laterally, also constrained to X and Z axes
            const rightVector = BABYLON.Vector3.Cross(forwardVector, BABYLON.Axis.Y).normalize()
    
            if (this._leftEdgeScroll) {
                movementVector.addInPlace(rightVector.scale(speed))
            }
            if (this._rightEdgeScroll) {
                movementVector.addInPlace(rightVector.scale(-speed))
            }
    
            // Apply movement with smooth interpolation
            this.camera.position = BABYLON.Vector3.Lerp(this.camera.position, this.camera.position.add(movementVector), 0.5)
    
            // Enforce camera boundaries
            const mdata = this.camera.metadata
            this.camera.position.x = BABYLON.Scalar.Clamp(this.camera.position.x, mdata.minX, mdata.maxX)
            this.camera.position.z = BABYLON.Scalar.Clamp(this.camera.position.z, mdata.minZ, mdata.maxZ)
        }
    }
    
    


    private _disableEdgeScroll (): void {
        this._topEdgeScroll = false
        this._rightEdgeScroll = false
        this._bottomEdgeScroll = false
        this._leftEdgeScroll = false
    }

    private onContextMenu (evt: Event): void {
        evt.preventDefault()
    }

    private createEdgeGUI (): void {
        const createEdge = (
            name: string,
            width: string | number,
            height: string | number,
            horizontalAlignment: number,
            verticalAlignment: number,
            pointerEnter: () => void,
            pointerOut: () => void
        ): GUI.Rectangle => {
            const rect = new GUI.Rectangle(name)
            rect.width = width
            rect.height = height
            rect.horizontalAlignment = horizontalAlignment
            rect.verticalAlignment = verticalAlignment
            rect.background = 'transparent'
            rect.isPointerBlocker = false
            rect.alpha = this._alphaEdgeScroll
            rect.isEnabled = this._enabled
            rect.onPointerEnterObservable.add(pointerEnter)
            rect.onPointerOutObservable.add(pointerOut)
            this.gui.addControl(rect)
            return rect
        }

        // Top edge
        this.topEdge = createEdge(
            'topEdge',
            1 - 2 * this._heightEdgeScroll,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
            GUI.Control.VERTICAL_ALIGNMENT_TOP,
            () => {
                this._disableEdgeScroll()
                this._topEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Right edge
        this.rightEdge = createEdge(
            'rightEdge',
            `${this._widthEdgeScroll * 100}%`,
            1 - 2 * this._widthEdgeScroll,
            GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
            GUI.Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                this._disableEdgeScroll()
                this._rightEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Bottom edge
        this.bottomEdge = createEdge(
            'bottomEdge',
            1 - 2 * this._heightEdgeScroll,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
            GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => {
                this._disableEdgeScroll()
                this._bottomEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Left edge
        this.leftEdge = createEdge(
            'leftEdge',
            `${this._widthEdgeScroll * 100}%`,
            1 - 2 * this._widthEdgeScroll,
            GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
            GUI.Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                this._disableEdgeScroll()
                this._leftEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Top Right Corner
        this.topRightCorner = createEdge(
            'topRightCorner',
            `${this._widthEdgeScroll * 100}%`,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
            GUI.Control.VERTICAL_ALIGNMENT_TOP,
            () => {
                this._disableEdgeScroll()
                this._topEdgeScroll = true
                this._rightEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Bottom Right Corner
        this.bottomRightCorner = createEdge(
            'bottomRightCorner',
            `${this._widthEdgeScroll * 100}%`,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT,
            GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => {
                this._disableEdgeScroll()
                this._bottomEdgeScroll = true
                this._rightEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Bottom Left Corner
        this.bottomLeftCorner = createEdge(
            'bottomLeftCorner',
            `${this._widthEdgeScroll * 100}%`,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
            GUI.Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => {
                this._disableEdgeScroll()
                this._bottomEdgeScroll = true
                this._leftEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )

        // Top Left Corner
        this.topLeftCorner = createEdge(
            'topLeftCorner',
            `${this._widthEdgeScroll * 100}%`,
            `${this._heightEdgeScroll * 100}%`,
            GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
            GUI.Control.VERTICAL_ALIGNMENT_TOP,
            () => {
                this._disableEdgeScroll()
                this._topEdgeScroll = true
                this._leftEdgeScroll = true
                if (this.camera.metadata.movedBy === null) {
                    this.camera.metadata.movedBy = this.ECameraMovement.MOUSE
                }
            },
            this._disableEdgeScroll
        )
    }
}

export class FreeCameraMouseWheelInput implements BABYLON.ICameraInput<BABYLON.UniversalCamera> {
    camera: BABYLON.UniversalCamera
    private _wheelDeltaY: number = 0
    private _observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.PointerInfo>>
    private _wheel: (pointer: BABYLON.PointerInfo) => void

    constructor () {
        // No additional initialization needed
    }

    getClassName (): string {
        return 'FreeCameraMouseWheelInput'
    }

    getSimpleName (): string {
        return 'mouseWheel'
    }

    attachControl (noPreventDefault?: boolean): void {
        const _this = this
        const scene = this.camera.getScene()
        const engine = scene.getEngine()
        const element = engine.getInputElement()

        this._wheel = function (pointer) {
            if (pointer.type !== BABYLON.PointerEventTypes.POINTERWHEEL) {
                return
            }
            const event = pointer.event as WheelEvent
            if (event.deltaY !== undefined) {
                _this._wheelDeltaY -= event.deltaY
            }
            if (event.preventDefault) {
                if (!noPreventDefault) {
                    event.preventDefault()
                }
            }
        }
        this._observer = scene.onPointerObservable.add(this._wheel, BABYLON.PointerEventTypes.POINTERWHEEL)
    }

    detachControl (): void {
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer)
            this._observer = null
            this._wheel = null
        }
    }

    checkInputs (): void {
        if (this._wheelDeltaY !== 0) {
            const mdata = this.camera.metadata
            const zoomDirection = this._wheelDeltaY > 0 ? 1 : -1
            const zoomDistance = zoomDirection * (mdata.zoomSteps || 0.5)

            // Move camera along its forward vector for dolly zoom effect
            const forwardVector = this.camera.getForwardRay().direction.scale(zoomDistance)
            this.camera.position.addInPlace(forwardVector)

            // Clamp the camera distance to max/min zoom
            const targetDistance = BABYLON.Vector3.Distance(this.camera.position, this.camera.getTarget())
            if (targetDistance > mdata.maxZoom) {
                const excess = targetDistance - mdata.maxZoom
                this.camera.position.subtractInPlace(forwardVector.scale(excess / zoomDistance))
            } else if (targetDistance < mdata.minZoom) {
                const shortage = mdata.minZoom - targetDistance
                this.camera.position.addInPlace(forwardVector.scale(shortage / zoomDistance))
            }

            // Reset wheel delta for next input check
            this._wheelDeltaY = 0
        }
    }
}
