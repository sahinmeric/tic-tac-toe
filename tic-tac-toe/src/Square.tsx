import React from "react";
import { Button } from "@mui/material";

interface SquareProps {
  value: string;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        width: 100,
        height: 100,
        fontSize: "24px",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {value}
    </Button>
  );
};

export default Square;
