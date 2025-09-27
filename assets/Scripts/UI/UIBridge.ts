// UIBridge.ts
import { _decorator, Component } from 'cc';
import { MainMenuState } from './MainMenuState';
import { GameStateManager } from './GameStateManager';
import { PlayingState } from './PlayingState';
import { PausedState } from './PausedState';
import { GameOverState } from './GameOverState';
const { ccclass } = _decorator;

@ccclass('UIBridge')
export class UIBridge extends Component {
    startGame() {
        GameStateManager.instance.startGame();
    }
    pauseGame() {
        GameStateManager.instance.pauseGame();
    }
    resumeGame() {
        GameStateManager.instance.resumeGame();
    }
    gameOver() {
        GameStateManager.instance.gameOver();
    }
    backToMenu() {
        GameStateManager.instance.backToMenu();
    }
}