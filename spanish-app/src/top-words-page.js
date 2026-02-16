import ChapterCard, { WordRangeCard } from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';
import Mascot from "./mascot";
import { Typography } from "@mui/material";
import { getTopWordsProgress } from "./game-menu";
import { TOP_WORDS_INDEX_RANGE } from "./App";


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


export default function TopWordsPage({setSection, setChapterIndex, setGameId}) {

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

    function getColor(i) {
        return gradientColors[i % gradientColors.length];
    }

    const wordRanges = Array(1000 / 50);
    for (let i = 0; i < wordRanges.length; i++) {
        wordRanges[i] = i*50;
    }
    
    const wordRangeProgresses = Array(wordRanges.length);
    for (let i = 0; i < wordRanges.length; i++) {
        wordRangeProgresses[i] = getTopWordsProgress(i + TOP_WORDS_INDEX_RANGE);
    }

    const isUnlockedArray = Array(wordRanges.length);
    for (let i = 0; i < wordRanges.length; i++) {
        if (i === 0) {
            isUnlockedArray[i] = true;
        } else {
            isUnlockedArray[i] = wordRangeProgresses[i - 1] >= 50;
        }
    }
    
    return (
        <div className="chapters-container">
            <div className='chapters-container-top-header'>
                <Mascot clickable={true}></Mascot>          
            </div>
            <Typography variant="subtitle2" align="center" sx={{color:'rgb(119, 118, 118)', width:"100%", fontWeight: 600, fontFamily: '"Inter", sans-serif'}}>Top 1000 Spanish Words</Typography>
    
            <div className="chapters-grid">
                {wordRanges.map((progress, i) => (
                    <WordRangeCard key={`${i}-wrc`} i={i} progress={wordRangeProgresses[i]} setSection={setSection} setIndex={setChapterIndex} setGameId={setGameId} color={getColor(i)} isUnlocked={isUnlockedArray[i]}/>
                ))}
            </div>

        </div>
        
    );
}