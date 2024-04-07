import { Board } from "./board";
import { generateMoves } from "./movegen";

export enum GameResult {
  Playing,
  WhiteWins,
  BlackWins,
}

export const getGameResult = (board: Board, whiteToMove: boolean) => {
  const legalMoves = generateMoves(board, whiteToMove);
  if (legalMoves.length === 0) {
    if (whiteToMove) {
      return GameResult.BlackWins;
    } else {
      return GameResult.WhiteWins;
    }
  }
  return GameResult.Playing;
};
