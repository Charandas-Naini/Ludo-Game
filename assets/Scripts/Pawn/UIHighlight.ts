import { _decorator, Component, Sprite, tween, Vec3 } from 'cc';
import { GameConstants } from '../Utility/GameConstants';
const { ccclass } = _decorator;

@ccclass('UIHighlight')
export class UIHighlight extends Component {

    enablePulse(on: boolean) {
        //console.log("UIHighlight started on node:", this.node.name+on);
        tween(this.node).stop();
        if(!this.node.active)this.node.scale = new Vec3(0, 0, 0);
        this.node.active = on;
        if (on) {
            tween(this.node).repeatForever(
                tween(this.node).to(0.25, { scale: Vec3.ONE.clone().multiplyScalar(GameConstants.SCALE_HIGHLIGHT) })
                .to(0.25, { scale: Vec3.ONE.clone().multiplyScalar(GameConstants.SCALE_UNHIGHLIGHT) })
            ).start();
        }
    }
}