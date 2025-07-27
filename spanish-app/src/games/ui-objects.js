import { LinearProgress, Box } from "@mui/material";
import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';


export function ProgressBar({ progress }) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', marginBottom:'10px' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color='#f56e4f'
          sx={{
            width: '100%',
            height: '12px',
            borderRadius: '10px',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#f56e4f',
            },
            backgroundColor: 'white',
            border: 'solid',
            borderWidth: '0.5px',
            borderColor: 'black'

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
  return text.replace(punctuationAndSpaceRegex, '')
}