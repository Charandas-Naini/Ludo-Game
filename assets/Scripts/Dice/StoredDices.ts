import { _decorator, Component, Sprite, SpriteFrame, Prefab, Node, instantiate, UITransform, Vec3 } from 'cc';
import { DiceCloud } from '../Pawn/DiceCloud';
import { Dice } from './Dice';
import { PawnMovement } from '../Pawn/PawnMovement';
import { UIHighlight } from '../Pawn/UIHighlight';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';
const { ccclass, property } = _decorator;

@ccclass('StoredDices')
export class StoredDices extends Component {

    @property({ type: UIHighlight })
    private highlightArrow: UIHighlight;

    @property(Prefab)
    diceCloudPrefab: Prefab | null = null;

    @property([Sprite])
    private currentFrames: Sprite[] = [];

    public storedValues: number[] = [];

    @property
    private consecutiveSixes: number = 0;

    private currentCloud: Node | null = null;

    private dice: Dice;

    //@property({ type: PlayerController })
    public playerController: PlayerHandler;

    public Initialize(dice: Dice) {
        this.playerController = this.node.parent.parent.getComponent(PlayerHandler);
        this.dice = dice;
        this.enableRolling(false);
    }

    /**
     * Store the dice result and handle consecutive sixes logic.
     * Sets the spriteFrame for the corresponding Sprite.
     * Returns true if storage was reset due to three consecutive sixes.
     */
    public storeDice(value: number, spriteFrame: SpriteFrame) {
        this.storedValues.push(value);

        this.consecutiveSixes++;
        this.enableStoredDices(value, spriteFrame);

        if (this.consecutiveSixes > 0) {
            if (this.storedValues[this.consecutiveSixes - 1] == 6) {

                if (this.consecutiveSixes == 1) {
                    if (!this.dice.checkIfCanMove(6)) {
                        //console.log("this.consecutiveSixes == 1 with 6");
                        this.resetStored();
                        this.endTurn();
                    }
                    else {
                        this.dice.enableRolling(true);
                    }
                }
                else if (this.consecutiveSixes == 2) {
                    if (!this.dice.checkIfCanMove(12)) {
                        //console.log("this.consecutiveSixes == 2 with 6");
                        this.removeSelectedValueByIndex(2); // remove second 6
                        this.dice.highlightAllPawns();
                    }
                    else {
                        this.dice.enableRolling(true);
                    }

                }
                else if (this.consecutiveSixes == 3) {
                    this.resetStored();
                    this.endTurn();
                }
                else {
                    this.dice.enableRolling(true);
                }
            }
            else {

                if (this.consecutiveSixes == 2) {
                    if (!this.dice.checkIfCanMove(this.storedValues[0] + value)) {
                        //console.log("this.consecutiveSixes == 2 with " + value);
                        this.removeSelectedValueByIndex(2);
                    }
                }
                else if (this.consecutiveSixes == 3) {
                    if (!this.dice.checkIfCanMove(this.storedValues[0] + this.storedValues[1] + value)) {
                        //console.log("this.consecutiveSixes == 3 with " + value);
                        this.removeSelectedValueByIndex(3);
                    }
                }
                this.dice.highlightAllPawns();
            }
        }

    }


    public enableRolling(canRoll: boolean) {
        this.highlightArrow.enablePulse(canRoll);
    }

    public getStoredValue(index): number {
        //console.log("getStoredValue called with index:", index, "storedValues:", this.storedValues);
        return this.storedValues[index];
    }

    public canMovePawn(tempIndex: number, maxLength: number): boolean {

        let canMove = false;

        for (let i = 0; i < this.storedValues.length; i++) {
            let selected = this.storedValues[i] + tempIndex;
            if (selected <= maxLength) {
                canMove = true;
                break;
            }
        }


        return canMove;
    }

    public totalPossibleDices(tempIndex: number, maxLength: number): number {

        let total = 0;

        for (let i = 0; i < this.storedValues.length; i++) {
            let selected = this.storedValues[i] + tempIndex;
            if (selected <= maxLength) {
                total++;
            }
        }
        return total;
    }

    public possibleDice(tempIndex: number, maxLength: number): number {

        let value = 0;

        for (let i = 0; i < this.storedValues.length; i++) {
            let selected = this.storedValues[i] + tempIndex;
            if (selected <= maxLength) {
                value = this.storedValues[i];
                break;
            }
        }
        return value;
    }

    public endTurn() {
        this.dice.enableRolling(false);
        this.playerController.endTurn();
    }

    public isValueAvailable(value: number): boolean {

        // if(this.storedValues.includes(6)) console.log("Dice 6");
        return this.storedValues.includes(value);
    }

    public selectCurrentFrames() {

        this.currentFrames[0].enabled = false;
    }

    public getconsecutiveSixes(): number {
        return this.consecutiveSixes;
    }

    private enableStoredDices(value: number, spriteFrame: SpriteFrame) {

        this.currentFrames[this.consecutiveSixes - 1].spriteFrame = spriteFrame;
        this.currentFrames[this.consecutiveSixes - 1].enabled = true;
    }

    public resetStored() {
        this.storedValues = [];
        this.consecutiveSixes = 0;
        this.disableAllSprites();
    }

    public getStoredSum(): number {
        return this.storedValues.reduce((a, b) => a + b, 0);
    }

    public disableAllSprites() {
        this.currentFrames.forEach(sprite => {
            sprite.enabled = false;
        });
    }

    showDiceCloud(pawn: PawnMovement) {
        if (this.currentCloud) {
            this.currentCloud.destroy();
        }

        if (!this.diceCloudPrefab) {
            console.warn("Prefab not assigned!");
            return;
        }

        if (this.storedValues.length == 0) return; // no options to show

        // instantiate prefab
        this.currentCloud = instantiate(this.diceCloudPrefab);
        this.playerController.node.addChild(this.currentCloud);
        // get pawn world position
        let pawnPos = pawn.node.worldPosition.clone();

        // convert world → local in the cloud’s parent space (playerController.node)
        let parentUI = this.playerController.node.getComponent(UITransform)!;
        let uiPos = parentUI.convertToNodeSpaceAR(pawnPos);
        // final position
        this.currentCloud.setPosition(new Vec3(uiPos.x - 10, uiPos.y + 120, 0));

        // show options inside
        const cloudComp = this.currentCloud.getComponent(DiceCloud);
        cloudComp?.showDiceOptions(this.storedValues, (selected) => {
            //console.log("Player selected dice:", selected);
            if (pawn.canMovePawn()) pawn.movePawn(selected);
            if (this.currentCloud) {
                this.currentCloud.destroy();
            }
        });
    }

    canRollAgain(): boolean {

        //console.log("canRollAgain check:", this.consecutiveSixes, this.storedValues);
        if (this.consecutiveSixes > 0) {
            if (this.storedValues[this.consecutiveSixes - 1] == 6) {
                if (this.consecutiveSixes == 3) {
                    this.resetStored();
                }
                else {
                    return true;
                }
            }
            return false;
        }
        return true;
    }

    public removeSelectedValueByIndex(selectedIndex: number) {
        //console.log("removeSelectedValueByIndex" + selectedIndex);
        this.storedValues.splice(selectedIndex, 1);

        this.currentFrames[this.consecutiveSixes - 1].enabled = false;
        this.consecutiveSixes--;
        for (let i = 0; i < this.consecutiveSixes; i++) {
            this.currentFrames[i].enabled = true;
            this.currentFrames[i].spriteFrame = this.dice.getSpriteFrame(this.storedValues[i] - 1);
        }
    }

    public removeSelectedValueByNumber(selected: number) {
        // console.log("removeSelectedValueByNumber" + selected);
        let selectedIndex = this.findSelectedValueIndex(selected);
        this.removeSelectedValueByIndex(selectedIndex);
    }

    public findSelectedValueIndex(selected: number): number {
        //console.log("findSelectedValueIndex" + selected);
        return this.storedValues.findIndex(n => n === selected);
    }

    public pawnMoved(pawnMovement: PawnMovement): boolean {
        return this.playerController.pawnMoved(pawnMovement);
    }

}

