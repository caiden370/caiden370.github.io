import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import SpeechButton, { playCorrectSound, playIncorrectSound } from '../speech';
import { GameCompletionComponent } from './completion';
import Mascot from '../mascot';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';
import { AudioExactTextResponse } from './helper-game-objects';
import { processText } from './ui-objects';


//******************************************************************************** */
//Sentence Practice Component
//******************************************************************************** */

export default function SentencePractice ({chapterIndex, setSection, updatePoints}) {
    
    const [numCompleted, setNumCompleted] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const totalQuestions = 10;
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

        // let r =  Math.floor((Math.random()*2)); 
        let r = 1;
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


    function handleQuit() {
        setSection('MenuGame');
    }
    
    function handleRetry() {
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setFinished(false);
        setNumCompleted(0);
        setNumCorrect(0);
        setUpdated(false);
    }



    if (finished) {

        if (!updated) {
            updatePoints(numCorrect, numCorrect);
            setUpdated(true);
        }


        return <div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions}></GameCompletionComponent>
        <div className='finished-row'>
            <div className='mixed-review-continue'>
                <Button className='app-button info' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
            <div className='mixed-review-continue'>
            <Button className='app-button success' onClick={handleRetry}>
                <Typography>Play Again</Typography>
            </Button>
            </div>
        </div>
    </div>
    } else {

        return (
            <div className='mixed-review-container'>
                <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
                <div className='mixed-review-quiz-card'>
                {/* {scoreBarComponent} */}
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        )
    }

}

//******************************************************************************** */
//Sentence Jumble Helper Functions
//******************************************************************************** */

export function SentenceJumble({sentence, translation, onAnswered, setResult}) {

    const [selectedSentence, setSelectedSentence] = useState(Array());
    const [availableWords, setAvailableWords] = useState(processSentence(sentence));
    const [correct, setCorrect] = useState(null);
    const [answered, setAnswered] = useState(false)

    useEffect(
        () => {
            setSelectedSentence(Array());
            setAvailableWords(processSentence(sentence));
            setAnswered(false);
            setCorrect(null);
        }, [sentence]
    )



    function checkSentence() {
        // const punctuationAndSpaceRegex = /[¿¡.,;:!?]/g;
        const correctSentence = processText(sentence).split(" "); 
        if (correctSentence.length != selectedSentence.length) {
            return false;
        }
        for (let i = 0; i < correctSentence.length; i++) {
            if (selectedSentence[i] != correctSentence[i]) {
                return false
            }
        }
        return true;
    }
    
    
    function processSentence(sentence) {
        const words = processText(sentence).split(" ");
        const randIndices = generateRandomIndicesDupless(words, words.length);
        const randomizedWords = Array(words.length);
        for (let i = 0; i < words.length; i++) {
            randomizedWords[i] = words[randIndices[i]]
        }
        return randomizedWords;

    }

    function addToAndReplaceArray(arr, newItem) {
        const temp = Array(arr.length + 1);
        for (let i = 0; i < arr.length; i++) {
            temp[i] = arr[i];
        }
        temp[arr.length] = newItem;
        return temp
    }


    function handleAddWord(index) {
        const word = availableWords[index];
        setAvailableWords(availableWords => availableWords.filter((word, i) => i !== index));
        setSelectedSentence(addToAndReplaceArray(selectedSentence, word));
    }
    
    function handleRemoveWord(index) {
        const word = selectedSentence[index]; // Fix: get word from selectedSentence, not availableWords
        setSelectedSentence(selectedSentence => selectedSentence.filter((word, i) => i !== index));
        setAvailableWords(addToAndReplaceArray(availableWords, word));
    }

    function WordButton({word, i, handleFunction, type}) {
        if (word == null) {
            return 
        }
        return (
            <div className={`sentence-word-button ${type}`} onClick={() => handleFunction(i)}>
               {word.toLowerCase()}
            </div>
        )
    }

    function handleCheckButton() {
        setAnswered(true);
        onAnswered();
        if (checkSentence()) {
            setCorrect(true);
            setResult(true);
            playCorrectSound();
        } else {
            setCorrect(false);
            setResult(false);
            playIncorrectSound();
        }
        
    }

    function validationModal() {
        const statusClass = correct ? "correct" : "incorrect";
        return (
        <div className="mr-text-response-modal-container">
          <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
          >
            <div className='sentence-validation-top-row'>
            <Typography sx={{fontWeight:'bold'}}>{correct ? "Correct!" : "Incorrect"} </Typography>
            <SpeechButton sx={{}} text={sentence} inSpanish={true} ></SpeechButton>
            </div>
            <Typography>{sentence}</Typography>
          </div>
          </div>
        );
      }


    return (
        <>
        <div className='sentence-jumble-container'>
            <div className="mr-text-response-question">
            <Mascot clickable></Mascot>
            <div className='mr-text-response-question-text'>
                <SpeechButton text={translation} inSpanish={false}></SpeechButton>
                <Typography align="left" sx={{fontWeight:'bold'}}>{translation}</Typography>
            </div>
            </div>
            
            <div className='jumbled-selected-sentence-container'> {
                selectedSentence.map((word, i) =>  {
                    return (
                        <WordButton key={'jumpled1' + i} word={word} i={i} handleFunction={handleRemoveWord} type='selected'></WordButton>
                    )
                   
                })}

            </div>
            <span>Reorder:</span>
            <div className='jumbled-available-words-container'>
            
            {availableWords.map((word, i) => {
                return (
                    <WordButton key={'jumbled2' + i} word={word} i={i} handleFunction={handleAddWord} type={'available'}></WordButton>
                )})
                 
            }
            </div>
            {answered && validationModal()}

        </div>
        {!answered && (<div className="sentence-continue-button-container">
            <Button className='app-button primary' variant='contained' color='success' onClick={handleCheckButton}>
                <Typography>Check</Typography>
            </Button>
        </div>)}
        </>
    )    
}



