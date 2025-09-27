import { _decorator, Component, Node, Prefab, instantiate, Input, Color, Label, Sprite } from 'cc';
import { PlayerColor } from '../../PlayerHandlers/PawnSlots';
import { GameConstants } from '../../Utility/GameConstants';

const { ccclass, property } = _decorator;

@ccclass('PawnColorCloud')
export class PawnColorCloud extends Component {
    @property(Prefab)
    colorButtonPrefab: Prefab | null = null;   // prefab for one color button

    @property(Node)
    container: Node | null = null;             // a Layout node inside cloud

    @property(Node)
    blocker: Node | null = null;               // full-screen transparent node

    private callback: ((value: PlayerColor) => void) | null = null;

    /** Show color options */
    showColorOptions(callback: (value: PlayerColor) => void) {
        this.callback = callback;

        // clear old buttons
        this.container!.removeAllChildren();

        // Enable blocker and intercept all touches
        if (this.blocker) {
            this.blocker.active = true;
            this.blocker.off(Input.EventType.TOUCH_START);
            this.blocker.on(Input.EventType.TOUCH_START, () => {
                this.node.active = false; // hide cloud
                this.blocker.active = false;
            }, this);
        }

        // All available colors
        const colorOptions: { type: PlayerColor, color: Color }[] = [
            { type: PlayerColor.Red, color: GameConstants.Red },
            { type: PlayerColor.Blue, color: GameConstants.Blue },
            { type: PlayerColor.Green, color: GameConstants.Green },
            { type: PlayerColor.Yellow, color: GameConstants.Yellow },
        ];

        // Create buttons
        colorOptions.forEach(opt => {
            const btn = instantiate(this.colorButtonPrefab!);
            this.container!.addChild(btn);

            /* // set label (optional, can remove if you only want colored buttons)
            const label = btn.getComponentInChildren(Label);
            if (label) label.string = PlayerColor[opt.type]; */

            // set button background color
            const sprite = btn.getComponent(Sprite);
            if (sprite) sprite.color = opt.color;

            // click event
            btn.on(Node.EventType.TOUCH_END, () => {
                if (this.callback) this.callback(opt.type);
                this.node.active = false; // hide cloud
                if (this.blocker) this.blocker.active = false;
            });
        });

        this.node.active = true; // show cloud
    }
}
