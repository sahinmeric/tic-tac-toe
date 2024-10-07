import React from "react";
import { Box } from "@mui/material";
import Square from "./Square";

interface BoardProps {
  squares: string[];
  onClick: (index: number) => void;
  winningLine?: number[] | null;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winningLine }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 100px)",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {squares.map((value, index) => (
        <Square
          key={index}
          value={value}
          onClick={() => onClick(index)}
          isWinningSquare={winningLine?.includes(index)} // Pass down whether the square is a winning square
        />
      ))}
    </Box>
  );
};

export default Board;
