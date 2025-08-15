
import { useEffect, useState } from "react";
import { MultipleChoice } from "./helper-game-objects";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import { GameCompletionComponent } from "./helper-conversation-game-objects";
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';



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
    const numTypes = 2
    const [questionType, setQuestionType] = useState(Math.floor(Math.random()*numTypes));



    useEffect(() => {
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const stories = contentObj?.stories;
                if (stories) {
                    const storyI = Math.floor(Math.random()*stories.length);
                    setStoryIndex(storyI);
                    setJsonContent(stories);
                    const qtype = Math.floor(Math.random() * numTypes);
                    setQuestionType(qtype);
                    const content = generateNextQuestionContent(stories[storyI], 0, qtype);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setAnswered(false);
                    setPrev(0);
                    setFinished(false);
                    setTotalQuestions(stories[storyI].sentences.length);
                    setNumCompleted(0);
                    setNumCorrect(0);
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



    function generateNextQuestionContent(conversations, i, questionType) {
        if (questionType == 0) {
            setTotalQuestions(conversations.sentences.length - 1);
            return generateStoryNextContent(conversations, i);
        } else if (questionType == 1) {
            return generateStoryTranslationContent(conversations, i);
        }
    
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'story-translation') {
            return buildStoryTranslationComponent(content);
        } else if (content.type == 'story-next') {
            return buildStoryNextComponent(content);
        }


    }

    function generateStoryTranslationContent(story, i) {
        const nextSentence = story.sentences[i];
        let rand = Math.floor(Math.random() * story.sentences.length);
        let attempt = 0
        while(rand == i && attempt < 10) {
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
        if (currResult && answered) {
            setNumCorrect(numCorrect + 1);
        }
    }, [answered]);


    const handleContinue = () => {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
            return; 
        }
        const content = generateNextQuestionContent(jsonContent[storyIndex], numCompleted + 1, questionType);
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
                <Button disabled={!answered} className='app-button primary' variant='contained' onClick={handleContinue}>
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
                noLetters={true}
                message={"Choose the correct translation"}>
            </MultipleChoice>
        )
    }

    function generateStoryNextContent(story, i) {
        const curSentence = story.sentences[i];
        const nextSentence = story.sentences[i + 1]
        let rand = Math.floor(Math.random() * story.sentences.length);
        let attempt = 0
        while((rand == i + 1 || rand == i) && attempt < 10) {
            rand = Math.floor(Math.random() * story.sentences.length);
            attempt +=1;
        }
        
        const randSentence = story.sentences[rand];

        return {
            'type':'story-next',
            'sentence': curSentence.spanish,
            'translation' : curSentence.english,
            'rsentence': randSentence.spanish,
            'rtranslation': randSentence.english,
            'answer':nextSentence.spanish,
            'answer-translation':nextSentence.english
        }

    }

    function buildStoryNextComponent(content) {
        const answerIndex = Math.floor(Math.random() * 2);

        function randomizeOptions() {
            let r1 = answerIndex;
            let r2 = 1 - r1;
            const randomOptions = ['ha', 'ha'];
            randomOptions[r1] = content.answer;
            randomOptions[r2] = content.rsentence;
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
                noLetters={true}
                message={"What comes next?"}>
            </MultipleChoice>
        )

    }



    function handleQuit() {
        setSection('MenuGame');
    }
    
    function handleRetry() {
        const storyI = Math.floor(Math.random()*jsonContent.length);
        setStoryIndex(storyI);
        const qtype = Math.floor(Math.random() * numTypes);
        setQuestionType(qtype);
        const content = generateNextQuestionContent(jsonContent[storyI], 0, qtype);
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
        </div>
    }else {
        return (

            <div className='mixed-review-container'>
                <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
                <div className='mixed-review-quiz-card'>
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        )
    }
    

}


