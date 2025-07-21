import learningContent from '../json-files/learningContent.json';
import { ProgressBar } from './ui-objects';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';


export default function AudioReview({chapterIndex, }) {
    const [numCorrect, setNumCorrect] = useState(0);
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

    

    const handleContinue = () => {
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setCurrentResult(null);
        setPrev(prev + 1);
    };

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
                <ProgressBar progress={(numCorrect*100 / 5) % 100}></ProgressBar>
            </div>
        )

    }


    function continueButton() {
        return (
            <div className='mixed-review-continue'>
                <Button disabled={!answered} variant='contained' color='success' onClick={handleContinue}>
                    <Typography>Continue</Typography>
                </Button>
            </div>
        );
    }




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