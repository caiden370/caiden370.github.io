import { ProgressBar } from './ui-objects';
import { useState, useEffect, use } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';
import { ConversationMultiChoice } from './helper-conversation-game-objects';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';
import { GameCompletionComponent } from './completion';


export default function Conversations({chapterIndex, setSection, updatePoints}) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);
    const [totalCount, setTotalCount] = useState(10);
    const [scoreBarComponent, setScoreBarComponent] = useState(scoreBar(0));
    const [finished, setFinished] = useState(false);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const conversations = contentObj?.conversations;
                if (conversations) {
                    setJsonContent(conversations);
                    const content = generateNextQuestionContent(conversations);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setScoreBarComponent(scoreBar(0));
                    setNumCorrect(0);
                    setAnswered(false);
                    setFinished(false);
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


    function handleOnAnswer(progress, numCorrect) {
        setScoreBarComponent(scoreBar(progress));
        setNumCorrect(numCorrect);
    }

    
    const handleRetry = () => {
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setCurrentResult(null);
        setPrev(prev + 1);
        setFinished(false);
        setNumCorrect(0);
        setScoreBarComponent(scoreBar(0));
        setUpdated(false);
    };

    function generateNextQuestionContent(conversationsArray) {
        setNumCorrect(0);
        let r = Math.floor(Math.random()*1);
        if (r == 0) {
            return generateConversationMultipleChoiceContent(conversationsArray);
        }

    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'conv-multi-choice') {
            return buildConversationMultipleChoiceComponent(content);
        }
    }

    function generateConversationMultipleChoiceContent(conversationsArray) {
        let randIndex = Math.floor(Math.random()*conversationsArray.length);
        const conversationObj = conversationsArray[randIndex];
        setTotalCount(conversationObj['dialog'].length + conversationObj['questions'].length);
        return {
            'type':'conv-multi-choice',
            'topic':conversationObj['topic'],
            'dialog':conversationObj['dialog'],
            'questions':conversationObj['questions']
        }
    }

    function buildConversationMultipleChoiceComponent(content) {
        return (
            <ConversationMultiChoice
            topic={content.topic}
            dialog={content.dialog}
            questions={content.questions}
            audioOnly={Math.random() < 0.4}
            onAnswered={handleOnAnswer}
            setResult={setCurrentResult}
            onFinished={onFinished}
            >
            </ConversationMultiChoice>
        )
    }

    function scoreBar(count) {
        return (
            <div key={count + 'progress'} className='mixed-review-score-container'>
                <ProgressBar progress={count*100 / totalCount}></ProgressBar>
            </div>
        )

    }


    function retryButton() {
        return (
            <div className='mixed-review-continue'>
                <Button className='app-button success' variant='contained' onClick={handleRetry}>
                    <Typography>Play Again</Typography>
                </Button>
            </div>
        );
    }

    function handleQuit() {
        setSection('MenuGame');
    }

    function quitButton() {
        return (
            <div className='mixed-review-continue'>
                <Button className='app-button info' variant='contained' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
        );
    }

    function onFinished(correct, total) {
        setNumCorrect(correct);
        setTotalQuestions(total);
        setFinished(true);
    }

    if (finished) {
        if(!updated) {
            updatePoints(numCorrect, numCorrect);
            setUpdated(true);
        }

        return  (<div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions} updatePoints={updatePoints}></GameCompletionComponent>
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
                <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
                <div className='conversation-card'>
                {scoreBarComponent}
                {questionComponent}
                <div className='finished-row'>
                {finished && quitButton()}
                {finished && retryButton()}
                </div>
                
                </div>
            </div>
        );

    }






}