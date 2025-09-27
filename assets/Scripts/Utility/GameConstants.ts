import { _decorator, color, Color, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameConstants')
export class GameConstants {
    public static readonly Yellow: Color = new Color().fromHEX('#FFFF00');
    public static readonly Red: Color    = new Color().fromHEX('#FF0000');
    public static readonly Blue: Color   = new Color().fromHEX('#0000FF');
    public static readonly Green: Color  = new Color().fromHEX('#00FF00');
    public static readonly TOTAL_STEPS: number = 57;
    
    // Dice
    private static _DICE_HIGHLIGHT_DURATION: number = 1.5;
    private static _DICE_ROLL_DURATION: number = 0.5;
    private static _DICE_SPRITE_DURATION: number = 0.1;
    private static _SCALE_HIGHLIGHT: number = 1.3;
    private static _SCALE_UNHIGHLIGHT: number = 1;

    // Pawn
    private static _PAWN_MOVE_DURATION: number = 0.2;
    private static _PAWN_MOVE_NEXTTURN_DURATION: number = 0.5;
    private static _PAWNS_REARRANGE_DURATION_AFTERKILLED: number = 0.3;
    private static _PAWNS_REARRANGE_DURATION: number = 0.25;
    private static _PAWNS_DEATH_DURATION: number = 0.25;
    private static _PAWN_MOVEDCALLBACK_DURATION: number = 0.01;
    private static _PAWN_BLINK_DURATION: number = 0.25;

    public static readonly PAWN_STARTINDEX_YELLOW: number = 1;
    public static readonly PAWN_STARTINDEX_BLUE: number = 14;
    public static readonly PAWN_STARTINDEX_RED: number = 27;
    public static readonly PAWN_STARTINDEX_GREEN: number = 40;


    // Board
    public static readonly SAFE_ZONES: number[] = [1, 9, 14, 22, 27, 35, 40, 48];
    public static readonly HOME_ZONES: number[] = [52, 53, 54, 55, 56, 57, 58];


    // 👉 Getters (other scripts use these to read values safely)

    // Durations with multiplier
    public static get DICE_HIGHLIGHT_DURATION() { return this._DICE_HIGHLIGHT_DURATION * this.GAMESPEED; }
    public static get DICE_ROLL_DURATION() { return this._DICE_ROLL_DURATION * this.GAMESPEED; }
    public static get DICE_SPRITE_DURATION() { return this._DICE_SPRITE_DURATION * this.GAMESPEED; }

    public static get PAWN_MOVE_DURATION() { return this._PAWN_MOVE_DURATION * this.GAMESPEED; }
    public static get PAWN_MOVE_NEXTTURN_DURATION() { return this._PAWN_MOVE_NEXTTURN_DURATION * this.GAMESPEED; }
    public static get PAWNS_REARRANGE_DURATION_AFTERKILLED() { return this._PAWNS_REARRANGE_DURATION_AFTERKILLED * this.GAMESPEED; }
    public static get PAWNS_REARRANGE_DURATION() { return this._PAWNS_REARRANGE_DURATION * this.GAMESPEED; }
    public static get PAWNS_DEATH_DURATION() { return this._PAWNS_DEATH_DURATION * this.GAMESPEED; }
    public static get PAWN_MOVEDCALLBACK_DURATION() { return this._PAWN_MOVEDCALLBACK_DURATION * this.GAMESPEED; }
    public static get PAWN_BLINK_DURATION() { return this._PAWN_BLINK_DURATION * this.GAMESPEED; }

    public static get SCALE_HIGHLIGHT() { return this._SCALE_HIGHLIGHT; }
    public static get SCALE_UNHIGHLIGHT() { return this._SCALE_UNHIGHLIGHT; }

    // 👉 Adjust all durations by a percent
    public static GAMESPEED = 1;


    public static isSafeZone(cellIndex: number): boolean {
        // Adjust safe positions to your Ludo layout
        return GameConstants.SAFE_ZONES.includes(cellIndex);
    }
    public static isHomeZone(cellIndex: number): boolean {
        // Adjust safe positions to your Ludo layout
        return GameConstants.HOME_ZONES.includes(cellIndex);
    }
}


