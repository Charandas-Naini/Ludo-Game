import { _decorator, Component } from 'cc';
import { PawnMovement } from '../Pawn/PawnMovement';
import { LudoAI } from './LudoAI';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';
import { GameConstants } from '../Utility/GameConstants';

const { ccclass } = _decorator;

@ccclass('LudoAI_Hard')
export class LudoAI_Hard implements LudoAI {

    private isEnemyNear(targetIndex: number, opponents: PlayerHandler[]): boolean {
        for (const opp of opponents) {
            for (const oppPawn of opp.pawnslots.getActivePawns()) {
                const dist = Math.abs(oppPawn.mainIndex - targetIndex);
                if (dist > 0 && dist <= 6 && !GameConstants.isSafeZone(oppPawn.mainIndex)) {
                    return true; // danger zone (enemy within 6 steps)
                }
            }
        }
        return false;
    }

    private isStackedEnemy(targetIndex: number, opponents: PlayerHandler[]): boolean {
        for (const opp of opponents) {
            const count = opp.pawnslots.getActivePawns()
                .filter(p => p.mainIndex === targetIndex)
                .length;
            if (count >= 2) return true;
        }
        return false;
    }
    public makeMove(players: PlayerHandler, opponentPlayers: PlayerHandler[]) {
        //console.log("makeMove [Hard]");

        const movablePawns: PawnMovement[] = players.pawnslots.getMovablePawns();
        if (movablePawns.length === 0) {
            //console.log("[AI Hard] No movable pawns.");
            return;
        }

        let bestPawn: PawnMovement | null = null;
        let bestDice: number | null = null;

        // 1. Winning move (reach home)
        for (const pawn of movablePawns) {
            for (const dice of pawn.storedDices?.storedValues ?? []) {
                if (pawn.mainIndex + dice >= GameConstants.TOTAL_STEPS) {
                    //console.log(`[AI Hard] Winning move: ${pawn.node.name} with dice ${dice}`);
                    bestPawn = pawn;
                    bestDice = dice;
                    break;
                }
            }
            if (bestPawn) break;
        }

        // 2. Safe kills (only if not exposed after)
        if (!bestPawn) {
            for (const pawn of movablePawns) {
                for (const dice of pawn.storedDices?.storedValues ?? []) {
                    const targetIndex = pawn.mainIndex + dice;

                    for (const opp of opponentPlayers) {
                        for (const oppPawn of opp.pawnslots.getActivePawns()) {
                            if (oppPawn.mainIndex === targetIndex && !GameConstants.isSafeZone(oppPawn.mainIndex)) {
                                if (!this.isEnemyNear(targetIndex, opponentPlayers)) {
                                    //console.log(`[AI Hard] Safe kill: ${pawn.node.name} with dice ${dice}`);
                                    bestPawn = pawn;
                                    bestDice = dice;
                                    break;
                                }
                            }
                        }
                        if (bestPawn) break;
                    }
                    if (bestPawn) break;
                }
                if (bestPawn) break;
            }
        }

        // 3. Advance pawns with scoring system
        if (!bestPawn) {
            const scored = movablePawns.map(p => {
                const dices = p.storedDices?.storedValues ?? [];
                const dice = dices[Math.floor(Math.random() * dices.length)];
                const projected = p.mainIndex + dice;

                // Scoring system
                let score = 0;

                // Progress = closer to home
                score += projected;

                // Safe zone bonus
                if (GameConstants.isSafeZone(p.mainIndex)) score += 5;

                // Penalty if leaving safe zone
                if (!GameConstants.isSafeZone(p.mainIndex) && this.isEnemyNear(projected, opponentPlayers)) {
                    score -= 20;
                }

                // Penalty for moving into stacked enemies
                if (this.isStackedEnemy(projected, opponentPlayers)) {
                    score -= 30;
                }

                return { pawn: p, dice, score };
            });

            scored.sort((a, b) => b.score - a.score);

            // 80% choose best, 20% second best
            const chosen = (Math.random() < 0.8) ? scored[0] : scored[Math.min(1, scored.length - 1)];

            bestPawn = chosen.pawn;
            bestDice = chosen.dice;

            //console.log(`[AI Hard] Smart advance: ${bestPawn.node.name} with dice ${bestDice}, score=${chosen.score}`);
        }

        // 4. Execute move
        if (bestPawn && bestDice !== null && !bestPawn["movePawnClicked"]?.()) {
            if (bestPawn.canMovePawn())
                bestPawn.movePawn(bestDice);
        }
    }

}
