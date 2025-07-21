import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import './App.css';




export default function ChapterCard({number, content, title, color, setSection, setIndex, i}) {
    const GameMenu = 'MenuGame'

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
                    <Typography level='h4' sx={{textAlign: 'left', overflow: 'hidden'}}>{title}</Typography>
                    <Typography level='title'  sx={{textAlign: 'left', marginLeft:'5px', overflowY: 'hidden'}}>{content}</Typography>
                </div>
            </button>

        </div>

    );

}