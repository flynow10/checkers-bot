import {
  Board,
  getPiecesOfColor,
  indexToRowCol,
  makeMove,
} from "../game/board";
import { Move, generateMoves } from "../game/movegen";
import { isKing } from "../game/piece";
import { Bot } from "./bot";

const timePerMove = 2 * 1000;
export const loggers: ((message: string) => void)[] = [];

const log = (message: string) => {
  loggers.forEach((logger) => logger(message));
};

export const AlphaBeta: Bot = {
  name: "AlphaBeta",
  getMove: (board, whiteToMove) => {
    startTime = performance.now();
    let rootBestMove = null;
    for (let depth = 1; depth <= 50; depth++) {
      const evaluation = search(board, whiteToMove, -Infinity, Infinity, depth);
      if (!isTimeUp()) {
        log(`Depth: ${depth} Eval: ${evaluation}`);
        rootBestMove = bestMove;
        bestMove = null;
        if (Math.abs(evaluation) >= 1000 - 50) {
          break;
        }
      } else {
        bestMove = null;
        break;
      }
    }
    if (rootBestMove === null) {
      throw new Error("Failed to find any moves!");
    }
    log("Moved");
    return rootBestMove;
  },
};

const isTimeUp = () => {
  return performance.now() - startTime >= timePerMove;
};

let startTime = 0;

let bestMove: Move | null = null;

const search = (
  board: Board,
  whiteToMove: boolean,
  alpha: number,
  beta: number,
  depth: number,
  plyFromRoot = 0
): number => {
  if (depth === 0) {
    // return qsearch(board, whiteToMove, alpha, beta);
    return evaluate(board, whiteToMove);
  }
  const moves = generateMoves(board, whiteToMove);
  if (moves.length === 0) {
    return -1000 + plyFromRoot;
  }

  let bestEval = -Infinity;

  for (const move of moves) {
    if (isTimeUp()) {
      return Infinity;
    }
    const newBoard = makeMove(board, move);
    const evaluation = -search(
      newBoard,
      !whiteToMove,
      -beta,
      -alpha,
      depth - 1,
      plyFromRoot + 1
    );
    if (evaluation > bestEval) {
      bestEval = evaluation;
      if (plyFromRoot === 0) {
        bestMove = move;
      }
      if (evaluation > alpha) {
        alpha = evaluation;
        if (alpha >= beta) {
          break;
        }
      }
    }
  }
  return bestEval;
};

const chebyshevDistance = (
  row1: number,
  col1: number,
  row2: number,
  col2: number
) => {
  return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
};

// const qsearch = (
//   board: Board,
//   whiteToMove: boolean,
//   alpha: number,
//   beta: number
// ): number => {
//   const standPat = evaluate(board, whiteToMove);

//   if (standPat >= beta) {
//     return standPat;
//   }
//   if (alpha < standPat) {
//     alpha = standPat;
//   }

//   const captureMoves = generateMoves(board, whiteToMove, true);

//   if (captureMoves.length === 0) {
//     return standPat;
//   }

//   for (const move of captureMoves) {
//     const newBoard = makeMove(board, move);
//     const evaluation = -qsearch(newBoard, whiteToMove, -beta, -alpha);
//     if (evaluation >= beta) {
//       return beta;
//     }
//     if (evaluation > alpha) {
//       alpha = evaluation;
//     }
//   }
//   return alpha;
// };

const evaluate = (board: Board, whiteToMove: boolean) => {
  const materialReducer = (sum: number, pieceIndex: number): number => {
    const [row, col] = indexToRowCol(pieceIndex);
    const piece = board[row][col];
    const centerDistance =
      3 -
      Math.min(
        chebyshevDistance(row, col, 4, 3),
        chebyshevDistance(row, col, 3, 4)
      );
    return sum + (isKing(piece) ? 17 : 10) + centerDistance * 3;
  };
  let evaluation = 0;
  const whitePieces = getPiecesOfColor(board, true);
  const blackPieces = getPiecesOfColor(board, false);
  evaluation += whitePieces.reduce(materialReducer, 0);
  evaluation -= blackPieces.reduce(materialReducer, 0);
  evaluation += (whitePieces.filter((index) => index >= 56).length * 10) / 2;
  evaluation -= (blackPieces.filter((index) => index < 8).length * 10) / 2;

  return (whiteToMove ? 1 : -1) * evaluation;
};
