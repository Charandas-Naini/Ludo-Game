// In your scene's main script:
import { _decorator, Component } from 'cc';
import { GameStateManager } from './GameStateManager';
import { MainMenuState } from './MainMenuState';
const { ccclass } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    start() {
        GameStateManager.instance.changeState(new MainMenuState());
    }
}
