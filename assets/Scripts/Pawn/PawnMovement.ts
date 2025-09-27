import { _decorator, Component, Node, EventTouch, input, tween, Input, Vec3, Color, color, Sprite, Director, director } from 'cc';
import { StoredDices } from '../Dice/StoredDices';
import { WayPoints } from '../Utility/WayPoints';
import { PawnSlots, PlayerColor } from '../PlayerHandlers/PawnSlots';
import { UIHighlight } from './UIHighlight';
import { GameConstants } from '../Utility/GameConstants';
import { PlayerType } from '../Enums/PlayerType';
const { ccclass, property } = _decorator;

@ccclass('PawnMovement')
export class PawnMovement extends Component {

    @property({ type: WayPoints })
    public waypoints: WayPoints;

    public storedDices: StoredDices;

    @property(UIHighlight)
    private selectedImg: UIHighlight;

    @property
    public isSelected: boolean = false;

    private solts: PawnSlots;

    @property({ type: Sprite })
    private pawnColorImg: Sprite;

    @property({ type: Node })
    public layout: Node;

    public indexInSlot: number = -1; // 0..3
    private startIndex: number = 0;
    @property
    public tempIndex: number = 0;

    public inBase = true;
    public inHome = false;
    @property
    public mainIndex = -1;

    private playerType: PlayerType = PlayerType.Human;

    public Initialize(slots: PawnSlots, storedDices: StoredDices, waypoints: WayPoints, startIndex: number, pawnColor: Color, playerType: PlayerType) {
        this.waypoints = waypoints;
        this.solts = slots;
        this.storedDices = storedDices;
        this.highlightPawn(false);
        this.startIndex = startIndex;
        this.pawnColorImg.color = pawnColor;
        this.playerType = playerType;
    }

    public GetSlotColor(): PlayerColor {
        return this.solts.playerColor;
    }

    public resetPath() {
        this.mainIndex = -1;
        this.tempIndex = -1;
        this.inHome = false;
    }

    onLoad() {
        if (this.playerType == PlayerType.Human)
            this.node.on(Input.EventType.TOUCH_END, this.onClick, this);
    }

    onClick(event: EventTouch) {
        this.movePawnClicked();
    }



    public movePawnClicked(): boolean {
        if (!this.isSelected) return true;

        //console.log("Pawn clicked:", this.node.name + " indexInSlot:" + this.indexInSlot);

        if (this.storedDices) {

            if (this.canEnterBoard()) {
                this.moveToStart();
                this.inBase = false;
                return true;
            }
            if (this.storedDices.getconsecutiveSixes() <= 0) return true;

            if (this.storedDices.getconsecutiveSixes() == 1) {


                const selected = this.storedDices.possibleDice(this.tempIndex, GameConstants.TOTAL_STEPS);

                this.movePawn(selected);
                return true;

            }
            if (this.storedDices.getconsecutiveSixes() > 1) {
                if (this.playerType == PlayerType.Human) {
                    if (this.storedDices.totalPossibleDices(this.tempIndex, GameConstants.TOTAL_STEPS) > 1) {
                        this.storedDices.showDiceCloud(this);

                        return true;
                    }
                }
            }
            else {
                this.moveByFirstDice();
                return true;
            }
        } else {
            console.warn("storedDices not found in scene!");
        }

        return false;
    }

    private checkPawnAgain() {
        if (this.storedDices.pawnMoved(this))
            this.solts.extraTurn = true;
        this.solts.CheckPawnAgain();
    }

    public canEnterBoard(): boolean {
        return this.inBase && this.storedDices && this.storedDices.isValueAvailable(6);
    }

    public getRemainingValue() {
        return GameConstants.TOTAL_STEPS - this.tempIndex;
    }


    public canMovePawn(): boolean {
        let canMove = this.storedDices.canMovePawn(this.tempIndex, GameConstants.TOTAL_STEPS);

        return this.mainIndex >= 0 && canMove;
    }



    public hasCompleted(): boolean {
        return GameConstants.TOTAL_STEPS == this.tempIndex;
    }

    public moveNext() {
        this.mainIndex++;
        this.tempIndex++;
        if (this.tempIndex < this.waypoints.getWaypointsCount() && this.mainIndex >= this.waypoints.getWaypointsCount()) {
            this.mainIndex = 0;
        }
        else if (!this.inHome && this.tempIndex > this.waypoints.getWaypointsCount() - 1) {
            this.mainIndex = this.waypoints.getWaypointsCount();
            this.tempIndex = this.waypoints.getWaypointsCount();
            this.inHome = true;
        }

        this.tweenToPosition();
    }

    public canReachHome(diceValue: number) {
        return this.inHome && this.tempIndex + diceValue === GameConstants.TOTAL_STEPS;
    }

    public pawnMoving = false;

    public moveToStart() {
        this.inHome = false;
        this.inBase = false;
        this.tempIndex = 1;
        this.mainIndex = this.startIndex;
        this.tweenToPosition();
        this.solts.unhighlightAllPawns();
        this.pawnMoving = true;
        this.reArrangePawn(Vec3.ZERO, 0.97);
        this.storedDices.pawnMoved(this);
        this.storedDices.removeSelectedValueByNumber(6);
        this.scheduleOnce(() => {
            this.pawnMoving = false;
            this.solts.unhighlightAllPawns();
            this.checkPawnAgain();
        }, GameConstants.PAWN_MOVE_NEXTTURN_DURATION);
    }

    public movePawn(selected: number) {
        this.solts.unhighlightAllPawns();
        //console.log("storedDices found in scene!" + selected);
        this.pawnMoving = true;
        this.reArrangePawn(Vec3.ZERO, 0.97);
        this.storedDices.pawnMoved(this);
        this.storedDices.removeSelectedValueByIndex(this.storedDices.findSelectedValueIndex(selected));
        for (let i = 0; i < selected; i++) {
            this.scheduleOnce(() => {
                this.moveNext();
                if (i == selected - 1) {
                    this.scheduleOnce(() => {
                        if (this.tempIndex == GameConstants.TOTAL_STEPS)
                            this.solts.extraTurn = true;

                        this.pawnMoving = false;
                        this.solts.unhighlightAllPawns();
                        this.checkPawnAgain();
                    }, GameConstants.PAWN_MOVE_NEXTTURN_DURATION);
                }
            }, i * GameConstants.PAWN_MOVE_NEXTTURN_DURATION);
        }
    }

    public moveByFirstDice() {
        const selected = this.storedDices.getStoredValue(0);

        this.movePawn(selected);
    }
    public resetGame() {
        this.unscheduleAllCallbacks();
        this.inBase = true;
        this.inHome = false;
        this.mainIndex = -1; // reset position
        this.tempIndex = -1;

        let pos = new Vec3(0, 0, 0);
        this.node.setPosition(pos);
    }

    tweenToPosition() {

        if(this.inBase) return;
        let targetPos: Vec3 = this.waypoints.getWaypoints(this.mainIndex, this.solts.playerColor);

        tween(this.node)
            .to(GameConstants.PAWN_MOVE_DURATION, { worldPosition: targetPos })
            .start();
    }

    public reArrangePawn(pos: Vec3, scale: number) {

        tween(this.layout)
            .to(GameConstants.PAWNS_REARRANGE_DURATION, { position: pos })
            .start();

        this.layout.setScale(scale, scale, 1);
    }

    public highlightPawn(isSelected: boolean) {
        if (this.selectedImg) {
            this.isSelected = isSelected;
            this.selectedImg.enablePulse(this.isSelected);
        }
    }

    public sendToBase() {
        this.inBase = true;
        this.inHome = false;
        this.mainIndex = -1; // reset position
        this.tempIndex = -1;

        let pos = new Vec3(0, 0, 0);

        tween(this.node)
            .to(GameConstants.PAWNS_DEATH_DURATION, { position: pos })
            .start();
    }
}
