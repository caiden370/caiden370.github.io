
import { useState } from "react";

export function GameController({chapterIndex, setSection, updatePoints}) {
    const [playerHP, setPlayerHP] = useState(100);
    const [enemyHP, setEnemyHP] = useState(100);
    const [playerCards, setPlayerCards] = useState(Array());
    const [enemyCards, setEnemyCards] = useState(Array());
    const [displayQuestions, setDisplayQuestions] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [displayHelpModal, setDisplayHelpModal] = useState(false);



    return (
        <div className='spell-game-container'>
            <div className='sg-enemy-side'>
                <div className="sg-enemy-mascot-row">
                    <div className="sg-health-bar">{healthBar(enemyHP)}</div>
                    <div className="sg-mascot"></div>
                </div>

            </div>
            <div className='sg-animation-zone'></div>
            <div className='sg-player-side'>
                <div className="sg-player-mascot-row">
                    <div className="sg-mascot"></div>
                    <div className="sg-health-bar">{healthBar(playerHP)}</div> 
                </div>
                <div className="sg-card-selection"></div>
            </div>
            {displayQuestions && quiz()}
            {displayHelpModal && helpModal()}
        </div>

        
    )
}


function quiz(setQuizScore) {

}

function helpModal() {

}

function healthBar(health) {

}


