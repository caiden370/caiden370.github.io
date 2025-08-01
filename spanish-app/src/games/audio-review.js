import learningContent from '../json-files/learningContent.json';
import { ProgressBar } from './ui-objects';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';
import { GameCompletionComponent } from './helper-conversation-game-objects';


export default function AudioReview({chapterIndex, setSection }) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [numCompleted, setNumCompleted] = useState(0);
    const totalQuestions = 10;
    const [finished, setFinished] = useState(false);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);




    useEffect(() => {
        const words = learningContent[chapterIndex.toString()]?.words;
        if (words) {
            setJsonContent(words);
            const content = generateNextQuestionContent(words);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
        }
    }, [chapterIndex]);


    useEffect(() => {
        if (currResult) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered]);

    


    function generateNextQuestionContent(wordsArray) {
        let r = Math.floor(Math.random()*1);
        if (r == 0) {
            return generateAudioExactResponseContent(wordsArray);
        }

    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'exact-response') {
            return buildAudioExactResponseComponent(content);
        }

    }

    function generateAudioExactResponseContent(wordsArray) {
        let index = Math.floor(Math.random()*wordsArray.length);
        return {
            'type':'exact-response',
            'phrase':wordsArray[index]['spanish']
        }
    }

    function buildAudioExactResponseComponent(content) {
        return (
            <AudioExactTextResponse
            question={content.phrase}
            answer={content.phrase}
            onAnswered={()=>setAnswered(true)} 
            setResult={setCurrentResult} 
            questionInSpanish={true}
            >
            </AudioExactTextResponse>
        )
    }

    function scoreBar() {
        return (
            <div className='mixed-review-score-container'>
                <ProgressBar progress={(numCompleted*100 / totalQuestions) % 100}></ProgressBar>
            </div>
        )

    }




    const handleContinue = () => {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
        }
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setCurrentResult(null);
        setPrev(prev + 1);
        setNumCompleted(numCompleted + 1)
    };


    function continueButton() {
        return (
            <div className='mixed-review-continue'>
                <Button disabled={!answered} variant='contained' color='success' onClick={handleContinue}>
                    <Typography>Continue</Typography>
                </Button>
            </div>
        );
    }

    function handleRetry() {
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setFinished(false);
        setNumCompleted(0);
        setNumCorrect(0);
        setPrev(0);
        setCurrentResult(null);
    }

    function handleQuit() {
        setSection('MenuGame')
    }


    if (finished) {
        return  (<div className="conversation-component-outer-container">
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
    </div>)

    } else {

        return (
            <div className='mixed-review-container'>
                <div className='mixed-review-quiz-card'>
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        );
    }

}