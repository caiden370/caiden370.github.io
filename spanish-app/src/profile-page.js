
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
import DoneIcon from '@mui/icons-material/Done';
import { TextField, Box } from '@mui/material';
import { useState } from 'react';
import './App.css';
import Mascot from './mascot';
import { MascotSelector } from './mascot-selection';
import { getSelectedMascot } from './utils/mascotStorage';


export function computeLevel(exp) {
    return Math.floor(exp / 100) + 1;
}

export function getLevelColor(level) {
    const value = level * 2;
    const hue = (value * 137.5) % 360;
    const saturation = 70; // %
    const lightness = 40;  // %

    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return `rgb(${r}, ${g}, ${b})`;
}



function ProgressBar({ progress }) {

    const progressStyle = {
        color: "rgb(129, 141, 235)", 
        backgroundColor: 'rgb(233, 240, 251)', 
        // border:'solid 2px rgb(9, 0, 74)',  
        borderRadius:'20px',
        height:"20px",
        marginTop:"25px",
        // Cool animations - just a few lines!
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiLinearProgress-bar': {
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)',
            backgroundSize: '20px 20px',
            animation: 'progressShimmer 2s linear infinite'
        },
        // Playful bounce when progress updates
        '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 12px rgba(129, 141, 235, 0.3)'
        }
    };

    // Add keyframe animation with a style tag (simple approach)
    const shimmerKeyframes = `
        @keyframes progressShimmer {
            0% { background-position: -20px 0; }
            100% { background-position: 40px 0; }
        }
    `;

    return (
      <>
        <style>{shimmerKeyframes}</style>
        <Box sx={{ width: '80%', textAlign: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={progressStyle}
          />
          <Typography align='right' sx={{color:'rgb(74, 67, 205)', fontSize:15}}>{progress}/100</Typography>
        </Box>
      </>
    );
}

export default function ProfilePage({setGlobalName, globalName, experience}) {


    const importAll = (r) => r.keys().map(r);
    const images = importAll(require.context('./static/avatars', false, /\.(png|jpe?g|svg)$/));
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [inputName, setInputName] = useState(globalName);
    const [mascotId, setMascotId] = useState(getSelectedMascot());
    const handleSubmit = (e) => {
        e.preventDefault();
        setGlobalName(inputName);
        handleClose();
      };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };
    
    const computeProgress = (exp) => {
        return exp % 100;
    }

    return (
        <div className="profile-container">
            <div className="profile-row-1">
                <div className='profile-avatar-container'>
                    <Mascot id={mascotId} clickable={true}></Mascot>
                </div>
            </div>
                
            <div className="profile-row-2">
                <div className='profile-name-container'>
                        <Typography level='h4' sx={{fontFamily: '"Inter", sans-serif'}}>{inputName}</Typography>
                </div>
                <div>
                    <IconButton aria-label="edit" onClick={handleOpen}>
                        <EditIcon />
                    </IconButton>
                </div>

            </div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div className='profile-form-container'>
                        <Typography level='h2'>
                            Edit Profile
                        </Typography>
                        <Box sx={style}>
                            <div className='profile-form'>
                            <TextField
                                required
                                id="outlined-required"
                                label="Name"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}

                                />
                            <IconButton type='submit' onClick={handleSubmit}>
                                <DoneIcon/>
                            </IconButton>
                            </div>


                        </Box>
                    </div>
                </Modal>
        
            <div className='profile-row-3'>
                <div className='profile-exp-bar-container'>
                    <div className='header-level-container' sx={{backgroundColor: getLevelColor(computeLevel(experience))}}><Typography sx={{color: '#ffffff', fontFamily: '"Inter", sans-serif'}}>{computeLevel(experience)}</Typography></div>
                    <ProgressBar className='profile-exp-bar' progress={computeProgress(experience)}></ProgressBar>
                </div>
            </div>
            <div className='profile-row-4'>
                <MascotSelector onSelection={(id) => {setMascotId(id)}}/>

            </div>
            
        </div>
    ); 
    
}