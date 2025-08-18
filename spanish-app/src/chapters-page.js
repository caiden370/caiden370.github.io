import ChapterCard from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';
import Mascot from "./mascot";
import { useState } from "react";
import { getStarFill } from "./game-menu";


export default function ChaptersPage({setSection, setChapterIndex}) {

    
    const fills = Array(chapterCovers.length);
    for (let i = 0; i < chapterCovers.length; i++) {
        fills[i] = getStarFill(i);
    }
    
    return (
        <div className="chapters-container">
            <div className='chapters-container-top-header'>
                <Mascot clickable={true}></Mascot>
                
            </div>
            
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} number={chapter.number} content={chapter.description} title={chapter.title} color={chapter.color} setSection={setSection} setIndex={setChapterIndex} i={i} fill={fills[i]}/>
            ))}
            <div className='chapters-padding'/>
        </div>
        
    );
}