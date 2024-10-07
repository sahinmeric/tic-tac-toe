import React from "react";
import { Box } from "@mui/material";
import Square from "./Square";

interface BoardProps {
  squares: string[];
  onClick: (i: number) => void;
}

const Board: React.FC<BoardProps> = ({ squares, onClick }) => {
  const renderSquare = (i: number) => {
    return <Square value={squares[i]} onClick={() => onClick(i)} />;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 100px)",
        gap: "10px", // Use `gap` instead of `gridGap`
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {Array(9)
        .fill(null)
        .map((_, i) => renderSquare(i))}
    </Box>
  );
};

export default Board;
