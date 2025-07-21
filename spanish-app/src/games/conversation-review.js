import learningContent from '../json-files/learningContent.json';
import { ProgressBar } from './ui-objects';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AudioExactTextResponse } from './helper-game-objects';
import { ConversationMultiChoice } from './helper-conversation-game-objects';


export default function Conversations({chapterIndex, audioOnly}) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);

    useEffect(() => {
        const conversations = learningContent[chapterIndex.toString()]?.conversations;
        if (conversations) {
            setJsonContent(conversations);
            const content = generateNextQuestionContent(conversations);
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

    function generateNextQuestionContent(conversationsArray) {
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
            onAnswered={()=>setAnswered(true)}
            setResult={setCurrentResult}
            >
            </ConversationMultiChoice>
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