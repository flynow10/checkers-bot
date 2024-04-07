export enum Piece {
  None,
  White,
  Black,
  WhiteKing,
  BlackKing,
}

export const isWhite = (piece: Piece) => {
  return piece === Piece.White || piece === Piece.WhiteKing;
};

export const isKing = (piece: Piece) => {
  return piece === Piece.WhiteKing || piece === Piece.BlackKing;
};

export const makeKing = (piece: Piece) => {
  if (piece === Piece.None) {
    return piece;
  }
  return isWhite(piece) ? Piece.WhiteKing : Piece.BlackKing;
};

export const demoteKing = (piece: Piece) => {
  if (piece === Piece.None) {
    return piece;
  }
  return isWhite(piece) ? Piece.White : Piece.Black;
};
