import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import './App.css';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { Icon } from '@mui/material';
import {IconButton} from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import FavoriteIcon from '@mui/icons-material/Favorite';




export default function ChapterCard({number, onFavorite, favorite, content, title, color, setSection, setIndex, i, fill}) {
    const GameMenu = 'MenuGame'
    const numGames = 6;
    const numStars = fill === null? 0 : fill;

    const stars = Array(numGames)
    for (let i = 0; i < 6; i++) {
        if (i < numStars) {
            stars[i] = true;
        } else {
            stars[i] = false;
        }
            

    }


    const handleClick = (e) => {
        setSection(GameMenu);
        setIndex(i);
    }



    return (
        <div className='simple-card-container'>
            <button className='simple-card-button' onClick={handleClick}>
                <div className='simple-card-number' style={{backgroundColor: color}}>
                <Typography level='h1' color='white'>{number}</Typography>
                </div>

                <div className='simple-card-content'>
                    <Typography level="title" sx={{textAlign: 'left', overflow: 'hidden', fontWeight: 550}}>{title}</Typography>
                    <div className='simple-card-stars-container'>
                    {

                        stars.map((val) => {
                            return (
                                <Icon>
                                    {val? (<StarIcon sx={{color: 'rgb(255, 183, 0)'}} />) : (<StarBorderIcon sx={{color: 'grey'}}/>)}
                                </Icon>
                            )
                        })

                    }
                    </div>
                    {/* <Typography level='title'  sx={{textAlign: 'left', marginLeft:'5px', overflowY: 'hidden'}}>{content}</Typography> */}
                </div>
            </button>
            <div className='favorite-button-container'>
                    <IconButton sx={{zIndex:100}} onClick={() => onFavorite(i)} disabled={favorite}><StarsIcon sx={{color: favorite? 'rgb(255, 183, 0)':'rgb(172, 172, 172)'}}/></IconButton>
                </div>

        </div>

    );

}