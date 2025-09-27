import { director } from "cc";
import { IGameState } from "./GameState/IGameState";
import { GameStateManager } from "./GameStateManager";
import { PlayingState } from "./PlayingState";
import { GameState } from "./GameState/GameState";

export class PausedState implements IGameState {
    onEnter(): void {

        GameStateManager.instance.showUI(GameState.Paused);
        director.pause();
        //console.log("Paused: Enter");
        // Show pause UI
        // Pause timeScale if needed: director.pause();
    }
    onExit(): void {
        director.resume();
        //console.log("Paused: Exit");
        // Hide pause UI
        // Resume: director.resume();
    }
    public resumeGame() {
        // Simply go back to previous state (PlayingState)
        GameStateManager.instance.backState();
    }
}