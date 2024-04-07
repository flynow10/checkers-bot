import { MouseEvent, ReactNode, useMemo } from "react";
import { Board, rowColToIndex } from "./game/board";
import { Piece, isKing, isWhite } from "./game/piece";

type BoardDisplayProps = {
  board: Board;
  highlightedSquares: number[];
  flip: boolean;
  onClickSquare: (row: number, col: number, e: MouseEvent) => void;
};

export default function BoardDisplay({
  board,
  highlightedSquares,
  flip,
  onClickSquare,
}: BoardDisplayProps) {
  const displayBoard = useMemo(() => {
    if (flip) {
      return board
        .map((row) => row.slice().reverse())
        .slice()
        .reverse();
    }
    return board;
  }, [board, flip]);
  return (
    <div className="flex flex-col">
      {displayBoard.map((row, rowI) => {
        return (
          <div className="flex" key={rowI}>
            {row.map((piece, pieceI) => {
              let pieceDisplay: ReactNode = null;

              if (piece !== Piece.None) {
                pieceDisplay = (
                  <div
                    className={
                      "absolute top-1/2 left-1/2 w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 flex justify-center items-center " +
                      (isWhite(piece)
                        ? "bg-white text-black"
                        : "bg-black text-white")
                    }
                  >
                    {isKing(piece) && <span>King</span>}
                  </div>
                );
              }

              return (
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (flip) {
                      onClickSquare(7 - rowI, 7 - pieceI, e);
                    } else {
                      onClickSquare(rowI, pieceI, e);
                    }
                  }}
                  onClick={(e) => {
                    if (flip) {
                      onClickSquare(7 - rowI, 7 - pieceI, e);
                    } else {
                      onClickSquare(rowI, pieceI, e);
                    }
                  }}
                  className={
                    "w-8 h-8 flex justify-center items-center relative " +
                    (highlightedSquares.includes(
                      flip
                        ? rowColToIndex(7 - rowI, 7 - pieceI)
                        : rowColToIndex(rowI, pieceI)
                    )
                      ? "bg-green-400"
                      : (pieceI + rowI) % 2 === 0
                      ? "bg-blue-300"
                      : "bg-amber-700")
                  }
                  key={pieceI}
                >
                  {pieceDisplay}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
