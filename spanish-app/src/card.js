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
import { Opacity, Padding } from '@mui/icons-material';
import { StyledTopicIcons} from './topic-icons';
import { darken, lighten } from '@mui/system';





export default function ChapterCard({number, onFavorite, favorite, iconName, content, title, color, setSection, setIndex, i, fill}) {
    const GameMenu = 'MenuGame'
    const numGames = 9;
    const numStars = fill === null? 0 : fill;

    const stars = Array(numGames)
    for (let i = 0; i < numGames; i++) {
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
    const gradientStyle = (color) => {
        return {
            background: `linear-gradient(300deg, ${lighten(color, 0.3)}, ${lighten(color, 0.6)})`,
            // bottomBorder: `8px solid ${darken(color, 0.1)}`,
        };
      };


    const IconComponent = StyledTopicIcons[iconName];


    return (
        <div className='simple-card-container' style={gradientStyle(color)}>
            <button className='simple-card-button' onClick={handleClick}>
                <div className='simple-card-number'>
                {/* <Typography level='h1' color='white'>{number}</Typography> */}
                {IconComponent && <IconComponent sx={{ fontSize: 100, color: darken(color, 0.5)}} />}
                </div>

                <div className='simple-card-content'>
                    <Typography level="title" sx={{textAlign: 'left', overflow: 'hidden', fontWeight: 550, color: darken(color, 0.5), fontFamily: '"Inter", sans-serif'}}>{title}</Typography>
                    <div className='simple-card-stars-container'>
                    {

                        stars.map((val, i) => {
                            return (
                                <Icon key={`${i}-${Date.now()}`}>
                                    {val? (<StarIcon sx={{color: 'rgb(255, 183, 0)'}} />) : null}
                                </Icon>
                            )
                        })

                    }
                    </div>
                    {/* <Typography level='title'  sx={{textAlign: 'left', marginLeft:'5px', overflowY: 'hidden'}}>{content}</Typography> */}
                </div>
            </button>
            <div className='favorite-button-container'>
                    <IconButton sx={{zIndex:100}} onClick={() => onFavorite(i)} disabled={favorite}><StarsIcon sx={{color: favorite? 'rgb(255, 183, 0)':darken(color, 0.5)}}/></IconButton>
                </div>

        </div>

    );

}