
import MixedReview from "./games/mixed-review";
import Conversations from "./games/conversation-review";
import { useState } from "react";
import './App.css';
import AudioReview from "./games/audio-review";
import WordSearch from "./games/word-search"
import SentencePractice from "./games/sentence";
import Story from "./games/story";

export default function GameWrapper({gameId, chapterIndex, setSection, updatePoints}) {
    
    
    function gameSelection(gameId, chapterIndex) {
        const game1 = '1';
        const game2 = '2';
        const game3 = '3';  
        const game4 = '4';
        const game5 = '5';
        const game6 = '6'      
        switch (gameId) {
            case game1:
                return (<MixedReview chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePoints}/>);
            case game2:
                return (<AudioReview chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePoints} />);
            case game3:
                return (<Conversations chapterIndex={chapterIndex} audioOnly={false} setSection={setSection} updatePoints={updatePoints}></Conversations>)
            case game4:
                return (<WordSearch chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePoints}></WordSearch>)
            case game5: 
                return (<SentencePractice chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePoints}></SentencePractice>)
            case game6:
                return (<Story chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePoints}></Story>)
            
        }
    }
    
    
    
    return (
        <div className="game-wrapper-container">
            {gameSelection(gameId, chapterIndex)}
        </div>

    );

}