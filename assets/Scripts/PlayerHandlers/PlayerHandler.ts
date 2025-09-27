import { _decorator, Component, Node, Enum, Label, RichText } from 'cc';
import { Dice } from '../Dice/Dice';
import { TurnManager } from '../Managers/TurnManager';
import { PawnSeggregation } from '../Pawn/PawnSeggregation';
import { PawnMovement } from '../Pawn/PawnMovement';
import { PlayerType } from '../Enums/PlayerType';
import { LudoAI } from '../AI/LudoAI';
import { PawnSlots, PlayerColor } from './PawnSlots';
const { ccclass, property } = _decorator;

@ccclass('PlayerHandler')
export class PlayerHandler extends Component {

    private dice: Dice;

    private turnManager: TurnManager;

    @property({ type: PawnSlots })
    public pawnslots!: PawnSlots;

    @property({ type: Enum(PlayerType) })
    public playerType: PlayerType = PlayerType.Human;

    @property({ type: Enum(PlayerColor) })
    public playerColor: PlayerColor = PlayerColor.Red;

    public ludoAI: LudoAI;

    @property(RichText)
    public playerName: RichText | null = null;

    public Initialize(turnManager: TurnManager) {

        this.turnManager = turnManager;
        this.dice = this.getComponentInChildren(Dice);
        this.dice.Initialize(this.playerType, this.pawnslots);
        this.pawnslots.Initialize(this.dice, this.playerType, this, this.playerColor);
    }
    public resetGame() {
        this.unscheduleAllCallbacks();
        this.pawnslots.resetGame();
        this.dice.resetGame();
    }

    public onMovedAIPawn() {
        this.turnManager.onMovedAIPawn(this);
    }

    public startTurn() {
        const parent = this.node.parent;
        this.node.setSiblingIndex(parent.children.length - 1);
        this.dice.enableRolling(true);
    }


    public checkAllPawnReachedEnd(): boolean {
        return this.dice.CheckAllPawnReachedEnd();
    }

    public endTurn() {
        this.turnManager.endTurn();
    }


    public pawnMoved(pawnMovement: PawnMovement): boolean {
        return this.turnManager.pawnMoved(pawnMovement);
    }

    public getZoneIndexes(pawnSeggregation: PawnSeggregation[], min: number, max: number) {
        this.dice.getZoneIndexes(pawnSeggregation, min, max);

    }
}


