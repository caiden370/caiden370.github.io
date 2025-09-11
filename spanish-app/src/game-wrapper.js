
import MixedReview from "./games/mixed-review";
import Conversations from "./games/conversation-review";
import { useState } from "react";
import './App.css';
import AudioReview from "./games/audio-review";
import WordSearch from "./games/word-search"
import SentencePractice from "./games/sentence";
import Story from "./games/story";
import { localProgressString, checkLocalProgress, updateLocalProgress } from "./game-menu";
import SpeakingPractice from "./games/speak";
import { SpellBattle } from "./games/spell-battle";
import CarGame from "./games/car-game";

export default function GameWrapper({gameId, chapterIndex, setSection, updatePoints}) {

    function updatePointsAndStorage(coins, exp) {
        updateLocalProgress(chapterIndex, gameId, coins);
        updatePoints(coins, exp);
    }
    
    function gameSelection(gameId, chapterIndex) {
        const game1 = '1';
        const game2 = '2';
        const game3 = '3';  
        const game4 = '4';
        const game5 = '5';
        const game6 = '6';
        const game7 = '7';
        const game8 = '8';  
        const game9 = '9'  
        switch (gameId) {
            case game1:
                return (<MixedReview learning={true} chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}/>);
            case game2:
                return (<AudioReview chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage} />);
            case game3:
                return (<Conversations chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}></Conversations>)
            case game4:
                return (<MixedReview learning={false} chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}/>)
            case game5: 
                return (<SentencePractice chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}></SentencePractice>)
            case game6:
                return (<Story chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}></Story>)
            case game7:
                return (<SpeakingPractice chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}/>)
            case game8:
                return (<SpellBattle chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}/>)
            case game9: 
                return (<CarGame chapterIndex={chapterIndex} setSection={setSection} updatePoints={updatePointsAndStorage}></CarGame>)

            
        }
    }
    
    
    
    return (
        <div className="game-wrapper-container">
            {gameSelection(gameId, chapterIndex)}
        </div>

    );

}