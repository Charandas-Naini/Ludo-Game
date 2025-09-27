import { CCFloat, SpriteFrame, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiceSpriteDetails')
export class DiceDetails {
    @property(SpriteFrame)
    item: SpriteFrame;
    @property({ type: CCFloat, range: [0, 100], slide: true })
    weight: number = 100;
}
