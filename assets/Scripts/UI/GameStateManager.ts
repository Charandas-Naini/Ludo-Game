// GameStateManager.ts
import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Node } from 'cc';
import { IGameState } from './GameState/IGameState';
import { GameState } from './GameState/GameState';
import { PlayingState } from './PlayingState';
import { PausedState } from './PausedState';
import { GameOverState } from './GameOverState';
import { MainMenuState } from './MainMenuState';
const { ccclass, property } = _decorator;

@ccclass('GameStateManager')
export class GameStateManager extends Component {
    public static instance: GameStateManager;

    @property(Node) mainMenuUI: Node = null!;
    @property(Node) playingUI: Node = null!;
    @property(Node) pausedUI: Node = null!;
    @property(Node) gameOverUI: Node = null!;

    public currentState: IGameState | null = null;
    private stateStack: IGameState[] = [];

    onLoad() {
        GameStateManager.instance = this;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ESCAPE || event.keyCode === KeyCode.MOBILE_BACK) {
            this.backState();
        }
    }

    public changeState(newState: IGameState) {
        if (this.currentState) {
            this.currentState.onExit();
            this.stateStack.push(this.currentState);
        }
        this.currentState = newState;
        this.currentState.onEnter();
    }

    public backState() {
        if (this.stateStack.length > 0) {
            const prev = this.stateStack.pop()!;
            this.currentState?.onExit();
            this.currentState = prev;
            this.currentState.onEnter();
        } else {
            console.log("No previous state.");
        }
    }

    update(dt: number) {
        this.currentState?.update?.(dt);
    }

public startGame() {
    this.changeState(new PlayingState());
}

public pauseGame() {
    this.changeState(new PausedState());
}

public resumeGame() {
    this.backState(); // goes back to playing
}

public gameOver() {
    this.changeState(new GameOverState());
}

public backToMenu() {
    this.changeState(new MainMenuState());
}
    // helpers to show/hide UI groups
    public showUI(gamestate:GameState) {
        
        this.mainMenuUI.active = false;
        this.playingUI.active = false;
        this.pausedUI.active = false;
        this.gameOverUI.active = false;
        
        switch (gamestate) {
            case GameState.MainMenu:
                this.mainMenuUI.active = true;
                break;
        
            case GameState.Paused:
                this.pausedUI.active = true;
                break;
        
            case GameState.Playing:
                this.playingUI.active = true;
                break;
        
            case GameState.GameOver:
                this.gameOverUI.active = true;
                break;
        
            default:
                break;
        }
    }
}