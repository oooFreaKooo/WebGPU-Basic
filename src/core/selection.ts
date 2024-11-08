// SelectionManager.ts
import * as BABYLON from '@babylonjs/core'
import { Unit } from './unit'

export class SelectionManager {
    private scene: BABYLON.Scene
    private units: Unit[]
    private selectionRectangle: HTMLDivElement
    private dragStart: BABYLON.Vector2 | null = null
    private isDragging: boolean = false
    private readonly clickThreshold: number = 5 // pixels

    constructor (scene: BABYLON.Scene, units: Unit[]) {
        this.scene = scene
        this.units = units

        this.selectionRectangle = document.createElement('div')
        Object.assign(this.selectionRectangle.style, {
            position: 'absolute',
            border: '1px solid blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            display: 'none',
        })
        document.body.appendChild(this.selectionRectangle)
    }

    public handlePointerEvents (event: BABYLON.PointerInfo): void {
        const evt = event.event as PointerEvent

        if (event.type === BABYLON.PointerEventTypes.POINTERDOWN && evt.button === 0) {
            this.isDragging = true
            this.dragStart = new BABYLON.Vector2(evt.clientX, evt.clientY)
            this.selectionRectangle.style.display = 'block'
        } else if (event.type === BABYLON.PointerEventTypes.POINTERMOVE && this.isDragging) {
            this.updateSelectionBox(new BABYLON.Vector2(evt.clientX, evt.clientY))
        } else if (event.type === BABYLON.PointerEventTypes.POINTERUP && evt.button === 0) {
            this.isDragging = false
            this.selectionRectangle.style.display = 'none'

            const dragDistance = this.dragStart
                ? BABYLON.Vector2.Distance(this.dragStart, new BABYLON.Vector2(evt.clientX, evt.clientY))
                : 0

            if (dragDistance < this.clickThreshold) {
                this.selectByClick(evt.clientX, evt.clientY)
            } else {
                this.selectByDrag()
            }
        }
    }

    private updateSelectionBox (currentPos: BABYLON.Vector2): void {
        if (!this.dragStart) {return}

        const minX = Math.min(this.dragStart.x, currentPos.x)
        const minY = Math.min(this.dragStart.y, currentPos.y)
        const width = Math.abs(currentPos.x - this.dragStart.x)
        const height = Math.abs(currentPos.y - this.dragStart.y)

        Object.assign(this.selectionRectangle.style, {
            left: `${minX}px`,
            top: `${minY}px`,
            width: `${width}px`,
            height: `${height}px`,
        })
    }

    private selectByDrag (): void {
        if (!this.dragStart) {return}

        const dragEnd = this.selectionRectangle.getBoundingClientRect()
        const minX = dragEnd.left
        const minY = dragEnd.top
        const maxX = minX + dragEnd.width
        const maxY = minY + dragEnd.height

        for (const unit of this.units) {
            if (unit.model) {
                const screenPos = BABYLON.Vector3.Project(
                    unit.model.position,
                    BABYLON.Matrix.Identity(),
                    this.scene.getTransformMatrix(),
                    this.scene.activeCamera!.viewport.toGlobal(
                        this.scene.getEngine().getRenderWidth(),
                        this.scene.getEngine().getRenderHeight()
                    )
                )

                unit.isSelected =
                    screenPos.x >= minX &&
                    screenPos.x <= maxX &&
                    screenPos.y >= minY &&
                    screenPos.y <= maxY
            }
        }
    }

    private selectByClick (x: number, y: number): void {
        const pickResult = this.scene.pick(x, y)
        if (pickResult?.hit && pickResult.pickedMesh) {
            let unitFound = false
            for (const unit of this.units) {
                if (
                    unit.model === pickResult.pickedMesh ||
                    unit.model?.getChildMeshes().includes(pickResult.pickedMesh)
                ) {
                    this.units.forEach(u => (u.isSelected = false))
                    unit.isSelected = true
                    unitFound = true
                    break
                }
            }

            if (!unitFound) {
                this.units.forEach(u => (u.isSelected = false))
            }
        } else {
            this.units.forEach(u => (u.isSelected = false))
        }
    }

    public dispose (): void {
        this.selectionRectangle.remove()
    }
}
