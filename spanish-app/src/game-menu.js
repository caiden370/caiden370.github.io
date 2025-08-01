
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/joy/Button';
import './App.css';
import Mascot from './mascot';
import { useState } from 'react';


export default function GameMenu({setGameId, setSection}) {
    const [mascotMouth, setMascotMouth] = useState(false);


    const game = 'game'
    function handleClick(id) {
        setGameId(id);
        setSection(game);
    }



    function Item({color, itemGameId, text}) {
        return (
            <div className='game-menu-item-container' onClick={() => handleClick(itemGameId)}>
                <div className='game-menu-item'  sx={{backgroundColor: {color}}}>
                    {text}
                </div>
            </div>
        );
    }


    return (
        <div className="game-menu-container">
            <div className='chapters-container-top-header'>
                <div onClick={() => {setMascotMouth(!mascotMouth)}}>
                <Mascot speaking={mascotMouth}></Mascot>
                </div>
            </div>
            <Box sx={{ marginTop: '20px',width: '90%', justifyContent: 'center', display: 'flex',  height: '40%', color: 'primary'  }}>
            <Grid sx={{width: '90%'}}container spacing={0}>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'1'} text={"Mixed Review"}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'2'} text={"Audio Review"}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'3'} text={'Conversation Practice'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'4'} text={'Word Search'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'5'} text={'Sentence Practice'}></Item>
                </Grid>
                <Grid size={6}>
                <Item color={'#70a1ff'} itemGameId={'6'} text={'Story'}></Item>
                </Grid>
            </Grid>
            </Box>
        </div>



    );
}