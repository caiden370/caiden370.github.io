
import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import SpeechButton, { playCorrectSound, playIncorrectSound } from '../speech';
import { GameCompletionComponent } from './helper-conversation-game-objects';
import Mascot from '../mascot';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';
import { AudioExactTextResponse } from './helper-game-objects';
import { LinearProgress } from '@mui/material';
import { SentenceJumble } from './sentence';
import { mascotComponents } from '../mascot';
import { getSelectedMascot } from '../utils/mascotStorage';
import { ReactComponent as LightningSvg } from '../svgs/lightning.svg'; 
import BoltIcon from '@mui/icons-material/Bolt'; 
import { MultipleChoice, TextResponse, FillInTheBlank } from './helper-game-objects';
import '../App.css';

export function SpellBattle({chapterIndex, setSection, updatePoints}) {
    const [playerHP, setPlayerHP] = useState(100);
    const [enemyHP, setEnemyHP] = useState(100);
    const totalHealth = 100;
    const [playerCards, setPlayerCards] = useState(Array());
    const [displayQuestions, setDisplayQuestions] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [displayHelpModal, setDisplayHelpModal] = useState(false);
    const [selectionCompleted, setSelectionCompleted] = useState(false);
    const [roundCompleted, setRoundCompleted] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState();
    const numCards = 4;
    const [bolts, setBolts] = useState(0);


    const [playerMove, setPlayerMove] = useState({});
    const [enemyMove, setEnemyMove] = useState({});

    useEffect(() => {
        if (selectionCompleted && !roundCompleted) {
            resolveRound();
        }
    }, [selectionCompleted]);

    const abilities = [
            {name: 'fire', cost: 3, move:{damage: 30}},
            {name: 'shield', cost: 1 ,move:{block: 1}},
            {name: 'heal', cost: 2, move:{heal: 30}},
            {name: 'zap', cost: 4, move:{damage: 40}},
            {name: 'restore', cost: 4, move:{heal: 50}},
            {name: 'poison', cost: 2, move:{damage: 20}},
            {name: 'strike', cost: 1, move:{damage: 10}},
            {name: 'stab', cost: 3, move:{damage: 30}},      
    ]

    useEffect(
        () => {
            setPlayerHP(100);
            setEnemyHP(100);
            setEnemyMove({})
            setPlayerMove({})
            resetCards();
            setSelectedIndex(0);
            setBolts(0);
            setRoundCompleted(true);
        }, [chapterIndex]

    )
    

    function resolveRound() {
        const enemyCard = getRandomCard();
        console.log(enemyCard);
        console.log(playerMove);


        if (playerMove['damage'] && !enemyCard.move['block']) {
            setEnemyHP(enemyHP - Number(playerMove['damage']));

        } else if (playerMove['heal']) {
            setPlayerHP(playerHP + Number(playerMove['heal']));
        }
        
        
        if (enemyCard.move['damage'] && !playerMove['block']) {
            setPlayerHP(playerHP - Number(enemyCard.move['damage']));
        
        } else if (enemyCard.move['heal']) {
            setEnemyHP(enemyHP + Number(enemyCard.move['heal']))
        }
        
        setRoundCompleted(true);

    }


    function resetCards() {
        const cards = Array(numCards);
        for (let i = 0; i < numCards; i++) {
            cards[i] = abilities[Math.floor(Math.random() * abilities.length)];
        }
        setPlayerCards(cards);
    }

    function getRandomCard() {
        return abilities[Math.floor(Math.random() * abilities.length)];
    }

    function addRandomCardToPlayerCards(i) {
        if (i == -1) {
            return;
        }
        playerCards[i] = getRandomCard();
        const cards = Array(numCards);
        for (let i = 0; i < cards.length; i++) {
            cards[i] = playerCards[i];
        }

        setPlayerCards(cards);
    }






    function quiz() {
        function onFinished(score) {
            setQuizScore(score);
            setDisplayQuestions(false);
            setBolts(prev => prev + score);
        }
    
        return (
            <BattleQuiz2 chapterIndex={chapterIndex} setSection={setSection} onFinished={onFinished} updatePoints={updatePoints} ></BattleQuiz2>
        )
    }
    
    function helpModal() {
    
    }
    
    function healthBar(health, totalHealth) {
        return (
            <>
                <LinearProgress
                    
                    variant="determinate"
                    value={Math.min(health/totalHealth * 100, 100)}
                    sx={{
                    height: 8,
                    width: '100%',
                    borderRadius: 10,
                    backgroundColor: 'rgb(244, 182, 182)', // Light, modern track color
                    '& .MuiLinearProgress-bar': {
                        backgroundImage: 'rgb(232, 51, 51)',
                        width: '100%',
                        borderRadius: 10,
                        // Override the default transition for a smoother, slower animation
                        transition: 'transform 0.5s linear',
                        },
                    }}
                />

                <span>{health}</span>
            </>

        )
    
    }


    function skipCard() {
        function handleClick() {
            
            if (!roundCompleted) {
                setPlayerMove({})
                setSelectedIndex(-1);
                setSelectionCompleted(true);
            }

        }
    
        return (
            <div className='sg-spell-card' sx={{pointerEvents: selectionCompleted? 'none' : ''}} onClick={handleClick}>
                <Typography align='center' sx={{color: 'white'}}>{'skip'}</Typography>
            </div>
        )
    
    }
    
    
    function GenericCard({i, ability, backcolor, color}) {
    
        function handleClick() {
            if (bolts < Number(ability.cost)) {
                return
            }
            setBolts(bolts - Number(ability.cost));
            setPlayerMove(ability.move);
            setSelectedIndex(i);
            setSelectionCompleted(true);
        }
    
        return (
            <div className={`sg-spell-card${bolts >= Number(ability.cost)? '' : '-disabled' }`} sx={{backgroundColor: bolts >= ability.cost? 'orange' : 'gray', pointerEvents: selectionCompleted? 'none' : null}} onClick={handleClick}>
                <Typography align='center' sx={{color: color}}>{ability.name}</Typography>
                <div className='sg-energy'><BoltIcon sx={{color:"rgb(123, 0, 253)"}}/><Typography align='center' sx={{color: color}}>{ability.cost}</Typography></div>
            </div>
        )
    }



    function nextRoundButton() {

        function handleClick() {
            setRoundCompleted(false);
            setDisplayQuestions(true);
            addRandomCardToPlayerCards(selectedIndex);
            setSelectedIndex(-1);
            setSelectionCompleted(false);
            setEnemyMove({})
            setPlayerMove({})
        }

        return (
            <div className="sentence-continue-button-container" >
            <Button className='app-button success' variant='contained' sx={{width:'auto', marginTop: '20px'}} onClick={handleClick}>
                <Typography>Next Round</Typography>
            </Button>
            </div>
        )

    }



    return (
        <div className='mixed-review-container'>

        
        <div className='spell-game-container'>
            <div className='sg-enemy-side'>
                <div className="sg-enemy-mascot-row">
                    <div className="sg-health-bar">{healthBar(enemyHP, totalHealth)}</div>
                    <div className="sg-mascot">{enemyMascot()}enemy</div>
                </div>

            </div>
            <div className='sg-animation-zone'>
            </div>


            <div className='sg-player-side'>
                <div className="sg-player-mascot-row">
                    <div className="sg-mascot">{playerMascot()}player</div>
                    <div className="sg-health-bar">{healthBar(playerHP, totalHealth)}</div> 
                </div>
                
                <div className='sg-energy'><BoltIcon sx={{color:"rgb(123, 0, 253)"}}/><Typography align='left'>{bolts}</Typography></div>
                {skipCard()}

                {roundCompleted && nextRoundButton()}
                {!roundCompleted && (

                <div className="sg-card-selection">
                    {playerCards.map((ability, i)=> {
                        return (
                            <>
                            <GenericCard i={i} ability={ability} backcolor={'blue'} color={'white'}/>
                            </>
                        )
                    })}
                </div>)}
            </div>
            {displayQuestions && quiz()}
            {displayHelpModal && helpModal()}
        </div>
        </div>
    )
}

function playerMascot() {
    return (
        <>
        {mascotComponents[getSelectedMascot()][0]()}
        </>
    )

}

function enemyMascot() {
    return (
        <>
        {mascotComponents['901'][0]()}
        </>
    )

}

















// ****************************** QUIZ COMPONENT ******************************



export function BattleQuiz ({chapterIndex, setSection, onFinished}) {
    
    const [numCompleted, setNumCompleted] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const totalQuestions = 4;
    const [currResult, setCurResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const data = contentObj;
                if (data) {
                    setJsonContent(data);
                    const content = generateNextQuestionContent(data);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setAnswered(false);
                    setFinished(false);
                    setCurResult(false);
                    setUpdated(false);
                } else {
                    setQuestionComponent(<div style={{ padding: 16 }}>Content not available for this chapter yet.</div>);
                    setJsonContent(null);
                }
            } catch (err) {
                console.error('Failed to load learning content for chapter', chapterIndex, err);
                setQuestionComponent(<div style={{ padding: 16 }}>Content not available for this chapter yet.</div>);
                setJsonContent(null);
            }
        }
        getContent();
    }, [chapterIndex]);



    useEffect(() => {
        if (currResult && answered) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered])



    function generateNextQuestionContent(data) {
        return generateSentenceJumbleContent(data);
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'sentence-jumble') {
            return buildSentenceJumbleComponent(content);
        } else if (content.type == 'sentence-audio') {
            return buildSentenceAudioComponent(content);
        }


    }

    function generateSentenceJumbleContent(data) {

        let r =  Math.floor((Math.random()*2)); 
        const sentences = r == 0? data.stories : data.conversations;
        const randI = Math.floor((Math.random()*sentences.length));
        const randConvo = sentences[randI][r == 0? 'sentences' : 'dialog'];
        const randSentenceI = Math.floor(Math.random() * randConvo.length);
        const randSentence = randConvo[randSentenceI]
        r =  Math.floor((Math.random()*2));       
        return {
            'type': r == 0? 'sentence-jumble' : 'sentence-audio',
            'sentence': randSentence.spanish,
            'translation' : randSentence.english,
        }
    }

    function buildSentenceJumbleComponent(content) {
        return (
            <SentenceJumble 
            key={Date.now()}
            sentence={content.sentence} 
            setResult={setCurResult}
            translation={content.translation} 
            onAnswered={() => {setAnswered(true)}}>
        </SentenceJumble>

        )

    }

    function buildSentenceAudioComponent(content) {
        return (
            <AudioExactTextResponse
            question={content.sentence}
            answer={content.sentence}
            onAnswered={() => {setAnswered(true)}}
            setResult={setCurResult}
            questionInSpanish={true}
            >
            </AudioExactTextResponse>
        )
    }

    function handleContinue() {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
            onFinished(numCorrect);
        }
        const conversations = jsonContent;
        const content = generateNextQuestionContent(conversations);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setNumCompleted(0);
        setAnswered(false);
        setNumCompleted(numCompleted + 1);
        setCurResult(false);
    }

    function continueButton() {
        return (
            <div className="sentence-continue-button-container">
            <Button className='app-button success' variant='contained' sx={{width:'auto'}} onClick={handleContinue}>
                <Typography>Continue</Typography>
            </Button>
            </div>
        )

    }

    function scoreBar() {
        return (
            <div className='mixed-review-score-container'>
                <ProgressBar progress={(numCompleted*100 / totalQuestions) % 100}></ProgressBar>
            </div>
        )
    }


    // function handleQuit() {
    //     setSection('MenuGame');
    // }
    
    // function handleRetry() {
    //     const content = generateNextQuestionContent(jsonContent);
    //     const component = buildNextQuestionComponent(content);
    //     setQuestionComponent(component);
    //     setAnswered(false);
    //     setFinished(false);
    //     setNumCompleted(0);
    //     setNumCorrect(0);
    //     setUpdated(false);
    // }





    return (
            <div className='sg-quiz-modal'>
            {/* {scoreBarComponent} */}
            {scoreBar()}
            {questionComponent}
            {answered && continueButton()}
            </div>
    )
    

}




// ******************************************* BATTLE QUIZ 2 ***************************************************
// Multiple Choice Multiple Languages
// Text response
// Matching




export default function BattleQuiz2({ chapterIndex, setSection, updatePoints, learning=false, onFinished}) {
    
    const [jsonContent, setJsonContent] = useState(null);
    const [currResult, setCurrentResult] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [prev, setPrev] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const [numCompleted, setNumCompleted] = useState(0)
    const totalQuestions = 4;
    const importAll = (r) => r.keys().map(r);
    const images = importAll(require.context('../static/avatars', false, /\.(png|jpe?g|svg)$/));
    const [finished, setFinished] = useState(false);
    const [updated, setUpdated] = useState(false)

    useEffect(() => {
        
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const words = contentObj?.words;
                if (words) {
                    setJsonContent(words);
                    const content = generateNextQuestionContent(words);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setFinished(false);
                    setNumCompleted(0);
                    setUpdated(false);
                } else {
                    setQuestionComponent(<div style={{ padding: 16 }}>Content not available for this chapter yet.</div>);
                    setJsonContent(null);
                }
            } catch (err) {
                console.error('Failed to load learning content for chapter', chapterIndex, err);
                setQuestionComponent(<div style={{ padding: 16 }}>Content not available for this chapter yet.</div>);
                setJsonContent(null);
            }
        }
        getContent();

    }, [chapterIndex]);


    useEffect(() => {
        if (currResult && answered) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered]);
    


    function generateNextQuestionContent(wordsArray) {
        let r = Math.floor(Math.random()*3);
        if (r === 0 || learning) {
            r = Math.floor(Math.random()*2);
            return generateMultipleChoiceContent(wordsArray, 4, r > 0);
        } else if (r === 1) {
            r = Math.floor(Math.random()*2);
            return generateTextResponseContent(wordsArray, r > 0);
        } else if (r === 2) {
            return generateFillBlankContent(wordsArray);
        }
        return null;
    }

    function buildNextQuestionComponent(content) {
        if (content.type === 'multiple-choice') {
            return buildMultipleChoiceComponent(content);
        } else if (content.type === 'text-response') {
            return buildTextResponseComponent(content);
        } else if (content.type == 'fill-blank') {
            return buildFillBlankComponent(content)
        }
        return <div></div>

    }


    function generateRandomIndices(array, n) {
        const indices = new Array(n);
        for (let i = 0; i < n; i++) {
            
            indices[i] = Math.floor(Math.random() * array.length);

        }
        return indices;
    }

    function generateRandomIndicesDupless(array, n) {
        const indices = new Array(n);
        const choices = new Array(array.length);

        for (let i = 0; i<array.length; i++) {
            choices[i] = i            
        }

        let avail = array.length;
        let r = 0
        for (let i = 0; i<n; i++) {
            r = Math.floor(Math.random() * avail);
            indices[i] = choices[r];
            choices[r] = choices[avail-1]
            avail = avail - 1;
        }
        return indices
    }

    // MULTIPLE CHOICE QUESTIONS Helpers
    function generateMultipleChoiceContent(wordsArray, numOptions, questionIsSpanish) {
        const questionKey = questionIsSpanish ? 'spanish' : 'english';
        const optionsKey = questionIsSpanish ? 'english' : 'spanish';
        const randIndices = generateRandomIndicesDupless(wordsArray, numOptions);
        const options = randIndices.map(i => wordsArray[i][optionsKey]);
        const answerIndex = Math.floor(Math.random() * numOptions);
        const question = wordsArray[randIndices[answerIndex]][questionKey];

        return {
            type: 'multiple-choice',
            'spanishQuestion': questionIsSpanish,
            question,
            options,
            answerIndex
        };
    }

    function buildMultipleChoiceComponent(content) {
        // Later you can switch on content.type here to render different question types
        if (content.type === 'multiple-choice') {
            return (
                <MultipleChoice
                    key={'question-' + prev}
                    setResult={setCurrentResult}
                    question={content.question}
                    options={content.options}
                    answerIndex={content.answerIndex}
                    onAnswered={() => setAnswered(true)}
                    isAnswered={false}
                    questionInSpanish={content.spanishQuestion}
                />
            );
        }

        return null; // fallback if type is unknown
    }


    // TEXT RESPONSES HELPER:
    function generateTextResponseContent(wordsArray, questionIsSpanish) {
        const randIndex = generateRandomIndices(wordsArray, 1)[0];
        const questionKey = questionIsSpanish ? 'spanish' : 'english';
        const answerKey = questionIsSpanish ? 'english' : 'spanish';
        return {
            'type': 'text-response',
            'spanishQuestion': questionIsSpanish,
            'question': wordsArray[randIndex][questionKey],
            'answer': wordsArray[randIndex][answerKey]
        }
    }

    function buildTextResponseComponent(content) {
        return (
            <TextResponse
                question={content.question}
                answer={content.answer}
                setResult={setCurrentResult}
                onAnswered={() => setAnswered(true)}
                isAnswered={false}
                questionInSpanish={content.spanishQuestion}>
                    
            </TextResponse>
        );
    }


    function splitIntoWords(str) {
        return str.trim().split(/\s+/);
      }
      
    function generateFillBlankContent(wordsArray) {
        
        let randIndex = generateRandomIndices(wordsArray, 1)[0];
        let phrase = wordsArray[randIndex]['spanish'];
        let phraseList = splitIntoWords(phrase);
        let tries = 10
        while(phraseList.length < 3 && tries > 0) {
            randIndex = generateRandomIndices(wordsArray, 1)[0];
            phrase = wordsArray[randIndex]['spanish'];
            phraseList = splitIntoWords(phrase);
            tries -= 1;
        }

        if (tries == 0) {
            return generateTextResponseContent(wordsArray, true);
        }


        
        return {
            'type': 'fill-blank',
            'spanishQuestion': true,
            'phraseList': phraseList,
            'index': generateRandomIndices(phraseList, 1)[0]
        }
        

    }

    function buildFillBlankComponent(content) {
        return (
            <FillInTheBlank
                phraseList={content.phraseList}
                missingIndex={content.index}
                onAnswered={()=>{setAnswered(true)}}
                setResult={setCurrentResult}
                questionInSpanish={content.spanishQuestion}
            >

            </FillInTheBlank>
        )

    }


    const handleContinue = () => {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
            onFinished(numCorrect);
            updatePoints(numCorrect, numCorrect);
        }
        setAnswered(false);
        setCurrentResult(null);
        setPrev(prev + 1);
        setNumCompleted(numCompleted + 1);
        setTimeout(() => {
            const content = generateNextQuestionContent(jsonContent);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
        }, 100);

    };

    // General content
    function continueButton() {
        return (
            <div className='mixed-review-continue'>
                <Button disabled={!answered} className='app-button primary' variant='contained' onClick={handleContinue}>
                    <Typography>Continue</Typography>
                </Button>
            </div>
        );
    }


    function scoreBar() {
        return (
            <div className='mixed-review-score-container'>
                <ProgressBar progress={(numCompleted*100 / totalQuestions) % 100}></ProgressBar>
            </div>
        )

    }
    
    return (
        <div className='sg-quiz-modal'>
            <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
            {scoreBar()}
            {questionComponent}
            {answered && continueButton()}
            </div>

    );
    
}
