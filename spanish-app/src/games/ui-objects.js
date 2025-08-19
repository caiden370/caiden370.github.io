import { LinearProgress, Box } from "@mui/material";
import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


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
  return text.replace(/\([^)]*\)/g, '').replace(punctuationAndSpaceRegex, '').trim();
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
