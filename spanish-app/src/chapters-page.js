import ChapterCard from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';
import Mascot from "./mascot";
import { useState } from "react";
import { getStarFill, getStarFillCompute } from "./game-menu";
import { safeGetItem } from "./App";
import { Typography } from "@mui/material";


import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookIcon from '@mui/icons-material/Book';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloudIcon from '@mui/icons-material/Cloud';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FlightIcon from '@mui/icons-material/Flight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ForumIcon from '@mui/icons-material/Forum';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import PetsIcon from '@mui/icons-material/Pets';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import SchoolIcon from '@mui/icons-material/School';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import WavingHandIcon from '@mui/icons-material/WavingHand';

// This constant maps a string name to the actual MUI component
export const topicIcons = {
  "GreetingsIcon": WavingHandIcon,
  "EverydayEssentialsIcon": ShoppingCartIcon,
  "ConjugatingVerbsIcon": BookIcon,
  "PeopleFamilyIcon": PeopleIcon,
  "ActivitiesIcon": PetsIcon,
  "AroundTheHouseIcon": HomeIcon,
  "DescribingThingsIcon": ForumIcon,
  "FoodDrinkIcon": FastfoodIcon,
  "WeatherIcon": CloudIcon,
  "VerbTensesIcon": AccessTimeIcon,
  "HobbiesIcon": FavoriteIcon,
  "TravelIcon": FlightIcon,
  "HealthBodyIcon": LocalHospitalIcon,
  "ShoppingMoneyIcon": AttachMoneyIcon,
  "WeTheyIcon": PeopleIcon,
  "IntroductionsIcon": WavingHandIcon,
  "FeelingsEmotionsIcon": SentimentSatisfiedAltIcon,
  "GivingOpinionsIcon": ChatBubbleIcon,
  "ComplimentsIcon": StarIcon,
  "ConversationsIcon": ForumIcon,
  "MedicineIcon": LocalHospitalIcon,
  "PregnancyIcon": PregnantWomanIcon,
  "TenseIcon": AccessTimeIcon,
  "SchoolIcon": SchoolIcon
};


export default function ChaptersPage({setSection, setChapterIndex}) {

    const gradientColors = [
        "rgb(254, 210, 210)", // Extremely Light Pastel Red
        "rgb(254, 215, 210)", // Extremely Light Pastel Red-Orange
        "rgb(254, 225, 210)", // Extremely Light Pastel Orange-Red
        "rgb(254, 235, 210)", // Extremely Light Pastel Orange
        "rgb(254, 245, 210)", // Extremely Light Pastel Dark Orange-Yellow
        "rgb(254, 255, 210)", // Extremely Light Pastel Bright Orange
        "rgb(254, 255, 210)", // Extremely Light Pastel Golden Yellow
        "rgb(238, 255, 210)", // Extremely Light Pastel Lime Green
        "rgb(220, 255, 210)", // Extremely Light Pastel Yellow-Green
        "rgb(190, 240, 210)", // Extremely Light Pastel Olive Green
        "rgb(200, 240, 210)", // Extremely Light Pastel Forest Green
        "rgb(210, 240, 254)", // Extremely Light Pastel Deep Sky Blue
        "rgb(210, 230, 254)", // Extremely Light Pastel Dodger Blue
        "rgb(210, 210, 254)", // Extremely Light Pastel Medium Blue
        "rgb(210, 210, 254)", // Extremely Light Pastel Royal Blue
        "rgb(215, 210, 254)", // Extremely Light Pastel Slate Blue
        "rgb(225, 210, 254)", // Extremely Light Pastel Blue Violet
        "rgb(235, 210, 254)", // Extremely Light Pastel Dark Violet
        "rgb(245, 210, 254)", // Extremely Light Pastel Dark Orchid
        "rgb(255, 210, 254)", // Extremely Light Pastel Medium Orchid
    ];
    const [favChapter, setFavChaptor] = useState(chapterCovers[getFavoriteChapter()]);
    const [favIndex, setFavIndex] = useState(getFavoriteChapter());

    function getColor(i) {
        return gradientColors[i % gradientColors.length];
    }

    function getFavoriteChapter() {
        return safeGetItem('fav-chapter');
    }

    function replaceFavoriteChapter(id) {
        localStorage.setItem('fav-chapter', id);
    }

    function handleFavoriteUpdate(id) {
        replaceFavoriteChapter(id);
        setFavIndex(id);
        setFavChaptor(chapterCovers[getFavoriteChapter()]);
    }

    
    const fills = Array(chapterCovers.length);
    for (let i = 0; i < chapterCovers.length; i++) {
        fills[i] = getStarFillCompute(i);
    }
    
    return (
        <div className="chapters-container">
            <div className='chapters-container-top-header'>
                <Mascot clickable={true}></Mascot>
                
            </div>
            <Typography variant="subtitle2" align="center" sx={{color:'rgb(119, 118, 118)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>Favorite</Typography>
            <ChapterCard key={'favorite-chapter'} favorite={true} iconName={favChapter.icon} onFavorite={handleFavoriteUpdate} number={favChapter.number} content={favChapter.description} title={favChapter.title} color={getColor(favIndex)} setSection={setSection} setIndex={setChapterIndex} i={favIndex} fill={fills[favIndex]}/>
            <Typography variant="subtitle2" align="center" sx={{color:'rgb(119, 118, 118)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>Chapters</Typography>
            
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} favorite={i === favIndex } iconName={chapter.icon} onFavorite={handleFavoriteUpdate} number={chapter.number} content={chapter.description} title={chapter.title} color={getColor(i)} setSection={setSection} setIndex={setChapterIndex} i={i} fill={fills[i]}/>
            ))}
            
        </div>
        
    );
}