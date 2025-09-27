import { _decorator, Component, Node, Prefab, instantiate, selector, Color, color, Enum } from 'cc';
import { StoredDices } from '../Dice/StoredDices';
import { PawnMovement } from '../Pawn/PawnMovement'; // Add this import
import { WayPoints } from '../Utility/WayPoints';
import { PawnSeggregation } from '../Pawn/PawnSeggregation';
import { GameConstants } from '../Utility/GameConstants';
import { Dice } from '../Dice/Dice';
import { PlayerType } from '../Enums/PlayerType';
import { PlayerHandler } from './PlayerHandler';
const { ccclass, property } = _decorator;

export enum PlayerColor {
    Red,    // 0
    Blue,   // 1
    Green,  // 2
    Yellow  // 3
}

type OnMovedAIPawn = (availablePawn: PawnMovement, storedDices: StoredDices) => void;

@ccclass('PawnSlots')
export class PawnSlots extends Component {

    @property({ type: WayPoints })
    waypoints: WayPoints;

    @property({ type: Prefab })
    pawnPrefab: Prefab | null = null;

    @property({ type: StoredDices })
    storedDices: StoredDices;

    @property({ type: Dice })
    dice: Dice;

    @property({ type: [Node] })
    slotNodes: Node[] = [];

    private startIndex: number = 0;

    public playerColor: PlayerColor = PlayerColor.Green;

    private pawnsInSlots: (PawnMovement | null)[] = [null, null, null, null];

    public extraTurn: boolean = false;

    private playerType: PlayerType = PlayerType.Human;

    private playerHandler: PlayerHandler;

    public Initialize(dice: Dice, playerType: PlayerType, playerHandler: PlayerHandler, playerColor: PlayerColor) {
        this.dice = dice;
        this.playerType = playerType;
        this.playerHandler = playerHandler;
        // Instantiate pawns in each slot
        let pawnColor: Color;
        this.playerColor = playerColor;

        switch (playerColor) {
            case PlayerColor.Yellow:
                pawnColor = GameConstants.Yellow;
                this.startIndex = GameConstants.PAWN_STARTINDEX_YELLOW;
                break;

            case PlayerColor.Red:
                pawnColor = GameConstants.Red;
                this.startIndex = GameConstants.PAWN_STARTINDEX_RED;
                break;

            case PlayerColor.Blue:
                pawnColor = GameConstants.Blue;
                this.startIndex = GameConstants.PAWN_STARTINDEX_BLUE;
                break;

            case PlayerColor.Green:
                pawnColor = GameConstants.Green;
                this.startIndex = GameConstants.PAWN_STARTINDEX_GREEN;
                break;

            default:
                break;
        }
        for (let i = 0; i < this.slotNodes.length && i < 4; i++) {
            if (this.pawnPrefab && this.pawnsInSlots[i] == null) {
                const pawn = instantiate(this.pawnPrefab);
                pawn.setPosition(0, 0, 0);
                this.slotNodes[i].addChild(pawn);
                this.pawnsInSlots[i] = pawn.getComponent(PawnMovement);
            }

            if (this.pawnsInSlots[i]) {
                this.pawnsInSlots[i].Initialize(this, this.storedDices, this.waypoints, this.startIndex, pawnColor, this.dice.playerType);
                this.pawnsInSlots[i].indexInSlot = i;
            }
        }
        this.extraTurn = false;
    }

    public resetGame() {
        this.extraTurn = false;
        this.unscheduleAllCallbacks();
        this.pawnsInSlots.forEach(pawn => {
            pawn.resetGame();
        })
    }
    public getMovablePawns(): PawnMovement[] {
        return this.pawnsInSlots.filter(p => p.canMovePawn() || p.canEnterBoard());
    }

    public getActivePawns(): PawnMovement[] {
        return this.pawnsInSlots.filter(p => !p.inBase && p.tempIndex <= p.waypoints.getWaypointsCount());
    }
    // Call this when a pawn moves out of a slot
    public markPawnMoved(slotIndex: number) {
        if (slotIndex >= 0 && slotIndex < this.pawnsInSlots.length) {
            this.pawnsInSlots[slotIndex] = null;
        }
    }

    // Check if a slot is occupied
    public isSlotOccupied(slotIndex: number): boolean {
        return this.pawnsInSlots[slotIndex] !== null;
    }

    public CheckAllPawnReachedEnd() {
        let allReachedEnd = true;
        this.pawnsInSlots.forEach(pawn => {
            //console.log("Checking pawn:", pawn.hasCompleted());
            if (!pawn.hasCompleted()) {
                // Pawn has reached the end
                allReachedEnd = false;
            }
        });
        if (allReachedEnd) {
            console.log("All Pawn has reached the end!");
        }

        return allReachedEnd;
    }


    /**
        * Highlights all pawns (shows pulse effect).
        */
    public highlightAllPawns() {
        //this.scheduleOnce(() => {
        let totalActivePawns = 0;
        this.pawnsInSlots.forEach(pawn => {
            if (pawn.canEnterBoard()) {
                totalActivePawns++;
                pawn.highlightPawn(true);
            }
            else if (pawn.canMovePawn()) {
                totalActivePawns++;
                pawn.highlightPawn(true);
            }
        });

        if (totalActivePawns === 0) {
            this.storedDices.resetStored();
            this.storedDices.endTurn();
        }
        else if (totalActivePawns == 1) {
            for (let i = 0; i < this.pawnsInSlots.length; i++) {
                if (this.pawnsInSlots[i].canEnterBoard()) {
                    this.pawnsInSlots[i].moveToStart();
                    break;
                }
                else if (this.pawnsInSlots[i].canMovePawn()) {
                    this.pawnsInSlots[i].moveByFirstDice();
                    break;
                }
            }
            this.unhighlightAllPawns();
        }
        else {
            // for showing multiple options
        }
        if (totalActivePawns >= 1)
            this.moveAIPawn();
    }


    public moveAIPawn() {
        if (this.playerType == PlayerType.AI) {
            this.playerHandler.onMovedAIPawn();
        }
    }

    /**
     * Unhighlights all pawns (removes pulse effect).
     */
    public unhighlightAllPawns() {
        this.pawnsInSlots.forEach(pawn => {
            pawn.highlightPawn(false);
        });
    }

    public CheckPawnAgain() {
        //console.log("CheckPawnAgain called" + this.storedDices.getconsecutiveSixes());
        if (this.storedDices.getconsecutiveSixes() > 0) {
            this.highlightAllPawns();
        }
        else if (this.storedDices.getconsecutiveSixes() == 0) {
            if (this.extraTurn) {
                this.extraTurn = false;
                this.dice.enableRolling(true);
            }
            else
                this.storedDices.endTurn();
        }
    }


    public checkIfCanMove(value: number): boolean {

        let canMove = false;

        this.pawnsInSlots.forEach(pawn => {
            if (pawn.tempIndex + value <= GameConstants.TOTAL_STEPS) {
                canMove = true;
            }
        });

        return canMove;

    }

    public checkOutOfBoard(): number {

        let totalEnterPawns = 0;

        this.pawnsInSlots.forEach(pawn => {
            if (pawn.canEnterBoard()) {
                totalEnterPawns++;
            }
        });

        return totalEnterPawns;
    }

    public checkValueCanAdd(value: number): boolean {

        let canMove = false;

        this.pawnsInSlots.forEach(pawn => {

            if (pawn.getRemainingValue() + value >= 0)
                canMove = true;
        });

        return canMove;
    }

    public getZoneIndexes(indexes: PawnSeggregation[], min: number, max: number) {

        this.pawnsInSlots.forEach(pawn => {
            if (pawn.mainIndex != -1 && !pawn.pawnMoving && pawn.mainIndex >= min && pawn.mainIndex <= max) {

                let found = false;
                for (let i = 0; i < indexes.length; i++) {
                    if (indexes[i].index == pawn.mainIndex) {
                        indexes[i].pawns.push(pawn);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    // Create a new PawnSegregation if not found
                    let pawnSeggregation = new PawnSeggregation();
                    pawnSeggregation.index = pawn.mainIndex;
                    if (!pawnSeggregation.pawns)
                        pawnSeggregation.pawns = []; // make sure pawns array exists
                    pawnSeggregation.pawns.push(pawn);
                    indexes.push(pawnSeggregation);
                }
            }
        });
    }
}


