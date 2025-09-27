import { _decorator, Component } from 'cc';
import { PawnMovement } from '../Pawn/PawnMovement';
import { LudoAI } from './LudoAI';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';
import { GameConstants } from '../Utility/GameConstants';

const { ccclass } = _decorator;

@ccclass('LudoAI_Medium')
export class LudoAI_Medium implements LudoAI {

    public makeMove(players: PlayerHandler, opponentPlayers: PlayerHandler[]) {
        //console.log("makeMove [Medium]");

        const movablePawns: PawnMovement[] = players.pawnslots.getMovablePawns();
        if (movablePawns.length === 0) {
            //console.log("[AI Medium] No movable pawns.");
            return;
        }

        let bestPawn: PawnMovement | null = null;
        let bestDice: number | null = null;

        // 1. Try to kill opponent pawns that are NOT in safe zones
        for (const pawn of movablePawns) {
            for (const dice of pawn.storedDices?.storedValues ?? []) {
                const targetIndex = pawn.mainIndex + dice;

                for (const opp of opponentPlayers) {
                    for (const oppPawn of opp.pawnslots.getActivePawns()) {
                        if (oppPawn.mainIndex === targetIndex && !GameConstants.isSafeZone(oppPawn.mainIndex)) {
                            //console.log(`[AI Medium] Kill move (opponent not safe): ${pawn.node.name} with dice ${dice}`);
                            bestPawn = pawn;
                            bestDice = dice;
                            break;
                        }
                    }
                    if (bestPawn) break;
                }
                if (bestPawn) break;
            }
            if (bestPawn) break;
        }

        // 2. If no kill → prefer moving pawns that are NOT in a safe zone
        if (!bestPawn) {
            const nonSafePawns = movablePawns.filter(p => !GameConstants.isSafeZone(p.mainIndex));
            if (nonSafePawns.length > 0) {
                const pawn = nonSafePawns[Math.floor(Math.random() * nonSafePawns.length)];
                const dices = pawn.storedDices?.storedValues ?? [];
                bestPawn = pawn;
                bestDice = dices[Math.floor(Math.random() * dices.length)];
                //console.log(`[AI Medium] Moving non-safe pawn: ${pawn.node.name} with dice ${bestDice}`);
            }
        }

        // 3. If no choice → move any pawn (even from safe zone)
        if (!bestPawn) {
            const randomPawn = movablePawns[Math.floor(Math.random() * movablePawns.length)];
            const dices = randomPawn.storedDices?.storedValues ?? [];
            bestPawn = randomPawn;
            bestDice = dices[Math.floor(Math.random() * dices.length)];
            //console.log(`[AI Medium] Random fallback (safe zone pawn): ${bestPawn.node.name} with dice ${bestDice}`);
        }

        if (bestPawn && bestDice !== null && !bestPawn["movePawnClicked"]?.()) {
            if (bestPawn.canMovePawn())
                bestPawn.movePawn(bestDice);
        }
    }

}
