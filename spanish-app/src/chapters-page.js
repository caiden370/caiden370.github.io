import ChapterCard from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';
import Mascot from "./mascot";
import { useState } from "react";
import { getStarFill, getStarFillCompute } from "./game-menu";
import { safeGetItem } from "./App";
import { Typography } from "@mui/material";


export default function ChaptersPage({setSection, setChapterIndex}) {

    const gradientColors = [
        "#FF0000", // Bright Red
        "#E62E00", // Slightly Darker Red-Orange
        "#CC5C00", // Orange-Red
        "#FF6600", // Vibrant Orange
        "#FF8C00", // Dark Orange-Yellow
        "#FFA500", // Bright Orange
        "#FFC300", // Golden Yellow
        "#E0FF33", // Bright Lime Green
        "#9ACD32", // Yellow-Green
        "#6B8E23", // Olive Green
        "#228B22", // Forest Green
        "#00BFFF", // Deep Sky Blue (Brighter)
        "#1E90FF", // Dodger Blue
        "#0000CD", // Medium Blue
        "#4169E1", // Royal Blue
        "#6A5ACD", // Slate Blue
        "#8A2BE2", // Blue Violet
        "#9400D3", // Dark Violet
        "#9932CC", // Dark Orchid
        "#BA55D3"  // Medium Orchid (Slightly Brighter Purple)
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
            <ChapterCard key={'favorite-chapter'} favorite={true} onFavorite={handleFavoriteUpdate} number={favChapter.number} content={favChapter.description} title={favChapter.title} color={getColor(favIndex)} setSection={setSection} setIndex={setChapterIndex} i={favIndex} fill={fills[favIndex]}/>
            <Typography align="left" sx={{fontSize: 22, width:"100%"}}>Chapters</Typography>
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} favorite={i === favIndex } onFavorite={handleFavoriteUpdate} number={chapter.number} content={chapter.description} title={chapter.title} color={getColor(i)} setSection={setSection} setIndex={setChapterIndex} i={i} fill={fills[i]}/>
            ))}
            <div className='chapters-padding'/>
        </div>
        
    );
}