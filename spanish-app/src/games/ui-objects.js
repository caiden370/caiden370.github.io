import { LinearProgress, Box } from "@mui/material";
import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useState, useEffect, useRef } from 'react';


export function ProgressBar({ progress }) {
  return (
    <Box sx={{ width: '100%', marginBottom: '10px' }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 12,
          borderRadius: 10,
          backgroundColor: '#f0f0f0', // Light, modern track color
          '& .MuiLinearProgress-bar': {
            backgroundImage: 'linear-gradient(to right, #66bb6a, #81c784)',
            borderRadius: 10,
            // Override the default transition for a smoother, slower animation
            transition: 'transform 0.5s linear',
          },
        }}
      />
    </Box>
  );
}

  
  export function BasicPopover({buttonContent, popoverText}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
  
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
  
    return (
      <div>
        <IconButton sx={{width:'auto'}} aria-describedby={id} variant="contained" onClick={handleClick}>
          {buttonContent}
        </IconButton>
        <Popover
          
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {popoverText}
        </Popover>
      </div>
    );
  }



  export function generateRandomIndicesDupless(array, n) {
    const indices = new Array(n);
    const choices = new Array(array.length);

    for (let i = 0; i<array.length; i++) {
        choices[i] = i            
    }

    let avail = array.length;
    let r = 0
    for (let i = 0; i<n; i++) {
        r = Math.floor(Math.random() * avail);
        indices[i] = choices[r];
        choices[r] = choices[avail-1]
        avail = avail - 1;
    }
    return indices
}
  

export function processText(text) {
  const punctuationAndSpaceRegex = /[¿¡.,;:!?]/g;
  return text.replace(/\([^)]*\)/g, '').replace(punctuationAndSpaceRegex, '').trim().toLowerCase();
}


export function LeaveButton({setSection, updatePoints}) {
  function onClick() {
    setSection('MenuGame');
    updatePoints();
  }
  

  return (
    <div className='leave-button-row'>
      <IconButton onClick={onClick}>
        <CloseIcon></CloseIcon>
      </IconButton>

    </div>
  )

}


export function withTimeout(promise, ms = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout loading content")), ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}





export function SpanishMicButton ({ 
  callback, 
  size = 'large',
  disabled = false,
  language = 'es-ES' // Default to Spanish (Spain)
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Configure for Spanish
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false; // Only final results
      recognition.maxAlternatives = 1;
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };
      
      recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          
          // Call the callback function with the transcript
          if (callback && typeof callback === 'function') {
            callback({
              transcript: transcript.trim(),
              confidence: confidence,
              success: true
            });
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (callback && typeof callback === 'function') {
          callback({
            transcript: '',
            confidence: 0,
            success: false,
            error: event.error
          });
        }
        
        setIsListening(false);
        setIsProcessing(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
    } else {
      setIsSupported(false);
      console.warn('Speech recognition is not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [callback, language]);

  const handleClick = () => {
    if (!isSupported || disabled) return;
    
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Start listening
      if (recognitionRef.current) {
        setIsProcessing(true);
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsProcessing(false);
          
          if (callback && typeof callback === 'function') {
            callback({
              transcript: '',
              confidence: 0,
              success: false,
              error: 'Failed to start speech recognition'
            });
          }
        }
      }
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return '40px';
      case 'medium': return '48px';
      case 'large': return '56px';
      default: return '48px';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button
        onClick={handleClick}
        disabled={!isSupported || disabled || isProcessing}
        title={
          !isSupported ? 'Speech recognition not supported' :
          disabled ? 'Microphone disabled' :
          isListening ? 'Click to stop listening' :
          'Click to speak in Spanish'
        }
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: '50%',
          border: 'none',
          cursor: (!isSupported || disabled || isProcessing) ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backgroundColor: 
            !isSupported || disabled ? '#e0e0e0' :
            isListening ? '#f44336' : '#1976d2',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          position: 'relative',
          animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!disabled && isSupported && !isProcessing) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && isSupported && !isProcessing) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          }
        }}
      >
        {isProcessing ? (
          // Loading spinner
          <div
            style={{
              width: iconSize,
              height: iconSize,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
          // Microphone SVG icon
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {isListening ? (
              // Microphone off icon
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
            ) : (
              // Microphone on icon
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28C16.28 17.23 19 14.41 19 11h-1.7z"/>
            )}
          </svg>
        )}
      </button>

      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
