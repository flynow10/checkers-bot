import { Board } from "../game/board";
import { generateMoves } from "../game/movegen";
import { Bot } from "./bot";

export const RandomBot: Bot = {
  name: "Random Bot",
  getMove: (board: Board, whiteToMove: boolean) => {
    const moves = generateMoves(board, whiteToMove);
    return moves[Math.floor(Math.random() * moves.length)];
  },
};
