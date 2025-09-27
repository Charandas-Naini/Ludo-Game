import { GameState } from "./GameState/GameState";
import { IGameState } from "./GameState/IGameState";
import { GameStateManager } from "./GameStateManager";
import { PlayingState } from "./PlayingState";

export class MainMenuState implements IGameState {
    onEnter(): void {
        GameStateManager.instance.showUI(GameState.MainMenu);
        //console.log("MainMenu Enter");
    }
    onExit(): void {
        //console.log("MainMenu Exit");
    }
    public startGame() {
        GameStateManager.instance.changeState(new PlayingState());
    }
}