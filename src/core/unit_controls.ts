// UnitControls.ts
import * as BABYLON from '@babylonjs/core'
import { Unit } from './unit'
import { SelectionManager } from './selection'

export class UnitControls {
    private scene: BABYLON.Scene
    private units: Unit[]
    private selectionManager: SelectionManager

    constructor (scene: BABYLON.Scene, units: Unit[]) {
        this.scene = scene
        this.units = units
        this.selectionManager = new SelectionManager(scene, units)

        this.scene.onPointerObservable.add(
            this.handlePointerEvents.bind(this),
            BABYLON.PointerEventTypes.POINTERDOWN |
                BABYLON.PointerEventTypes.POINTERUP |
                BABYLON.PointerEventTypes.POINTERMOVE,
            true
        )
    }

    private handlePointerEvents (event: BABYLON.PointerInfo): void {
        const evt = event.event as PointerEvent

        if (evt.button === 0) {
            this.selectionManager.handlePointerEvents(event)
        } else if (event.type === BABYLON.PointerEventTypes.POINTERUP && evt.button === 2) {
            this.moveSelectedUnits(event.pickInfo)
        }
    }

    private moveSelectedUnits (pickInfo: BABYLON.PickingInfo | null): void {
        if (pickInfo?.hit && pickInfo.pickedPoint) {
            const selectedUnits = this.units.filter(unit => unit.isSelected)
            const formationPositions = this.getFormationPositions(
                pickInfo.pickedPoint,
                selectedUnits.length
            )

            selectedUnits.forEach((unit, index) => {
                unit.moveTo(formationPositions[index])
            })
        }
    }

    private getFormationPositions (center: BABYLON.Vector3, count: number): BABYLON.Vector3[] {
        const positions: BABYLON.Vector3[] = []
        const spacing = 1
        const formationSize = Math.ceil(Math.sqrt(count))
        const halfSize = formationSize / 2 - 0.5

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / formationSize)
            const col = i % formationSize
            const offsetX = (col - halfSize) * spacing
            const offsetZ = (row - halfSize) * spacing
            positions.push(center.add(new BABYLON.Vector3(offsetX, 0, offsetZ)))
        }
        return positions
    }

    public dispose (): void {
        this.selectionManager.dispose()
    }
}

