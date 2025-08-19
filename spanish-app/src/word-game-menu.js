
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
import { safeGetItem } from './App';

const ScoreGoal = [50, 50, 20, 50, 50, 50];

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
    return safeGetItem(localProgressString(chapterIndex, gameId));
}


export function updateLocalProgress(chapterIndex, gameId, points) {
    const safePoints = Number(points || 0);
    const prevPoints = checkLocalProgress(chapterIndex, gameId);
    if (prevPoints < ScoreGoal && prevPoints + safePoints >= ScoreGoal) {
        incrementStarFill(chapterIndex);
    }
    localStorage.setItem(localProgressString(chapterIndex, gameId), prevPoints + safePoints);
}


export default function GameMenu({setGameId, setSection, chapterIndex}) {
    


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
                    <Typography>{progress} / {ScoreGoal[itemGameId-1]}</Typography>
                    {progress >= ScoreGoal[itemGameId-1]? (<StarIcon sx={{color: 'rgb(255, 183, 0)'}} />) : (<StarBorderIcon sx={{color: 'white'}}/>)}
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
                
                <Mascot clickable={true}></Mascot>
                
            </div>
            <Box sx={{ marginTop: '10px',width: '100%', justifyContent: 'center', display: 'flex', color: 'primary'}}>
            <Grid sx={{width: '90%'}}container spacing={0}>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'7'} text={"Learn"}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'8'} text={"Listen"}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'9'} text={'Word Search'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'10'} text={'Cross Word'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'11'} text={'Jumbled'}></Item>
                </Grid>
                <Grid sx={gridStyle} size={6}>
                <Item color={'#70a1ff'} itemGameId={'12'} text={'Story'}></Item>
                </Grid>
            </Grid>
            </Box>
        </div>



    );
}