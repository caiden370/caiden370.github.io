import learningContent from '../json-files/learningContent.json';
import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import SpeechButton from '../speech';
import { GameCompletionComponent } from './helper-conversation-game-objects';



//******************************************************************************** */
//Sentence Practice Component
//******************************************************************************** */

export default function SentencePractice ({chapterIndex, setSection}) {
    const [numCompleted, setNumCompleted] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const totalQuestions = 10;
    const [currResult, setCurResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const conversations = learningContent[chapterIndex.toString()]?.conversations;
        if (conversations) {
            setJsonContent(conversations);
            const content = generateNextQuestionContent(conversations);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
            setAnswered(false);
            setFinished(false);
            setCurResult(false);
        }
    }, [chapterIndex]);



    useEffect(() => {
        if (currResult) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered])



    function generateNextQuestionContent(conversations) {
        return generateSentenceJumbleContent(conversations);
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'sentence-jumble') {
            return buildSentenceJumbleComponent(content);
        }


    }

    function generateSentenceJumbleContent(conversations) {
        const randI = Math.floor((Math.random()*conversations.length));
        const randConvo = conversations[randI].dialog;
        const randSentenceI = Math.floor(Math.random() * randConvo.length)
        const randSentence = randConvo[randSentenceI]

        return {
            'type':'sentence-jumble',
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
            <Button variant='contained' color='primary' sx={{width:'auto'}} onClick={handleContinue}>
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
    }



    if (finished) {
        return <div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions}></GameCompletionComponent>
        <div className='finished-row'>
            <div className='mixed-review-continue'>
                <Button variant='contained' color='info' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
            <div className='mixed-review-continue'>
            <Button variant='contained' color='success' onClick={handleRetry}>
                <Typography>Play Again</Typography>
            </Button>
            </div>
        </div>
    </div>
    } else {

        return (
            <div className='mixed-review-container'>
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
        const punctuationAndSpaceRegex = /[¿¡.,;:!?]/g;
        const correctSentence = sentence.replace(punctuationAndSpaceRegex, '').split(" "); 
        if (correctSentence.length != selectedSentence.length) {
            return false;
        }
        for (let i = 0; i < correctSentence.length; i++) {
            if (selectedSentence[i] !== correctSentence[i]) {
                return false
            }
        }
        return true;
    }
    
    
    function processSentence(sentence) {
        const punctuationAndSpaceRegex = /[¿¡.,;:!?]/g;
        const words = sentence.replace(punctuationAndSpaceRegex, '').split(" ");
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
        } else {
            setCorrect(false);
            setResult(false);
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
            <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{correct ? "Correct!" : "Incorrect"} </Typography>
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
            <div className='sentence-translation'>
                <Typography>
                    {translation}
                </Typography>

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
            <Button variant='contained' color='success' onClick={handleCheckButton}>
                <Typography>Check</Typography>
            </Button>
        </div>)}
        </>
    )    

    

}