
import MixedReview from "./games/mixed-review";
import Conversations from "./games/conversation-review";
import { useState } from "react";
import './App.css';
import AudioReview from "./games/audio-review";

export default function GameWrapper({gameId, chapterIndex}) {
    
    
    function gameSelection(gameId, chapterIndex) {
        const game1 = '1';
        const game2 = '2';
        const game3 = '3';        
        switch (gameId) {
            case game1:
                return (<MixedReview chapterIndex={chapterIndex}/>);
            case game2:
                return (<AudioReview chapterIndex={chapterIndex}/>);
            case game3:
                return (<Conversations chapterIndex={chapterIndex} audioOnly={false}></Conversations>)

        }
    }
    
    
    
    return (
        <div className="game-wrapper-container">
            {gameSelection(gameId, chapterIndex)}
        </div>

    );

}