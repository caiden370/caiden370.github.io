import { ProgressBar } from './ui-objects';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';
import { GameCompletionComponent } from './helper-conversation-game-objects';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';


export default function AudioReview({chapterIndex, setSection, updatePoints }) {
    
    const [numCorrect, setNumCorrect] = useState(0);
    const [numCompleted, setNumCompleted] = useState(0);
    const totalQuestions = 10;
    const [finished, setFinished] = useState(false);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);
    const [updated, setUpdated] = useState(false);




    useEffect(() => {
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const json = contentObj;
                if (json) {
                    setJsonContent(json);
                    const content = generateNextQuestionContent(json);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
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
        if (currResult) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered]);

    


    function generateNextQuestionContent(json) {
        let r = Math.floor(Math.random()*1);
        if (r == 0) {
            return generateAudioExactResponseContent(json);
        }

    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'exact-response') {
            return buildAudioExactResponseComponent(content);
        }

    }

    // Currently only words (change r to fix)
    function generateAudioExactResponseContent(json) {
        let r = Math.floor(Math.random()*6) + 10;
        let wordsArray = null;
        let phrase = '';


        if (r == 0) {
            const conversations = json.conversations;
            let index = Math.floor(Math.random()*conversations.length);
            wordsArray = conversations[index].dialog;
        } else if (r == 1) {
            let index = Math.floor(Math.random()*json.stories.length);
            const story = json.stories[index];
            wordsArray = story.sentences;
        } else {
            wordsArray = json.words;
        }

        let index = Math.floor(Math.random()*wordsArray.length);
        phrase = wordsArray[index]['spanish'];



        

        return {
            'type':'exact-response',
            'phrase': phrase
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
                <Button disabled={!answered} className='app-button primary' variant='contained' onClick={handleContinue}>
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
        setUpdated(false);
    }

    function handleQuit() {
        setSection('MenuGame');
    }


    if (finished) {

        if (!updated) {
            setUpdated(true);
            updatePoints(numCorrect, numCorrect);
        }
        return  (<div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions}></GameCompletionComponent>
        <div className='finished-row'>
            <div className='mixed-review-continue'>
                <Button className='app-button info' variant='contained' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
            <div className='mixed-review-continue'>
            <Button className='app-button success' variant='contained' onClick={handleRetry}>
                <Typography>Play Again</Typography>
            </Button>
            </div>
        </div>
    </div>)

    } else {

        return (
            <div className='mixed-review-container'>
                <LeaveButton setSection={setSection}></LeaveButton>
                <div className='mixed-review-quiz-card'>
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        );
    }

}