import { _decorator, Component, Toggle } from 'cc';
import { PlayerType } from '../../Enums/PlayerType';
import { LudoAI_Easy } from '../../AI/LudoAI_Easy';
import { LudoAI } from '../../AI/LudoAI';
import { LudoAI_Medium } from '../../AI/LudoAI_Medium';
import { LudoAI_Hard } from '../../AI/LudoAI_Hard';
const { ccclass, property } = _decorator;

@ccclass('PlayerModeHandler')
export class PlayerModeHandler extends Component {

    @property({ type: Toggle })
    private aiToggle: Toggle = null!;  // AI / Human switch

    @property([Toggle])
    private aiModeToggles: Toggle[] = []; // [Easy, Medium, Hard]

    private isUpdating = false; // prevent recursion

    public Initialize() {
        // Listen for AI toggle
        this.aiToggle.node.on('toggle', this.onAIToggleChanged, this);

        // Listen for difficulty toggles
        this.aiModeToggles.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                if (!this.isUpdating) {
                    this.onDifficultySelected(index);
                }
            });
        });

        // Initialize state
        this.onAIToggleChanged();
    }

    private onAIToggleChanged() {
        const isAI = this.aiToggle.isChecked;

        // Show/Hide difficulty toggles
        this.aiModeToggles.forEach(toggle => {
            toggle.node.active = isAI;
            toggle.interactable = isAI;
        });

        if (isAI) {
            // Ensure at least one is selected (default Easy)
            if (!this.aiModeToggles.some(t => t.isChecked)) {
                this.aiModeToggles[0].isChecked = true; // Easy default
                this.onDifficultySelected(0);
            }
        } else {
            // Reset difficulty
            this.aiModeToggles.forEach(t => t.isChecked = false);
        }
    }

    private onDifficultySelected(selectedIndex: number) {
        if (!this.aiToggle.isChecked) return; // Human mode → ignore

        // Safely update toggles without recursion
        this.isUpdating = true;
        this.aiModeToggles.forEach((toggle, i) => {
            toggle.isChecked = (i === selectedIndex);
        });
        this.isUpdating = false;

        //console.log("Selected difficulty:", this.getCurrentDifficulty());
    }

    public getCurrentDifficulty(): string | null {
        if (!this.aiToggle.isChecked) return null; // Human
        const index = this.aiModeToggles.findIndex(t => t.isChecked);
        return index === 0 ? "Easy" : index === 1 ? "Medium" : "Hard";
    }

    public getPlayerType(): PlayerType {
        if (this.aiToggle.isChecked) return PlayerType.AI;
        else return PlayerType.Human;
    }

    public getLudoAI(): LudoAI {
        let ludoAI: LudoAI = new LudoAI_Easy;

        const index = this.aiModeToggles.findIndex(t => t.isChecked);

        if (index == 1) ludoAI = new LudoAI_Medium;
        else if (index == 2) ludoAI = new LudoAI_Hard;

        return ludoAI;
    }
}
