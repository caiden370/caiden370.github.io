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
        "rgb(255, 67, 67)", // Bright Red
        "rgb(255, 69, 23)", // Slightly Darker Red-Orange
        "rgb(249, 117, 56)", // Orange-Red
        "rgb(246, 155, 77)", // Vibrant Orange
        "rgb(230, 161, 76)", // Dark Orange-Yellow
        "rgb(255, 165, 0)", // Bright Orange
        "rgb(255, 195, 0)", // Golden Yellow
        "rgb(186, 212, 35)", // Bright Lime Green
        "rgb(154, 205, 50)", // Yellow-Green
        "rgb(107, 142, 35)", // Olive Green
        "rgb(34, 139, 34)", // Forest Green
        "rgb(0, 191, 255)", // Deep Sky Blue (Brighter)
        "rgb(30, 144, 255)", // Dodger Blue
        "rgb(0, 0, 205)", // Medium Blue
        "rgb(65, 105, 225)", // Royal Blue
        "rgb(106, 90, 205)", // Slate Blue
        "rgb(138, 43, 226)", // Blue Violet
        "rgb(148, 0, 211)", // Dark Violet
        "rgb(153, 50, 204)", // Dark Orchid
        "rgb(186, 85, 211)", // Medium Orchid (Slightly Brighter Purple)
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
            <Typography align="left" sx={{fontSize: 22, width:"100%"}}>Favorite</Typography>
            <ChapterCard key={'favorite-chapter'} favorite={true} iconName={favChapter.icon} onFavorite={handleFavoriteUpdate} number={favChapter.number} content={favChapter.description} title={favChapter.title} color={getColor(favIndex)} setSection={setSection} setIndex={setChapterIndex} i={favIndex} fill={fills[favIndex]}/>
            <Typography align="left" sx={{fontSize: 22, width:"100%"}}>Chapters</Typography>
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} favorite={i === favIndex } iconName={chapter.icon} onFavorite={handleFavoriteUpdate} number={chapter.number} content={chapter.description} title={chapter.title} color={getColor(i)} setSection={setSection} setIndex={setChapterIndex} i={i} fill={fills[i]}/>
            ))}
            <div className='chapters-padding'/>
        </div>
        
    );
}