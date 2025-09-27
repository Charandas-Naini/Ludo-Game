import { _decorator, Color, Component, EventTouch, Input, instantiate, Node, Prefab, Sprite, UITransform, Vec3 } from 'cc';
import { PawnColorCloud } from './PawnColorCloud';
import { PlayerToggleHandler } from './PlayerToggleHandler';
import { PlayerColor } from '../../PlayerHandlers/PawnSlots';
const { ccclass, property } = _decorator;

@ccclass('PlayerPawnUI')
export class PlayerPawnUI extends Component {

    @property(Sprite)
    private pawnColorImg: Sprite;

    @property(Prefab)
    private pawnColorCloud: Prefab;

    private currentCloud: Node | null = null;

    private playerToggleHandler: PlayerToggleHandler

    private index: number = 0;

    public Initialize(playerToggleHandler: PlayerToggleHandler, index: number) {
        this.playerToggleHandler = playerToggleHandler;
        this.index = index;
    }
    onLoad() {
        this.node.on(Input.EventType.TOUCH_END, this.onClick, this);
    }


    onClick(event: EventTouch) {
        console.log(event);
        if (this.currentCloud) {
            this.currentCloud.destroy();
        }
        this.currentCloud = instantiate(this.pawnColorCloud);
        this.node.addChild(this.currentCloud);
        let pawnPos = this.node.worldPosition.clone();

        // convert world → local in the cloud’s parent space (playerController.node)
        let parentUI = this.node.getComponent(UITransform)!;
        let uiPos = parentUI.convertToNodeSpaceAR(pawnPos);
        this.currentCloud.setPosition(new Vec3(uiPos.x - 5, uiPos.y + 50, 0));

        console.log(this.currentCloud.name);
        // show options inside
        const cloudComp = this.currentCloud.getComponent(PawnColorCloud);
        cloudComp?.showColorOptions((selectedColor: PlayerColor) => {
            this.playerToggleHandler.selectPresentPlayer(selectedColor, this.index);
            //console.log("Selected Pawn Color:", PlayerColor[selectedColor]);
        });
    }
    public setColor(color: Color) {
        this.pawnColorImg.color = color;
    }
}


