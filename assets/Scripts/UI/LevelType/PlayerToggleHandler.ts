import { _decorator, Color, Component, Node, Toggle } from 'cc';
import { PlayerColorHelper } from './PlayerColorHelper';
import { PlayerUIHandler } from './PlayerUIHandler';
import { PlayerColor } from '../../PlayerHandlers/PawnSlots';
import { TurnManager } from '../../Managers/TurnManager';
import { LudoAI } from '../../AI/LudoAI';
import { PlayerType } from '../../Enums/PlayerType';
import { GameStateManager } from '../GameStateManager';
import { PlayingState } from '../PlayingState';
const { ccclass, property } = _decorator;

@ccclass('PlayerToggleHandler')
export class PlayerToggleHandler extends Component {

    @property([Toggle])
    private modeToggles: Toggle[] = []; // Assign 2P, 3P, 4P toggles in order

    @property({ type: [PlayerUIHandler] })
    private playerFields: PlayerUIHandler[] = [];  // Assign Player 1–4 fields

    private isUpdating = false; // prevent recursion

    @property({ type: Number })
    public selectedPlayer: number = 0;

    @property({ type: PlayerColor })
    public selctedColor: PlayerColor;

    @property({ type: TurnManager })
    private turnManager: TurnManager;

    private selectedPlayerCount: number = 2;
    start() {
        this.playerFields.forEach((field, index) => {
            field.Initialize(this, index);
        });
        // add listeners
        this.modeToggles.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                if (!this.isUpdating) {
                    this.onModeSelected(index + 2); // 0->2P, 1->3P, 2->4P
                }
            });
        });

        // Default: 2 players
        this.onModeSelected(2);
    }

    private onModeSelected(playersCount: number) {
        this.selectedPlayerCount = playersCount;
        //console.log(`Selected mode: ${playersCount} Players`);

        let colors: Color[] = this.getColors(playersCount);

        // Enable only required player fields and assign colors
        this.playerFields.forEach((field, i) => {
            field.node.active = i < playersCount;
            if (i < colors.length) {
                field.setColor(colors[i]);
            }
        });

        // Safely update toggles without recursion
        this.isUpdating = true;
        this.modeToggles.forEach((toggle, i) => {
            toggle.isChecked = (i === playersCount - 2);
        });
        this.isUpdating = false;
    }

    private getColors(playersCount: number): Color[] {

        switch (playersCount) {
            case 2:
                return PlayerColorHelper.get2PColors(this.selectedPlayer, this.selctedColor);
            case 3:
                return PlayerColorHelper.getMultiColors(this.selectedPlayer, this.selctedColor);
            case 4:
                return PlayerColorHelper.getMultiColors(this.selectedPlayer, this.selctedColor);
            default:
                return [];
        }
    }

    public playGame() {
        let ludoAI: LudoAI[] = [];
        let playerTypes: PlayerType[] = [];
        let playerColors: PlayerColor[] = [];
        let playerNames: string[] = [];
        for (let i = 0; i < this.selectedPlayerCount; i++) {
            ludoAI.push(this.playerFields[i].getLudoAI());
            playerTypes.push(this.playerFields[i].getPlayerType());
            playerColors.push(this.playerFields[i].getPlayerColor());
            playerNames.push(this.playerFields[i].playerEditBox ? this.playerFields[i].playerEditBox.string : `Player ${i + 1}`);
        }

        this.turnManager.PlayGame(this.selectedPlayerCount, ludoAI, playerTypes, playerColors, playerNames);

    }


    public selectPresentPlayer(selectedColor: PlayerColor, selectedPlayer: number) {

        this.selctedColor = selectedColor;
        this.selectedPlayer = selectedPlayer;
        this.onModeSelected(this.selectedPlayerCount);
    }
}
