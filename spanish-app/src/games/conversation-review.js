import learningContent from '../json-files/learningContent.json';
import { ProgressBar } from './ui-objects';
import { useState, useEffect, use } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';
import { ConversationMultiChoice } from './helper-conversation-game-objects';


export default function Conversations({chapterIndex, audioOnly, setSection}) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);
    const [totalCount, setTotalCount] = useState(10);
    const [scoreBarComponent, setScoreBarComponent] = useState(scoreBar(0));
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const conversations = learningContent[chapterIndex.toString()]?.conversations;
        if (conversations) {
            setJsonContent(conversations);
            const content = generateNextQuestionContent(conversations);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
            setScoreBarComponent(scoreBar(0));
            setNumCorrect(0);
            setAnswered(false);
            setFinished(false);
        }
    }, [chapterIndex]);


    function handleOnAnswer(progress) {
        setScoreBarComponent(scoreBar(progress));
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
            audioOnly={audioOnly}
            onAnswered={handleOnAnswer}
            setResult={setCurrentResult}
            setOuterFinished={setFinished}
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
                <Button variant='contained' color='success' onClick={handleRetry}>
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
                <Button variant='contained' color='info' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
        );
    }

    return (
        <div className='mixed-review-container'>
            <div className='mixed-review-quiz-card'>
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