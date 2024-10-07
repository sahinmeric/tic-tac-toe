import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";

const AnimatedWaitingMessage: React.FC = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."));
    }, 750);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="h6" gutterBottom>
      Waiting for opponent's move{dots}
    </Typography>
  );
};

export default AnimatedWaitingMessage;
