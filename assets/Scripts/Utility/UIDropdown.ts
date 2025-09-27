import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIDropdown')
export class UIDropdown extends Component {
    @property(Node)
    dropdownButton: Node = null!;   // main button node

    @property(Label)
    selectedLabel: Label = null!;   // label inside button

    @property(Node)
    optionsPanel: Node = null!;     // panel with option buttons

    start() {
        // Hide options at start
        this.optionsPanel.active = false;

        // Button click → toggle options
        this.dropdownButton.on(Node.EventType.TOUCH_END, () => {
            this.optionsPanel.active = !this.optionsPanel.active;
        }, this);

        // Add listeners to each option button
        for (const option of this.optionsPanel.children) {
            option.on(Node.EventType.TOUCH_END, () => {
                const label = option.getComponentInChildren(Label);
                if (label) {
                    this.setOption(label.string);
                }
            }, this);
        }
    }

    private setOption(option: string) {
        this.selectedLabel.string = option;
        this.optionsPanel.active = false;
        console.log("Selected option:", option);

        // TODO: Pass to GameManager or AI system
    }
}
