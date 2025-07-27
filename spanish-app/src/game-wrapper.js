
import MixedReview from "./games/mixed-review";
import Conversations from "./games/conversation-review";
import { useState } from "react";
import './App.css';
import AudioReview from "./games/audio-review";
import WordSearch from "./games/word-search"
import SentencePractice from "./games/sentence";

export default function GameWrapper({gameId, chapterIndex, setSection}) {
    
    
    function gameSelection(gameId, chapterIndex) {
        const game1 = '1';
        const game2 = '2';
        const game3 = '3';  
        const game4 = '4';
        const game5 = '5';      
        switch (gameId) {
            case game1:
                return (<MixedReview chapterIndex={chapterIndex} setSection={setSection}/>);
            case game2:
                return (<AudioReview chapterIndex={chapterIndex} setSection={setSection}/>);
            case game3:
                return (<Conversations chapterIndex={chapterIndex} audioOnly={false} setSection={setSection}></Conversations>)
            case game4:
                return (<WordSearch chapterIndex={chapterIndex} setSection={setSection}></WordSearch>)
            case game5: 
            return (<SentencePractice chapterIndex={chapterIndex} setSection={setSection}></SentencePractice>)
        }
    }
    
    
    
    return (
        <div className="game-wrapper-container">
            {gameSelection(gameId, chapterIndex)}
        </div>

    );

}