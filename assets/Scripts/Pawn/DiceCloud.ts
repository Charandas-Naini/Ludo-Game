import { _decorator, Component, Node, Label, Prefab, instantiate, Input, input, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiceCloud')
export class DiceCloud extends Component {
    @property(Prefab)
    diceButtonPrefab: Prefab | null = null;   // prefab for one dice button

    @property(Node)
    container: Node | null = null;           // a Layout node inside cloud

    @property(Node)
    blocker: Node | null = null; // full-screen transparent node

    private callback: ((value: number) => void) | null = null;

    /** Show dice numbers in cloud */
    showDiceOptions(diceValues: number[], callback: (value: number) => void) {
        this.callback = callback;

        // clear old buttons
        this.container!.removeAllChildren();

        // Enable blocker and intercept all touches
        if (this.blocker) {
            this.blocker.active = true;
            this.blocker.off(Input.EventType.TOUCH_START);
            this.blocker.on(Input.EventType.TOUCH_START, () => { 
                this.node.active = false; // hide cloud
                this.blocker.active = false; // hide blocker
            }, this);
        }

        // create one button per dice value
        diceValues.forEach(val => {
            const btn = instantiate(this.diceButtonPrefab!);
            this.container!.addChild(btn);

            // set label text
            const label = btn.getComponentInChildren(Label);
            if (label) label.string = val.toString();

            // add click event
            btn.on(Node.EventType.TOUCH_END, () => {
                if (this.callback) this.callback(val);
                this.node.active = false; // hide cloud after selection
                if (this.blocker) this.blocker.active = false;
            });
        });

        this.node.active = true; // show cloud
    }

}
