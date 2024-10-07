import React, { useEffect, useState } from "react";
import { Button, Container, TextField, Typography, Box } from "@mui/material";
import Board from "./Board";
import { database } from "./firebaseConfig";
import { ref, onValue, set, push, get } from "firebase/database";

interface GameState {
  squares: string[];
  xIsNext: boolean;
  winner: string | null;
  winningLine?: number[] | null;
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

  // useEffect hook to listen for game state changes in Firebase
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

  const handleJoinClick = () => {
    setShowGameIdInput(true);
  };

  const createNewGame = () => {
    const newGameRef = push(ref(database, "games"));
    set(newGameRef, initialGameState);
    setGameId(newGameRef.key);
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

      setGameId(id);
      const state = snapshot.val();
      setGameState(state);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error checking game ID:", error);
      setErrorMessage(
        "An error occurred while trying to join the game. Please try again."
      );
    }
  };

  const handleClick = (index: number) => {
    if (!gameId || gameState.winner || gameState.squares[index]) return;

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
      set(gameRef, initialGameState);
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
          <Typography variant="h6" gutterBottom>
            Game ID: {gameId}
          </Typography>
          <Board
            squares={gameState.squares}
            onClick={handleClick}
            winningLine={gameState.winningLine}
          />
          <Box mt={4} className="game-info">
            <Typography variant="h6">
              {gameState.winner
                ? `Winner: ${gameState.winner}`
                : `Next player: ${gameState.xIsNext ? "X" : "O"}`}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={restartGame}
              sx={{ mt: 2 }}
            >
              Restart Game
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Game;
