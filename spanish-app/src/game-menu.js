
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Button from '@mui/joy/Button';
import './App.css';
import Mascot from './mascot';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { Icon, Typography } from '@mui/material';
import { useState } from 'react';

const ScoreGoal = 50;

export function getStarFill(chapterIndex) {
    return Number(localStorage.getItem(`ch${chapterIndex}-starfill`) || 0);
}

export function incrementStarFill(chapterIndex) {
    localStorage.setItem(`ch${chapterIndex}-starfill`, getStarFill(chapterIndex) + 1)
}


export function localProgressString(chapterIndex, gameId) {
    return `ch${chapterIndex}-g${gameId}-progress`;
}

export function checkLocalProgress(chapterIndex, gameId) {
    return Number(localStorage.getItem(localProgressString(chapterIndex, gameId)) || 0);
}

export function updateLocalProgress(chapterIndex, gameId, points) {
    const prevPoints = checkLocalProgress(chapterIndex, gameId);
    if (prevPoints < ScoreGoal && prevPoints + points >= ScoreGoal) {
        incrementStarFill(chapterIndex);
    }
    localStorage.setItem(localProgressString(chapterIndex, gameId), prevPoints + points);
}


export default function GameMenu({setGameId, setSection, chapterIndex}) {
    const [mascotMouth, setMascotMouth] = useState(false);


    const game = 'game'
    function handleClick(id) {
        setGameId(id);
        setSection(game);
    }


    function Item({color, itemGameId, text}) {
        const progress = checkLocalProgress(chapterIndex, itemGameId);
        return (
            <div className='game-menu-item-container' onClick={() => handleClick(itemGameId)}>
                <div className='game-menu-item-title'  sx={{backgroundColor: {color}}}>
                    {text}
                </div>
                <div className='game-menu-item-progress-container'>
                    <Typography>{progress} / {ScoreGoal}</Typography>
                    {progress >= ScoreGoal? (<StarIcon sx={{color: 'rgb(255, 183, 0)'}} />) : (<StarBorderIcon sx={{color: 'grey'}}/>)}
                </div>
            </div>
        );
    }

    


    const gridStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        padding:'4px'
    };

    return (
        <div className="game-menu-container">
            <div className='chapters-container-top-header'>
                <div onClick={() => {setMascotMouth(!mascotMouth)}}>
                <Mascot speaking={mascotMouth}></Mascot>
                </div>
            </div>
            <Box sx={{ marginTop: '10px',width: '100%', justifyContent: 'center', display: 'flex', color: 'primary'}}>
            <Grid sx={{width: '90%'}}container spacing={0}>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'1'} text={"Learn"}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'2'} text={"Listen"}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'3'} text={'Conversations'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'4'} text={'Word Search'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'5'} text={'Jumbled'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'6'} text={'Story'}></Item>
                </Grid>
            </Grid>
            </Box>
        </div>



    );
}