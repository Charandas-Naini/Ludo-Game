import { _decorator, Color, Component, EditBox, Node } from 'cc';
import { PlayerModeHandler } from './PlayerModeHandler';
import { PlayerPawnUI } from './PlayerPawnUI';
import { PlayerToggleHandler } from './PlayerToggleHandler';
import { PlayerColor } from '../../PlayerHandlers/PawnSlots';
import { LudoAI } from '../../AI/LudoAI';
import { PlayerType } from '../../Enums/PlayerType';
import { GameConstants } from '../../Utility/GameConstants';
const { ccclass, property } = _decorator;

@ccclass('PlayerUIHandler')
export class PlayerUIHandler extends Component {

    @property({ type: PlayerModeHandler })
    private mode: PlayerModeHandler;

    @property({ type: PlayerPawnUI })
    private pawnUI: PlayerPawnUI;

    @property({ type: PlayerColor })
    private playerColor: PlayerColor;

    @property(EditBox)
    playerEditBox: EditBox | null = null;

    public getInputText() {
        if (this.playerEditBox) {
            const text: string = this.playerEditBox.string;
            console.log('User entered:', text);
        }
    }

    public Initialize(playerToggleHandler: PlayerToggleHandler, index: number) {
        this.mode.Initialize();
        this.pawnUI.Initialize(playerToggleHandler, index);
    }

    public getLudoAI(): LudoAI {
        return this.mode.getLudoAI();
    }
    public getPlayerType(): PlayerType {
        return this.mode.getPlayerType();
    }

    public getPlayerColor(): PlayerColor {
        return this.playerColor;
    }

    public setColor(color: Color) {
        if (color == GameConstants.Blue) this.playerColor = PlayerColor.Blue;
        else if (color == GameConstants.Red) this.playerColor = PlayerColor.Red;
        else if (color == GameConstants.Green) this.playerColor = PlayerColor.Green;
        else if (color == GameConstants.Yellow) this.playerColor = PlayerColor.Yellow;
        this.pawnUI.setColor(color);
    }
}


