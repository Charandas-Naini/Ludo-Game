import { _decorator, Node } from 'cc';
import { DiceDetails } from '../Dice/DiceDetails';

export class RandomUtility {

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static weightedRandom(frames: DiceDetails[]): number {
        let total = frames.reduce((a, b) => a + b.weight, 0);
        let random = Math.random() * total;

        for (let i = 0; i < frames.length; i++) {
            if (random < frames[i].weight) {
                return i;
            }
            random -= frames[i].weight;
        }

        return frames.length - 1;
    }
}