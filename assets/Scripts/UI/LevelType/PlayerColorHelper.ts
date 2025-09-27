import { color, Color } from 'cc';
import { GameConstants } from '../../Utility/GameConstants';
import { PlayerColor } from '../../PlayerHandlers/PawnSlots';

export class PlayerColorHelper {

    static get2PColors(fixedPlayerNumber: number, fixedPlayerColor: PlayerColor): Color[] {
        let colorsList: Color[] = [];

        if (fixedPlayerNumber > 1) this.getMultiColors(fixedPlayerNumber, fixedPlayerColor)

        switch (fixedPlayerColor) {
            case PlayerColor.Blue:
                colorsList = [GameConstants.Blue, GameConstants.Green];
                break;
            case PlayerColor.Green:
                colorsList = [GameConstants.Green, GameConstants.Blue];
                break;
            case PlayerColor.Yellow:
                colorsList = [GameConstants.Yellow, GameConstants.Red];
                break;
            case PlayerColor.Red:
                colorsList = [GameConstants.Red, GameConstants.Yellow];
                break;
        }

        if (fixedPlayerNumber == 1) {
            colorsList = rotateArray(colorsList, fixedPlayerNumber);
        }

        return colorsList;

    }

    private static baseOrder: PlayerColor[] = [
        PlayerColor.Red,
        PlayerColor.Green,
        PlayerColor.Blue,
        PlayerColor.Yellow,
    ];


    static getMultiColors(fixedPlayerNumber: number, fixedPlayerColor: PlayerColor): Color[] {
        let colorsList: Color[] = [];

        const index = this.baseOrder.findIndex(x => x == fixedPlayerColor);
        let base = rotateArray(this.baseOrder, (index - fixedPlayerNumber));

        base.forEach(value => {
            colorsList.push(this.getColorWithEnum(value))
        })
        return colorsList;
    }

    static getColorWithEnum(fixedPlayerColor: PlayerColor): Color {
        if (fixedPlayerColor == PlayerColor.Blue) return GameConstants.Blue;
        if (fixedPlayerColor == PlayerColor.Red) return GameConstants.Red;
        if (fixedPlayerColor == PlayerColor.Green) return GameConstants.Green;
        if (fixedPlayerColor == PlayerColor.Yellow) return GameConstants.Yellow;
    }
}

// 🔹 Utility
function rotateArray<T>(arr: T[], shift: number): T[] {
    //console.log(arr.slice(shift) + " --- " + arr.slice(0, shift) + " --- " + shift + " --- " + arr);
    return arr.slice(shift).concat(arr.slice(0, shift));
}
