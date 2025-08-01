import ChapterCard from "./card";
import chapterCovers from "./json-files/chapterCovers.json"
import './App.css';
import Mascot from "./mascot";
import { useState } from "react";


export default function ChaptersPage({setSection, setChapterIndex}) {

    const [mascotMouth, setMascotMouth] = useState(false);
    const fills = Array(20);
    // fills[0] = 3;

    
    return (
        <div className="chapters-container">
            <div className='chapters-container-top-header'>
                <div onClick={() => {setMascotMouth(!mascotMouth)}}>
                <Mascot speaking={mascotMouth}></Mascot>
                </div>
                
            </div>
            
            {chapterCovers.map((chapter, i) => (
                <ChapterCard key={i*100} number={chapter.number} content={chapter.description} title={chapter.title} color={chapter.color} setSection={setSection} setIndex={setChapterIndex} i={i} fill={fills[i]}/>
            ))}
            <div className='chapters-padding'/>
        </div>
        
    );
}