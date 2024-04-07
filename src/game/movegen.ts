import { Board, getPiecesOfColor, indexToRowCol, rowColToIndex } from "./board";
import { Piece, isKing, isWhite } from "./piece";

export type Move = {
  startSquare: number;
  endSquare: number;
  capturedIndices: number[];
  capturedPieceTypes: Piece[];
  isKing: boolean;
};

export const generateMoves = (
  board: Board,
  isWhiteTurn: boolean,
  capturesOnly = false
): Move[] => {
  const pieceSquares = getPiecesOfColor(board, isWhiteTurn);
  const moves: Move[] = [];
  for (const pieceSquare of pieceSquares) {
    moves.push(...getPieceCaptureMoves(board, pieceSquare));
  }
  if (moves.length !== 0 || capturesOnly) {
    return moves;
  }

  for (const pieceSquare of pieceSquares) {
    moves.push(...getPieceMoves(board, pieceSquare));
  }

  return moves;
};

export const getPieceMoves = (board: Board, squareIndex: number) => {
  const [row, col] = indexToRowCol(squareIndex);
  const piece = board[row][col];
  const moves: Move[] = [];

  const directions = isKing(piece)
    ? [true, false]
    : isWhite(piece)
    ? [true]
    : [false];

  for (const forward of directions) {
    if ((forward && row !== 0) || (!forward && row !== 7)) {
      const rowOffset = forward ? -1 : 1;
      const newRow = row + rowOffset;
      if (col !== 0 && board[newRow][col - 1] === Piece.None) {
        moves.push({
          startSquare: squareIndex,
          endSquare: rowColToIndex(newRow, col - 1),
          capturedIndices: [],
          capturedPieceTypes: [],
          isKing: newRow === 0 || newRow === 7,
        });
      }
      if (col !== 7 && board[newRow][col + 1] === Piece.None) {
        moves.push({
          startSquare: squareIndex,
          endSquare: rowColToIndex(newRow, col + 1),
          capturedIndices: [],
          capturedPieceTypes: [],
          isKing: newRow === 0 || newRow === 7,
        });
      }
    }
  }

  return moves;
};

export const getPieceCaptureMoves = (
  board: Board,
  squareIndex: number
): Move[] => {
  const moves: Move[] = [];
  const [row, col] = indexToRowCol(squareIndex);
  const piece = board[row][col];

  const partialMoves = getSingleMoveCaptures(board, squareIndex, piece, [], []);

  while (partialMoves.length > 0) {
    const partialMove = partialMoves.pop()!;
    const furtherCaptures = getSingleMoveCaptures(
      board,
      partialMove.endSquare,
      piece,
      partialMove.capturedIndices,
      partialMove.capturedPieceTypes
    );
    if (furtherCaptures.length > 0) {
      for (const furtherCapture of furtherCaptures) {
        partialMoves.push({
          ...furtherCapture,
          startSquare: partialMove.startSquare,
        });
      }
    } else {
      const [targetRow] = indexToRowCol(partialMove.endSquare);
      moves.push({
        ...partialMove,
        isKing: targetRow === 0 || targetRow === 7,
      });
    }
  }

  return moves;
};

const getSingleMoveCaptures = (
  board: Board,
  squareIndex: number,
  piece: Piece,
  capturedIndices: number[],
  capturedPieceTypes: Piece[]
) => {
  const [row, col] = indexToRowCol(squareIndex);
  const partialMoves: Move[] = [];

  let directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  if (!isKing(piece)) {
    if (isWhite(piece)) {
      directions = directions.slice(0, 2);
    } else {
      directions = directions.slice(2, 4);
    }
  }

  for (const direction of directions) {
    const [captureRow, captureCol] = [row + direction[0], col + direction[1]];
    const captureIndex = rowColToIndex(captureRow, captureCol);
    const [targetRow, targetCol] = [
      row + direction[0] * 2,
      col + direction[1] * 2,
    ];
    if (targetRow >= 8 || targetRow < 0 || targetCol >= 8 || targetCol < 0) {
      continue;
    }
    const capturePiece = board[captureRow][captureCol];
    if (
      capturePiece === Piece.None ||
      isWhite(piece) === isWhite(capturePiece) ||
      capturedIndices.includes(captureIndex)
    ) {
      continue;
    }
    if (board[targetRow][targetCol] !== Piece.None) {
      continue;
    }
    partialMoves.push({
      startSquare: squareIndex,
      endSquare: rowColToIndex(targetRow, targetCol),
      capturedIndices: [...capturedIndices, captureIndex],
      capturedPieceTypes: [...capturedPieceTypes, capturePiece],
      isKing: false,
    });
  }
  return partialMoves;
};
