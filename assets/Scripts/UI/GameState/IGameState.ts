// IGameState.ts
export interface IGameState {
    onEnter(): void;
    onExit(): void;
    update?(dt: number): void;
}
