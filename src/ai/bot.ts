import { Board } from "../game/board";
import { Move } from "../game/movegen";

export type Bot = {
  name: string;
  getMove: (board: Board, whiteToMove: boolean) => Move;
};
