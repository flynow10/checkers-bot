import { Move } from "./movegen";
import { Piece, demoteKing, isWhite, makeKing } from "./piece";

export type Board = Piece[][];

export const createBoard = (initialPos = false) => {
  const board = new Array(8).fill(0).map(() => new Array(8).fill(Piece.None));

  if (initialPos) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          if (row < 3) {
            board[row][col] = Piece.Black;
          }
          if (row > 4) {
            board[row][col] = Piece.White;
          }
        }
      }
    }
  }

  return board;
};

export const makeMove = (board: Board, move: Move) => {
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const emptedSquares = [move.startSquare, ...move.capturedIndices];
  const [row, col] = indexToRowCol(move.startSquare);
  const piece = board[row][col];

  for (const emptySquare of emptedSquares) {
    const [emptyRow, emptyCol] = indexToRowCol(emptySquare);
    newBoard[emptyRow][emptyCol] = Piece.None;
  }

  const [targetRow, targetCol] = indexToRowCol(move.endSquare);

  newBoard[targetRow][targetCol] = move.isKing ? makeKing(piece) : piece;

  return newBoard;
};

export const unmakeMove = (board: Board, move: Move) => {
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const [targetRow, targetCol] = indexToRowCol(move.endSquare);
  newBoard[targetRow][targetCol] = Piece.None;

  for (let i = 0; i < move.capturedIndices.length; i++) {
    const squareIndex = move.capturedIndices[i];
    const piece = move.capturedPieceTypes[i];
    const [row, col] = indexToRowCol(squareIndex);
    newBoard[row][col] = piece;
  }

  const [startRow, startCol] = indexToRowCol(move.startSquare);
  const piece = board[targetRow][targetCol];
  newBoard[startRow][startCol] = move.isKing ? demoteKing(piece) : piece;
  return newBoard;
};

export const indexToRowCol = (index: number): [number, number] => {
  return [Math.floor(index / 8), index % 8];
};

export const rowColToIndex = (row: number, col: number) => {
  return row * 8 + col;
};

export const getPiecesOfColor = (board: Board, white: boolean): number[] => {
  const indices: number[] = [];
  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    const row = board[rowIndex];
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      const piece = row[colIndex];
      if (piece !== Piece.None && isWhite(piece) === white) {
        indices.push(rowColToIndex(rowIndex, colIndex));
      }
    }
  }
  return indices;
};
