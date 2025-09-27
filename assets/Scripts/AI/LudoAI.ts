import { _decorator, Component, Node } from 'cc';
import { PlayerHandler } from '../PlayerHandlers/PlayerHandler';
const { ccclass, property } = _decorator;

export interface LudoAI {
    makeMove(players: PlayerHandler, opponentPlayers :PlayerHandler[]);
}

