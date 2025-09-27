import { _decorator, Component, CCInteger,Node } from 'cc';
import { PawnMovement } from './PawnMovement';
const { ccclass, property } = _decorator;

@ccclass('PawnSeggregation')
export class PawnSeggregation {
    @property(CCInteger)
    index: number = 0;   // Player index (0 = Yellow, 1 = Green, etc.)

    @property([PawnMovement])
    pawns: PawnMovement[] = []; // Store pawn IDs, steps, or scores
}


