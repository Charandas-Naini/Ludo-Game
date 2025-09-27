import { GameState } from "./GameState/GameState";
import { IGameState } from "./GameState/IGameState";
import { GameStateManager } from "./GameStateManager";
import { MainMenuState } from "./MainMenuState";

export class GameOverState implements IGameState {
    onEnter(): void {
        GameStateManager.instance.showUI(GameState.GameOver);
        //console.log("GameOver Enter");
    }
    onExit(): void { 
        //console.log("GameOver Exit"); 

    }
    public goToMenu() {
        GameStateManager.instance.changeState(new MainMenuState());
    }
}