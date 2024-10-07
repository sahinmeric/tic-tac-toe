import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Board from "./Board";
import { database } from "./firebaseConfig";
import { ref, onValue, set, push, get } from "firebase/database";

interface GameState {
  squares: string[];
  xIsNext: boolean;
  winner: string | null;
  winningLine?: number[] | null;
  playerX?: string;
  playerO?: string;
}

const initialGameState: GameState = {
  squares: Array(9).fill(""),
  xIsNext: true,
  winner: null,
  winningLine: null,
};

const Game: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showGameIdInput, setShowGameIdInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O" | null>(null);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);

  useEffect(() => {
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const state = snapshot.val();
        if (state) {
          setGameState(state);
        }
      });
      return () => unsubscribe();
    }
  }, [gameId]);

  const createNewGame = () => {
    const newGameRef = push(ref(database, "games"));
    const playerX = `${Math.random().toString(36).substr(2, 9)}`; // Generate a random player ID
    set(newGameRef, { ...initialGameState, playerX });
    setGameId(newGameRef.key);
    setCurrentPlayer("X");
  };

  const handleJoinClick = () => {
    setShowGameIdInput(true);
  };

  const joinGame = async (id: string) => {
    if (!id.trim()) {
      setErrorMessage("Please enter a valid game ID.");
      return;
    }

    const gameRef = ref(database, `games/${id}`);

    try {
      const snapshot = await get(gameRef);
      if (!snapshot.exists()) {
        setErrorMessage("Game ID not found. Please enter a valid game ID.");
        return;
      }

      const gameData = snapshot.val();

      const isPlayerXSet = !!gameData.playerX;
      const isPlayerOSet = !!gameData.playerO;

      if (!isPlayerXSet) {
        set(
          ref(database, `games/${id}/playerX`),
          `${Math.random().toString(36).substr(2, 9)}`
        );
        setCurrentPlayer("X");
      } else if (!isPlayerOSet) {
        const playerO = `${Math.random().toString(36).substr(2, 9)}`;
        set(ref(database, `games/${id}/playerO`), playerO);
        setCurrentPlayer("O");
      } else {
        setErrorMessage(
          "This game already has two players. Please create a new game."
        );
        return;
      }

      setGameId(id);
      setGameState(gameData);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error checking game ID:", error);
      setErrorMessage(
        "An error occurred while trying to join the game. Please try again."
      );
    }
  };

  const handleCopyGameId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId).then(() => {
        setCopyTooltipOpen(true);
        setTimeout(() => setCopyTooltipOpen(false), 1500);
      });
    }
  };

  const handleClick = (index: number) => {
    if (
      !gameId ||
      gameState.winner ||
      gameState.squares[index] ||
      (gameState.xIsNext && currentPlayer !== "X") ||
      (!gameState.xIsNext && currentPlayer !== "O")
    ) {
      return;
    }

    const squares = gameState.squares.slice();
    squares[index] = gameState.xIsNext ? "X" : "O";

    const { winner, winningLine } = calculateWinner(squares);

    const newGameState: GameState = {
      ...gameState,
      squares,
      xIsNext: !gameState.xIsNext,
      winner,
      winningLine,
    };

    const gameRef = ref(database, `games/${gameId}`);
    set(gameRef, newGameState);
  };

  const calculateWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], winningLine: lines[i] };
      }
    }
    return { winner: null, winningLine: null };
  };

  const restartGame = () => {
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`);
      set(gameRef, {
        ...initialGameState,
        playerX: gameState.playerX,
        playerO: gameState.playerO,
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 4 }}>
      <Typography variant="h3" gutterBottom>
        Tic-Tac-Toe
      </Typography>
      {!gameId && (
        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={createNewGame}
            sx={{ marginBottom: 2 }}
          >
            Create New Game
          </Button>
          {!showGameIdInput ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleJoinClick}
            >
              Join Game
            </Button>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <TextField
                variant="outlined"
                label="Game id"
                placeholder="Paste the game ID here"
                onChange={(e) => joinGame(e.target.value)}
                sx={{ marginBottom: 2, width: "300px" }}
              />
              {errorMessage && (
                <Typography
                  color="error"
                  variant="subtitle2"
                  sx={{ marginBottom: 2 }}
                >
                  {errorMessage}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      {gameId && (
        <>
          {!(gameState.playerX && gameState.playerO) && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "8px 16px",
                marginBottom: "16px",
                fontFamily: "monospace",
              }}
            >
              <Typography variant="body1" sx={{ marginRight: "8px" }}>
                Game ID: {gameId}
              </Typography>
              <Tooltip
                title="Copied!"
                open={copyTooltipOpen}
                onClose={() => setCopyTooltipOpen(false)}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <IconButton size="small" onClick={handleCopyGameId}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Typography variant="h6" gutterBottom>
            {gameState.winner
              ? gameState.winner === currentPlayer
                ? "You are the winner!"
                : `Player ${gameState.winner} won!`
              : `You are Player ${currentPlayer}`}
          </Typography>
          <Typography variant="h6">
            {currentPlayer === (gameState.xIsNext ? "X" : "O")
              ? "It's your turn."
              : `Waiting for Player ${
                  gameState.xIsNext ? "X" : "O"
                } to make a move.`}
          </Typography>
          <Board
            squares={gameState.squares}
            onClick={handleClick}
            winningLine={gameState.winningLine}
          />
          <Box mt={4} className="game-info">
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button variant="contained" color="error" onClick={restartGame}>
                Restart Game
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setGameId(null);
                  setShowGameIdInput(false);
                }}
              >
                Go to Main Page
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Game;
