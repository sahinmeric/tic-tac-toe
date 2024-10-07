import React, { useEffect, useState } from "react";
import { Button, Container, TextField, Typography, Box } from "@mui/material";
import Board from "./Board";
import { database } from "./firebaseConfig";
import { ref, onValue, set, push } from "firebase/database";

interface GameState {
  squares: string[];
  xIsNext: boolean;
  winner: string | null;
}

const initialGameState: GameState = {
  squares: Array(9).fill(""),
  xIsNext: true,
  winner: null,
};

const Game: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // useEffect hook to listen for game state changes in Firebase
  useEffect(() => {
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`);

      // Listener for changes in the game state
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
    set(newGameRef, initialGameState);
    setGameId(newGameRef.key);
  };

  const joinGame = (id: string) => {
    setGameId(id);
  };

  const handleClick = (index: number) => {
    if (!gameId || gameState.winner || gameState.squares[index]) return;

    const squares = gameState.squares.slice();
    squares[index] = gameState.xIsNext ? "X" : "O";

    const newGameState: GameState = {
      ...gameState,
      squares,
      xIsNext: !gameState.xIsNext,
      winner: calculateWinner(squares),
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
        return squares[a];
      }
    }
    return null;
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 4 }}>
      <Typography variant="h3" gutterBottom>
        Tic-Tac-Toe
      </Typography>
      {!gameId && (
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={createNewGame}
            sx={{ marginBottom: 2 }}
          >
            Create New Game
          </Button>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={2}
          >
            <TextField
              variant="outlined"
              label="Enter Game ID"
              onChange={(e) => joinGame(e.target.value)}
              sx={{ marginRight: 2 }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => joinGame(gameId || "")}
            >
              Join Game
            </Button>
          </Box>
        </Box>
      )}
      {gameId && (
        <>
          <Typography variant="h6" gutterBottom>
            Game ID: {gameId}
          </Typography>
          <Board squares={gameState.squares} onClick={handleClick} />
          <Box mt={4} className="game-info">
            <Typography variant="h6">
              {gameState.winner
                ? `Winner: ${gameState.winner}`
                : `Next player: ${gameState.xIsNext ? "X" : "O"}`}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setGameState(initialGameState)}
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
