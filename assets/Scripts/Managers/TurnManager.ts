import { _decorator, Component, Node, Vec3, tween, CCFloat, Slider, Enum } from 'cc';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';
import { PawnSeggregation } from '../Pawn/PawnSeggregation';
import { PawnMovement } from '../Pawn/PawnMovement';
import { GameConstants } from '../Utility/GameConstants';
import { LudoAI } from '../AI/LudoAI';
import { PawnSlots, PlayerColor } from '../PlayerHandlers/PawnSlots';
import { PlayerType } from '../Enums/PlayerType';
const { ccclass, property } = _decorator;

@ccclass('TurnManager')
export class TurnManager extends Component {
    @property({ type: PlayerHandler })
    private players: PlayerHandler[] = [];

    @property({ type: PlayerHandler })
    private allPlayers: PlayerHandler[] = [];

    @property
    private currentPlayerIndex: number = 0;

    @property({ type: CCFloat, range: [0, 1], slide: true })
    private gameSpeed: number = 0.5;

    public PlayGame(playersCount: number, ludoAI: LudoAI[], playerTypes: PlayerType[], playerColors: PlayerColor[], playerNames: string[]) {

        this.allPlayers.forEach(player => {
            player.node.active = false;
        });

        this.players = [];
        for (let i = 0; i < playersCount; i++) {
            //console.log(playerColors[i]);
            this.players.push(this.allPlayers.find(x => x.playerColor == playerColors[i]));
        }

        this.players.forEach((player, index) => {
            player.node.active = true;
            player.ludoAI = ludoAI[index];
            player.playerType = playerTypes[index];
            player.playerName.string = playerNames[index];
        });

        GameConstants.GAMESPEED = this.gameSpeed;

        for (let player of this.players) {
            player.Initialize(this);
        }
        this.startTurn();
    }

    public resetGame() {
        this.unscheduleAllCallbacks();
        this.currentPlayerIndex = 0;
        this.players.forEach(player => {
            player.resetGame();
        });
        this.startTurn();
    }

    public onMovedAIPawn(playerHandler: PlayerHandler) {
        let opponentPlayerHandler: PlayerHandler[] = this.players.filter(
            p => p !== playerHandler
        );
        playerHandler.ludoAI.makeMove(playerHandler, opponentPlayerHandler);
    }


    public GameSpeedChanged(slider: Slider) {
        this.gameSpeed = 1 - slider.progress;
    }

    public startTurn() {
        this.players[this.currentPlayerIndex].startTurn();
        //console.log("turn has started.");
    }

    public endTurn() {
        //console.log("turn has ended.");
        this.nextTurn();
    }

    private nextTurn() {

        let reachedCount = 0;

        this.players.forEach(player => {
            if (player.checkAllPawnReachedEnd()) reachedCount++;
        });

        if (this.players.length - 1 === reachedCount) {
            console.log("Game Finished");
            return;
        }


        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.startTurn();
    }

    public pawnMoved(mainPawn: PawnMovement): boolean {

        let pawnSeggregation: PawnSeggregation[] = [];

        pawnSeggregation = [];
        this.players.forEach(player => {
            player.getZoneIndexes(pawnSeggregation, 0, 51);
        });

        let pawnKilled = this.killPawns(pawnSeggregation, mainPawn);

        if (pawnKilled) {
            this.scheduleOnce(() => {
                this.reArrangePawns(pawnSeggregation);

                this.players.forEach(player => {
                    pawnSeggregation = [];
                    player.getZoneIndexes(pawnSeggregation, 52, 58);
                    this.reArrangePawns(pawnSeggregation);
                });
            }, GameConstants.PAWNS_REARRANGE_DURATION_AFTERKILLED);
        }
        else {
            this.reArrangePawns(pawnSeggregation);

            this.players.forEach(player => {
                pawnSeggregation = [];
                player.getZoneIndexes(pawnSeggregation, 52, 58);
                this.reArrangePawns(pawnSeggregation);
            });
        }

        return pawnKilled;


    }
    private killPawns(pawnSeggregation: PawnSeggregation[], mainPawn: PawnMovement): boolean {

        let pawnKilled = false;
        pawnSeggregation.forEach(self => {
            if (mainPawn.mainIndex != self.index) return;

            if (GameConstants.isSafeZone(self.index)) return;

            let otherPlayers: number[] = [];
            self.pawns.forEach(pawn => {
                if (pawn.GetSlotColor() != mainPawn.GetSlotColor()) {
                    pawn.sendToBase();
                    otherPlayers.push(self.pawns.indexOf(pawn));
                }
            });

            otherPlayers.forEach(removingPlayer => {
                self.pawns.splice(removingPlayer, 1);
            });

            if (otherPlayers.length > 0) pawnKilled = true;

        });

        return pawnKilled;
    }

    private homePawns(pawnSeggregation: PawnSeggregation[], mainPawn: PawnMovement) {

        let pawnhome = false;
        pawnSeggregation.forEach(self => {
            if (mainPawn.mainIndex != self.index) return;

            if (!GameConstants.isHomeZone(self.index)) return;

            let otherPlayers: number[] = [];
            self.pawns.forEach(pawn => {
                if (pawn.GetSlotColor() != mainPawn.GetSlotColor()) {

                    otherPlayers.push(self.pawns.indexOf(pawn));
                }
            });

            otherPlayers.forEach(removingPlayer => {
                self.pawns.splice(removingPlayer, 1);
            });

            if (otherPlayers.length > 0) pawnhome = true;

        });

        if (pawnhome) {
            this.scheduleOnce(() => {
                this.reArrangePawns(pawnSeggregation);
            }, GameConstants.PAWNS_REARRANGE_DURATION_AFTERKILLED);
        }
        else {
            this.reArrangePawns(pawnSeggregation);
        }
    }

    private reArrangePawns(pawnSeggregation: PawnSeggregation[]) {
        pawnSeggregation.forEach(item => {
            let count = item.pawns.length;
            if (count === 0) return;

            // Determine grid size (up to 4x4)
            let gridSize = 1;
            if (count <= 1) gridSize = 1;
            else if (count <= 4) gridSize = 2;
            else if (count <= 9) gridSize = 3;
            else gridSize = 4;

            let spacing = 20; // space between pawns
            let offset = (gridSize - 1) * spacing * 0.5;

            // Adjust scale for readability
            let scale = Math.max(0.6, 1 - (count * 0.03));

            for (let i = 0; i < count; i++) {
                let pawn = item.pawns[i];
                let row = Math.floor(i / gridSize);
                let col = i % gridSize;

                let pos = new Vec3(
                    col * spacing - offset,
                    offset - row * spacing,
                    0
                );

                pawn.reArrangePawn(pos, scale);
            }
        });
    }


}


