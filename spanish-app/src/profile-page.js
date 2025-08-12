
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


export function computeLevel(exp) {
    return Math.round(exp / 100) + 1;
}


function ProgressBar({ progress }) {
    return (
      <Box sx={{ width: '80%', textAlign: 'center' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{color: "#3742fa", backgroundColor: '#70a1ff' }}
        />
      </Box>
    );
  }

export default function ProfilePage({setGlobalName, globalName, experience}) {


    const importAll = (r) => r.keys().map(r);
    const images = importAll(require.context('./static/avatars', false, /\.(png|jpe?g|svg)$/));
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const [inputName, setInputName] = useState(globalName);
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
                                    <Box
                    component="img"
                    src={images[0]}
                    alt="Descriptive text"
                    sx={{
                        width: 'auto',
                        height: '100%',
                    }}
                    />
                </div>
            </div>
                
            <div className="profile-row-2">
                <div className='profile-name-container'>
                        <Typography level='h4'>{inputName}</Typography>
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
                    <div className='profile-level-outline'><Typography level='' sx={{color: '#ffffff'}}>{computeLevel(experience)}</Typography></div>
                    <ProgressBar className='profile-exp-bar' progress={computeProgress(experience)}></ProgressBar>
                </div>

            </div>
            
        </div>
    ); 
    
}