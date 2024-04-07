import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Board,
  createBoard,
  makeMove,
  rowColToIndex,
  unmakeMove,
} from "./game/board";
import BoardDisplay from "./BoardDisplay";
import { Move, generateMoves } from "./game/movegen";
import { Piece, isWhite } from "./game/piece";
import { GameResult, getGameResult } from "./game/arbiter";
import { RandomBot } from "./ai/random";
import { Bot } from "./ai/bot";
import { AlphaBeta, loggers } from "./ai/absearch";

const EditorMode = false;

type PlayerType = "human" | "random" | "absearch";

const PlayerOptions: PlayerType[] = ["human", "random", "absearch"];

const Bots: { [key in Exclude<PlayerType, "human">]: Bot } = {
  random: RandomBot,
  absearch: AlphaBeta,
};

// const TestBoard = [
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [2, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 3, 0, 0, 0, 0],
//   [1, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 2],
//   [0, 0, 0, 0, 1, 0, 1, 0],
// ];

function App() {
  const [board, setBoard] = useState(() => createBoard(!EditorMode));
  const [flip, setFlip] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isWhiteTurn, setTurn] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState(-1);
  const [whitePlayer, setWhitePlayer] = useState<PlayerType>("human");
  const [blackPlayer, setBlackPlayer] = useState<PlayerType>("absearch");
  const [robotTurn, setRobotTurn] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const onMessage = (message: string) => {
      setLog((prev) => {
        return [...prev, message];
      });
    };
    loggers.push(onMessage);

    return () => {
      loggers.splice(loggers.indexOf(onMessage), 1);
    };
  }, []);

  const currentPlayer = isWhiteTurn ? whitePlayer : blackPlayer;
  const otherPlayer = isWhiteTurn ? blackPlayer : whitePlayer;

  const moves = useMemo(() => {
    return generateMoves(board, isWhiteTurn);
  }, [board, isWhiteTurn]);

  const squareMoves = useMemo(() => {
    return moves.filter((move) => move.startSquare === selectedSquare);
  }, [moves, selectedSquare]);

  const makeUiMove = useCallback(
    (move: Move): [Board, GameResult] => {
      const newBoard = makeMove(board, move);
      const result = getGameResult(newBoard, !isWhiteTurn);
      if (result !== GameResult.Playing) {
        alert(
          `Game over! ${
            result === GameResult.WhiteWins ? "White" : "Black"
          } wins!`
        );
      }
      setBoard(newBoard);
      setMoveHistory((prev) => {
        return [...prev, move];
      });
      setTurn(!isWhiteTurn);
      setSelectedSquare(-1);
      return [newBoard, result];
    },
    [board, isWhiteTurn]
  );

  useEffect(() => {
    if (robotTurn && currentPlayer !== "human") {
      setTimeout(() => {
        const bot = Bots[currentPlayer];
        const botMove = bot.getMove(board, isWhiteTurn);
        makeUiMove(botMove);
        setRobotTurn(false);
      }, 10);
    }
  }, [robotTurn, board, isWhiteTurn, currentPlayer, makeUiMove]);

  return (
    <>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col overflow-hidden h-2/3 items-center w-1/6 p-2">
        <span>Log</span>
        <div className="flex overflow-auto flex-col-reverse">
          {log
            .slice()
            .reverse()
            .map((message, i) => {
              return <span key={i}>{message}</span>;
            })}
        </div>
      </div>
      <div className="flex flex-col items-center h-full justify-center gap-2">
        <div className="flex w-1/3 justify-between gap-2 items-center">
          <span>To Move: {isWhiteTurn ? "White" : "Black"}</span>
          <button
            className="p-2 rounded-md border-2"
            onClick={() => setFlip(!flip)}
          >
            Flip
          </button>
        </div>
        <BoardDisplay
          board={board}
          highlightedSquares={(EditorMode ? moves : squareMoves).map(
            (move) => move.endSquare
          )}
          flip={flip}
          onClickSquare={(row, col, e) => {
            if (EditorMode) {
              setBoard((prev) => {
                const newBoard: Board = JSON.parse(JSON.stringify(prev));
                if (
                  prev[row][col] === (isWhiteTurn ? Piece.White : Piece.Black)
                ) {
                  newBoard[row][col] = isWhiteTurn
                    ? Piece.WhiteKing
                    : Piece.BlackKing;
                } else {
                  newBoard[row][col] =
                    e.button === 2
                      ? Piece.None
                      : isWhiteTurn
                      ? Piece.White
                      : Piece.Black;
                }
                return newBoard;
              });
            } else {
              if (currentPlayer === "human") {
                const piece = board[row][col];
                const index = rowColToIndex(row, col);
                if (piece !== Piece.None && isWhite(piece) === isWhiteTurn) {
                  setSelectedSquare(index);
                } else {
                  if (selectedSquare !== -1) {
                    const move = squareMoves.find(
                      (move) => move.endSquare === index
                    );
                    if (!move) {
                      setSelectedSquare(-1);
                    } else {
                      const [, result] = makeUiMove(move);
                      if (
                        otherPlayer !== "human" &&
                        result === GameResult.Playing
                      ) {
                        setRobotTurn(true);
                      }
                    }
                  }
                }
              }
            }
          }}
        />
        {!EditorMode && (
          <div className="flex gap-2 justify-between w-1/3">
            <div className="flex flex-col gap-1">
              <label htmlFor="white-select">White: </label>
              <select
                id="white-select"
                className="border-2 rounded-md p-1"
                onChange={(e) => {
                  setWhitePlayer(e.target.value as PlayerType);
                  if (isWhiteTurn && e.target.value !== "human") {
                    setRobotTurn(true);
                  }
                }}
                value={whitePlayer}
              >
                {PlayerOptions.map((option) => {
                  return (
                    <option key={option} value={option}>
                      {option === "human" ? "Human" : Bots[option].name}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              className="p-2 rounded-md border-2"
              onClick={() => {
                if (moveHistory.length > 0) {
                  const lastMove = moveHistory[moveHistory.length - 1];
                  setBoard(unmakeMove(board, lastMove));
                  setMoveHistory((prev) => {
                    return prev.slice(0, -1);
                  });
                  setTurn(!isWhiteTurn);
                  setSelectedSquare(-1);
                }
              }}
            >
              Undo Move
            </button>
            <div className="flex flex-col gap-1">
              <label htmlFor="black-select">Black: </label>
              <select
                id="black-select"
                className="border-2 rounded-md p-1"
                onChange={(e) => {
                  setBlackPlayer(e.target.value as PlayerType);
                  if (!isWhiteTurn && e.target.value !== "human") {
                    setRobotTurn(true);
                  }
                }}
                value={blackPlayer}
              >
                {PlayerOptions.map((option) => {
                  return (
                    <option key={option} value={option}>
                      {option === "human" ? "Human" : Bots[option].name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
        {EditorMode && (
          <button
            className="p-2 rounded-md border-2"
            onClick={() => {
              setTurn(!isWhiteTurn);
            }}
          >
            Switch to {isWhiteTurn ? "black" : "white"}
          </button>
        )}
      </div>
    </>
  );
}

export default App;
