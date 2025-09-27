import { GameOverState } from "./GameOverState";
import { GameState } from "./GameState/GameState";
import { IGameState } from "./GameState/IGameState";
import { GameStateManager } from "./GameStateManager";
import { PausedState } from "./PausedState";


export class PlayingState implements IGameState {
    onEnter(): void {
        GameStateManager.instance.showUI(GameState.Playing);
        //console.log("Playing Enter");
    }
    onExit(): void { 
        //console.log("Playing Exit"); 
    }
    public pauseGame() {
        GameStateManager.instance.changeState(new PausedState());
    }
    public gameOver() {
        GameStateManager.instance.changeState(new GameOverState());
    }
}