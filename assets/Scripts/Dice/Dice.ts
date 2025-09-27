import { _decorator, Component, Node, Sprite, tween, SpriteFrame, Vec3, director, Director, Enum, Button, EventHandler } from 'cc';
import { RandomUtility } from '../Utility/RandomUtility';
import { DiceDetails } from './DiceDetails';
import { StoredDices } from './StoredDices';
import { PawnSlots } from '../PlayerHandlers/PawnSlots';
import { PawnSeggregation } from '../Pawn/PawnSeggregation';
import { GameConstants } from '../Utility/GameConstants';
import { PlayerType } from '../Enums/PlayerType';
const { ccclass, property } = _decorator;

@ccclass('Dice')
export class Dice extends Component {
    @property({ type: StoredDices })
    private storedDice!: StoredDices;

    private pawnslots!: PawnSlots;

    @property(Sprite)
    private diceSprite!: Sprite;

    @property([DiceDetails])
    private currentFrames: DiceDetails[] = [];

    private currentIndex = 0;

    @property
    public stoprolling: boolean = true;

    public playerType: PlayerType = PlayerType.Human;

    public Initialize(playerType: PlayerType, pawnslots: PawnSlots) {
        this.playerType = playerType;
        this.pawnslots = pawnslots;

        if (!this.diceSprite) {
            this.diceSprite = this.getComponentInChildren(Sprite)!;
        }
        this.storedDice.disableAllSprites();

        this.storedDice.Initialize(this);

        if (playerType == PlayerType.Human) {
            let btn = this.diceSprite.node.getComponent(Button);
            if (btn) {
                // Create an event handler and add it
                const eventHandler = new EventHandler();
                eventHandler.target = this.node;  // Node with this script
                eventHandler.component = "Dice"; // Script name
                eventHandler.handler = "rollDice";

                btn.clickEvents.push(eventHandler);
            } else {
                console.warn("No Button component found on diceSprite node!");
            }
        }
    }

    public resetGame() {
        this.unscheduleAllCallbacks();
        // Reset dice
        this.storedDice.resetStored();
    }

    public enableRolling(canRoll: boolean) {
        if (canRoll && this.pawnslots.CheckAllPawnReachedEnd()) {
            this.storedDice.playerController.endTurn();
            return;
        }
        this.storedDice.enableRolling(canRoll);
        this.stoprolling = !canRoll;

        if (canRoll && this.playerType == PlayerType.AI) {
            this.scheduleOnce(() => {
                this.rollDice();
            }, 1);
        }
    }

    public highlightDice() {
        tween(this.diceSprite.node).to(GameConstants.DICE_HIGHLIGHT_DURATION, { scale: Vec3.ONE.clone().multiplyScalar(GameConstants.SCALE_HIGHLIGHT) }).start();
    }

    public unhighlightDice() {
        tween(this.diceSprite.node).to(GameConstants.DICE_HIGHLIGHT_DURATION, { scale: Vec3.ONE.clone().multiplyScalar(GameConstants.SCALE_UNHIGHLIGHT) }).start();
    }

    /**
     * Initiates the dice roll animation and result calculation.
     */
    public rollDice() {
        if (this.currentFrames.length === 0) return;

        if (this.stoprolling) return;

        this.enableRolling(false);

        this.currentIndex = 0;

        this.highlightDice();

        this.schedule(this.nextFrame, GameConstants.DICE_SPRITE_DURATION);

        this.scheduleOnce(() => {
            this.rollingFinished();
        }, GameConstants.DICE_ROLL_DURATION);
    }

    public CheckAllPawnReachedEnd(): boolean {
        return this.pawnslots?.CheckAllPawnReachedEnd();
    }
    /**
     * Handles the end of the dice roll animation and moves the player.
     */
    private rollingFinished() {
        this.unhighlightDice();
        this.unschedule(this.nextFrame);

        // Highlight all pawns so user can pick one

        this.storedDice.storeDice(this.getResult(), this.getSpriteFrame(this.currentIndex));
    }

    public checkIfCanMove(value: number): boolean {

        let totalmove = this.pawnslots.checkOutOfBoard();

        totalmove = totalmove * 6 - value;

        if (totalmove >= 0) return true;

        if (this.pawnslots.checkValueCanAdd(totalmove)) return true;

        return this.pawnslots.checkIfCanMove(value);

    }

    public highlightAllPawns() {
        this.pawnslots?.highlightAllPawns();
    }

    public getSpriteFrame(index: number): SpriteFrame {
        return this.currentFrames[index].item;
    }

    /**
     * Returns the result of the dice roll (1-based index).
     */
    public getResult(): number {
        return this.currentIndex + 1;
    }

    /**
     * Advances the dice animation to the next frame.
     */
    private nextFrame() {
        if (this.currentFrames.length === 0) return;

        // For weighted random selection
        this.currentIndex = RandomUtility.weightedRandom(this.currentFrames);

        this.diceSprite.spriteFrame = this.currentFrames[this.currentIndex].item;
    }

    public getZoneIndexes(indexes: PawnSeggregation[], min: number, max: number) {
        this.pawnslots.getZoneIndexes(indexes, min, max);

    }

}