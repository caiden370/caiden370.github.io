
import { useEffect, useState } from "react";
import { MultipleChoice } from "./helper-game-objects";
import learningContent from '../json-files/learningContent.json';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import { GameCompletionComponent } from "./helper-conversation-game-objects";



export default function Story({chapterIndex, setSection, updatePoints}) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [numCompleted, setNumCompleted] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(15);
    const [currResult, setCurrResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);
    const [totalCount, setTotalCount] = useState(10);
    const [finished, setFinished] = useState(false);
    const [storyIndex, setStoryIndex] = useState(0);
    const [updated, setUpdated] = useState(false);



    useEffect(() => {
        const stories = learningContent[chapterIndex.toString()]?.stories;
        if (stories) {
            const storyI = Math.floor(Math.random()*stories.length);
            setStoryIndex(storyI);
            setJsonContent(stories);
            const content = generateNextQuestionContent(stories[storyI], 0);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
            setAnswered(false);
            setPrev(0);
            setFinished(false);
            setTotalQuestions(stories[storyI].sentences.length);
            setNumCompleted(0);
            setNumCorrect(0);
            setUpdated(false);
        }
    }, [chapterIndex]);



    function generateNextQuestionContent(conversations, i) {
        return generateStoryTranslationContent(conversations, i);
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'story-translation') {
            return buildStoryTranslationComponent(content);
        }


    }

    function generateStoryTranslationContent(story, i) {
        const nextSentence = story.sentences[i];
        let rand = Math.floor(Math.random() * story.sentences.length);
        let attempt = 0
        while(rand == prev && attempt < 10) {
            rand = Math.floor(Math.random() * story.sentences.length);
            attempt +=1;
        }
        
        const randSentence = story.sentences[rand];

        return {
            'type':'story-translation',
            'sentence': nextSentence.spanish,
            'translation' : nextSentence.english,
            'rsentence': randSentence.spanish,
            'rtranslation': randSentence.english
        }

    }

    useEffect(() => {
        if (currResult) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered]);


    const handleContinue = () => {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
            return; 
        }
        const content = generateNextQuestionContent(jsonContent[storyIndex], numCompleted + 1);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setCurrResult(null);
        setNumCompleted(numCompleted + 1);
    };

    // General content
    function continueButton() {
        return (
            <div className='mixed-review-continue'>
                <Button disabled={!answered} variant='contained' color='success' onClick={handleContinue}>
                    <Typography>Continue</Typography>
                </Button>
            </div>
        );
    }


    function scoreBar() {
        return (
            <div className='mixed-review-score-container'>
                <ProgressBar progress={(numCompleted*100 / (totalQuestions)) % 100}></ProgressBar>
            </div>
        )

    }

    function buildStoryTranslationComponent(content) {

        const answerIndex = Math.floor(Math.random() * 2);

        function randomizeOptions() {
            let r1 = answerIndex;
            let r2 = 1 - r1;
            const randomOptions = ['ha', 'ha'];
            randomOptions[r1] = content.translation;
            randomOptions[r2] = content.rtranslation;
            return randomOptions
        }

        const options = randomizeOptions();



        return (
            <MultipleChoice
                key={Date.now()}
                setResult={setCurrResult}
                question={content.sentence}
                options={options}
                answerIndex={answerIndex}
                onAnswered={() => {setAnswered(true)}}
                questionInSpanish={true}
                noLetters={true}>
            </MultipleChoice>
        )
    }



    function handleQuit() {
        setSection('MenuGame');
    }
    
    function handleRetry() {
        const storyI = Math.floor(Math.random()*jsonContent.length);
        setStoryIndex(storyI);
        const content = generateNextQuestionContent(jsonContent[storyI], 0);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setPrev(0);
        setFinished(false)
        setTotalQuestions(jsonContent[storyI].sentences.length);
        setNumCompleted(0);
        setNumCorrect(0);
        setUpdated(false);
    }
    




    if (finished) {
        if (!updated) {
            setUpdated(true);
            updatePoints(numCorrect, numCorrect);
        }
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
    }else {
        return (

            <div className='mixed-review-container'>
                <div className='mixed-review-quiz-card'>
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        )
    }
    

}


