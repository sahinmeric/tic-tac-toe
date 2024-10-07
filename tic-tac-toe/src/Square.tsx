import React from "react";
import { Button } from "@mui/material";

interface SquareProps {
  value: string;
  onClick: () => void;
  isWinningSquare?: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        width: 100,
        height: 100,
        fontSize: "24px",
        fontWeight: "bold",
        backgroundColor: isWinningSquare ? "lightgreen" : "white",
        border: "1px solid #ccc",
      }}
    >
      {value}
    </Button>
  );
};

export default Square;
