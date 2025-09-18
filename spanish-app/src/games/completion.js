import { Typography, Button, CircularProgress, Box } from "@mui/material"
import SpeechButton from "../speech"
import { useState, useEffect, useRef } from "react";
import TranslateIcon from '@mui/icons-material/Translate';
import { BasicPopover } from "./ui-objects";
import { MultipleChoice } from "./helper-game-objects";
import Mascot from "../mascot";
import { CheckCircle, XCircle, Question, Money } from "phosphor-react";
import { AnimatedTypography, GradientTypography, BackgroundTypography, OutlinedGlowTypography, EnhancedSolidTypography } from "../utils/funfonts";
import { Height } from "@mui/icons-material";

//******************************************************************************** */
//GameCompletionComponent
//******************************************************************************** */
export function GameCompletionComponent({ numCorrect, totalQuestions }) {
    const fractionCorrect = numCorrect / totalQuestions;
    const percentage = Math.round(fractionCorrect * 100);
  
    // Animated display percentage
    const [displayPercentage, setDisplayPercentage] = useState(0);

    const CorrectIcon = <CheckCircle size={30} color={"rgb(18, 169, 10)"} weight={"duotone"} className={"drop-shadow-sm"}/>
    const IncorrectIcon = <XCircle size={30} color={"rgb(255, 0, 0)"} weight={"duotone"} className={"drop-shadow-sm"}/>
    const TotalIcon = <Question size={30} color={"rgb(117, 100, 100)"} weight={"duotone"} className={"drop-shadow-sm"}/>
    const CurrencyIcon = <Money size={30} color="rgb(7, 86, 49)" weight={"duotone"} className={"drop-shadow-sm"}/>
  
    useEffect(() => {
      let start = 0;
      const duration = 1000; // animation time in ms
      const stepTime = 16; // ~60fps
      const increment = percentage / (duration / stepTime);
  
      const timer = setInterval(() => {
        start += increment;
        if (start >= percentage) {
          setDisplayPercentage(percentage);
          clearInterval(timer);
        } else {
          setDisplayPercentage(Math.round(start));
        }
      }, stepTime);
  
      return () => clearInterval(timer);
    }, [percentage]);
  
    const getMessage = () => {
      if (fractionCorrect === 1) return "Perfecto!";
      if (fractionCorrect >= 0.9) return "Almost Perfect!";
      if (fractionCorrect >= 0.7) return "Great Job!";
      if (fractionCorrect >= 0.5) return "Good!";
      if (fractionCorrect >= 0.3) return "Good Effort!";
      if (fractionCorrect >= 0.1) return "Nice Try!";
      return "Better Luck Next Time!";
    };
  
    return (
      <div className="game-completion-container">
        {/* Message */}
        <Mascot size='180px'></Mascot>

        {/* <Typography variant="h4" align="center" sx={{color:'rgb(7, 121, 35)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>{getMessage()}</Typography> */}
        <AnimatedTypography children={getMessage()}/>
        {/* Score */}

        <div className="completion-score" style={{ position: "relative" }}>
          {/* Background circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={6}
            sx={{
              color: "#d1f0de",
              position: "absolute",
            }}
          />
  
          {/* Progress circle */}
          <CircularProgress
            variant="determinate"
            value={displayPercentage}
            size={120}
            thickness={6}
            sx={{
              color: "#16ae55",
              filter: "drop-shadow(0 0 6px rgba(22, 174, 85, 0.6))",
              transition: "all 0.2s ease-out",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
  
          {/* Percentage text */}
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#16ae55",
              animation: "popIn 0.4s ease-out",
              "@keyframes popIn": {
                "0%": {
                  transform: "translate(-50%, -50%) scale(0.6)",
                  opacity: 0,
                },
                "80%": {
                  transform: "translate(-50%, -50%) scale(1.1)",
                  opacity: 1,
                },
                "100%": {
                  transform: "translate(-50%, -50%) scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            {displayPercentage}%
          </Typography>
        </div>
  
        {/* Stats */}
        <div className="completion-stats-container">
          <div className="completion-stat-row completion-stat-total">
            <span className="completion-stat-label">{CurrencyIcon}</span>
            <span className="completion-stat-value">{numCorrect}</span>
          </div>
  
          <div className="completion-stat-row completion-stat-correct">
            <span className="completion-stat-label">{CorrectIcon}</span>
            <span className="completion-stat-value">{numCorrect}</span>
          </div>
  
          <div className="completion-stat-row completion-stat-incorrect">
            <span className="completion-stat-label">{IncorrectIcon}</span>
            <span className="completion-stat-value">
              {totalQuestions - numCorrect}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  