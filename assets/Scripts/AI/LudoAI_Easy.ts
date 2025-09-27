import { _decorator, Component } from 'cc';
import { PawnMovement } from '../Pawn/PawnMovement';
import { LudoAI } from './LudoAI';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';

const { ccclass } = _decorator;

@ccclass('LudoAI_Easy')
export class LudoAI_Easy implements LudoAI {

    public makeMove(players: PlayerHandler, opponentPlayers: PlayerHandler[]) {
        //console.log("makeMove");

        // get all movable pawns
        const movablePawns: PawnMovement[] = players.pawnslots.getMovablePawns();

        if (movablePawns.length === 0) {
            //console.log("[AI Easy] No movable pawns.");
            return;
        }

        // pick a random pawn
        const randomPawnIndex = Math.floor(Math.random() * movablePawns.length);
        const pawn = movablePawns[randomPawnIndex];

        if (!pawn.storedDices || pawn.storedDices.storedValues.length === 0) {
            //console.log("[AI Easy] No dice values available for pawn:", pawn.node.name);
            return;
        }

        if (!pawn["movePawnClicked"]?.()) {
            // pick a random dice value from stored values
            const randomDiceIndex = Math.floor(Math.random() * pawn.storedDices.storedValues.length);
            const selectedDice = pawn.storedDices.storedValues[randomDiceIndex];

            //console.log(`[AI Easy] Moving pawn: ${pawn.node.name} with dice ${selectedDice}`);

            // same as human move
            if (pawn.canMovePawn()) {
                pawn.movePawn(selectedDice);
            }
        }

    }

}
