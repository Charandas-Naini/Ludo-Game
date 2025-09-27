import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { PlayerColor } from '../PlayerHandlers/PawnSlots';
const { ccclass, property } = _decorator;

@ccclass('WayPoints')
export class WayPoints extends Component {
    @property({ type: Node })
    private commonWayPoints: Node[] = [];

    @property({ type: Node })
    private redWayPoints: Node[] = [];

    @property({ type: Node })
    private yellowWayPoints: Node[] = [];

    @property({ type: Node })
    private greenWayPoints: Node[] = [];

    @property({ type: Node })
    private blueWayPoints: Node[] = [];

    getWaypoints(index: number, playerColor: PlayerColor): Vec3 {

        if (index <= this.commonWayPoints.length - 1) {
            return this.commonWayPoints[index].worldPosition.clone() as Vec3;
        }
        else if (playerColor == PlayerColor.Red) {
            index -= this.commonWayPoints.length;
            return this.redWayPoints[index].worldPosition.clone() as Vec3;
        }
        else if (playerColor == PlayerColor.Yellow) {
            index -= this.commonWayPoints.length;
            return this.yellowWayPoints[index].worldPosition.clone() as Vec3;
        }
        else if (playerColor == PlayerColor.Green) {
            index -= this.commonWayPoints.length;
            return this.greenWayPoints[index].worldPosition.clone() as Vec3;
        }
        else if (playerColor == PlayerColor.Blue) {
            index -= this.commonWayPoints.length;
            return this.blueWayPoints[index].worldPosition.clone() as Vec3;
        }
    }

    public getWaypointsCount(): number {
        return this.commonWayPoints.length;
    }

}


