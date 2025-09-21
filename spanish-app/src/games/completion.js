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
import { currencyIcon } from "../topic-icons";

//******************************************************************************** */
//GameCompletionComponent
//******************************************************************************** */
export function GameCompletionComponent({ numCorrect, totalQuestions, updatePoints }) {
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

    function EmbeddedAdButton() {
        const adUrl = 'https://otieu.com/4/9907822';
        const addBonus = 5;
        const openEmbeddedAd = () => {
            window.open(adUrl, '_blank');
            updatePoints(addBonus, 0);
        };
    
        return (
            <div className="ad-button" onClick={openEmbeddedAd}>
                <Typography variant="subtitle2" align="center" sx={{color:'rgb(0, 74, 19)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>Earn {addBonus}</Typography>
                {currencyIcon()}
            </div>
        )
    }
  
    return (
      <div className="game-completion-container">
        {/* Message */}
        <Mascot size='180px'></Mascot>

        {/* <Typography variant="h4" align="center" sx={{color:'rgb(7, 121, 35)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>{getMessage()}</Typography> */}
        <AnimatedTypography children={getMessage()}/>
        {/* Score */}

        <div className="completion-score" style={{ 
          position: "relative", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          width: "120px",
          height: "120px" 
        }}>
          {/* Background circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={6}
            sx={{
              color: "#d1f0de",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
  
          {/* Progress circle */}
          <CircularProgress
            variant="determinate"
            value={displayPercentage}
            size={120}
            thickness={6}
            sx={{
              color: "#35cd74",
            //   filter: "drop-shadow(0 0 6px rgba(22, 174, 85, 0.6))",
              transition: "all 0.2s ease-out",
              position: "absolute",
              top: 0,
              left: 0,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
  
          {/* Percentage text */}
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#35cd74",
              fontFamily: '"Inter", sans-serif',
              animation: "popIn 0.4s ease-out",
              zIndex: 1,
              "@keyframes popIn": {
                "0%": {
                  transform: "scale(0.6)",
                  opacity: 0,
                },
                "80%": {
                  transform: "scale(1.1)",
                  opacity: 1,
                },
                "100%": {
                  transform: "scale(1)",
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
        {EmbeddedAdButton()}
      </div>
    );
  }
  
  