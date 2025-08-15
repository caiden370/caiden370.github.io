// Multiple Choice Multiple Languages
// Text response
// Matching

import { useState, useEffect } from 'react';
import { MultipleChoice, TextResponse, FillInTheBlank } from './helper-game-objects';

import '../App.css';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { ProgressBar } from './ui-objects';
import { GameCompletionComponent } from './helper-conversation-game-objects';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';

export default function MixedReview({ chapterIndex, setSection, updatePoints }) {
    
    const [jsonContent, setJsonContent] = useState(null);
    const [currResult, setCurrentResult] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [prev, setPrev] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const [numCompleted, setNumCompleted] = useState(0)
    const totalQuestions = 10;
    const importAll = (r) => r.keys().map(r);
    const images = importAll(require.context('../static/avatars', false, /\.(png|jpe?g|svg)$/));
    const [finished, setFinished] = useState(false);
    const [updated, setUpdated] = useState(false)

    useEffect(() => {
        
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const words = contentObj?.words;
                if (words) {
                    setJsonContent(words);
                    const content = generateNextQuestionContent(words);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setFinished(false);
                    setNumCompleted(0);
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
    }, [answered]);
    


    function generateNextQuestionContent(wordsArray) {
        let r = Math.floor(Math.random()*3);
        if (r === 0) {
            r = Math.floor(Math.random()*2);
            return generateMultipleChoiceContent(wordsArray, 4, r > 0);
        } else if (r === 1) {
            r = Math.floor(Math.random()*2);
            return generateTextResponseContent(wordsArray, r > 0);
        } else if (r === 2) {
            return generateFillBlankContent(wordsArray);
        }
        return null;
    }

    function buildNextQuestionComponent(content) {
        if (content.type === 'multiple-choice') {
            return buildMultipleChoiceComponent(content);
        } else if (content.type === 'text-response') {
            return buildTextResponseComponent(content);
        } else if (content.type == 'fill-blank') {
            return buildFillBlankComponent(content)
        }
        return <div></div>

    }


    function generateRandomIndices(array, n) {
        const indices = new Array(n);
        for (let i = 0; i < n; i++) {
            
            indices[i] = Math.floor(Math.random() * array.length);

        }
        return indices;
    }

    function generateRandomIndicesDupless(array, n) {
        const indices = new Array(n);
        const choices = new Array(array.length);

        for (let i = 0; i<array.length; i++) {
            choices[i] = i            
        }

        let avail = array.length;
        let r = 0
        for (let i = 0; i<n; i++) {
            r = Math.floor(Math.random() * avail);
            indices[i] = choices[r];
            choices[r] = choices[avail-1]
            avail = avail - 1;
        }
        return indices
    }

    // MULTIPLE CHOICE QUESTIONS Helpers
    function generateMultipleChoiceContent(wordsArray, numOptions, questionIsSpanish) {
        const questionKey = questionIsSpanish ? 'spanish' : 'english';
        const optionsKey = questionIsSpanish ? 'english' : 'spanish';
        const randIndices = generateRandomIndicesDupless(wordsArray, numOptions);
        const options = randIndices.map(i => wordsArray[i][optionsKey]);
        const answerIndex = Math.floor(Math.random() * numOptions);
        const question = wordsArray[randIndices[answerIndex]][questionKey];

        return {
            type: 'multiple-choice',
            'spanishQuestion': questionIsSpanish,
            question,
            options,
            answerIndex
        };
    }

    function buildMultipleChoiceComponent(content) {
        // Later you can switch on content.type here to render different question types
        if (content.type === 'multiple-choice') {
            return (
                <MultipleChoice
                    key={'question-' + prev}
                    setResult={setCurrentResult}
                    question={content.question}
                    options={content.options}
                    answerIndex={content.answerIndex}
                    onAnswered={() => setAnswered(true)}
                    isAnswered={false}
                    questionInSpanish={content.spanishQuestion}
                />
            );
        }

        return null; // fallback if type is unknown
    }


    // TEXT RESPONSES HELPER:
    function generateTextResponseContent(wordsArray, questionIsSpanish) {
        const randIndex = generateRandomIndices(wordsArray, 1)[0];
        const questionKey = questionIsSpanish ? 'spanish' : 'english';
        const answerKey = questionIsSpanish ? 'english' : 'spanish';
        return {
            'type': 'text-response',
            'spanishQuestion': questionIsSpanish,
            'question': wordsArray[randIndex][questionKey],
            'answer': wordsArray[randIndex][answerKey]
        }
    }

    function buildTextResponseComponent(content) {
        return (
            <TextResponse
                question={content.question}
                answer={content.answer}
                setResult={setCurrentResult}
                onAnswered={() => setAnswered(true)}
                isAnswered={false}
                questionInSpanish={content.spanishQuestion}>
                    
            </TextResponse>
        );
    }


    function splitIntoWords(str) {
        return str.trim().split(/\s+/);
      }
      
    function generateFillBlankContent(wordsArray) {
        let randIndex = generateRandomIndices(wordsArray, 1)[0];
        let phrase = wordsArray[randIndex]['spanish'];
        let phraseList = splitIntoWords(phrase);
        let tries = 1
        while(phraseList.length < 3 || tries > 0) {
            randIndex = generateRandomIndices(wordsArray, 1)[0];
            phrase = wordsArray[randIndex]['spanish'];
            phraseList = splitIntoWords(phrase);
            tries -= 1;
        }

        if (tries == 0) {
            return generateTextResponseContent(wordsArray, true);
        }


        
        return {
            'type': 'fill-blank',
            'spanishQuestion': true,
            'phraseList': phraseList,
            'index': generateRandomIndices(phraseList, 1)[0]
        }
        

    }

    function buildFillBlankComponent(content) {
        return (
            <FillInTheBlank
                phraseList={content.phraseList}
                missingIndex={content.index}
                onAnswered={()=>{setAnswered(true)}}
                setResult={setCurrentResult}
                questionInSpanish={content.spanishQuestion}
            >

            </FillInTheBlank>
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
                <ProgressBar progress={(numCompleted*100 / totalQuestions) % 100}></ProgressBar>
            </div>
        )

    }

    function handleQuit() {
        setSection('MenuGame');

    }

    function handleRetry() {
        setFinished(false);
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setCurrentResult(null);
        setPrev(0);
        setNumCorrect(0);
        setNumCompleted(0);
        setUpdated(false);
    }


    if (finished) {
        if(!updated) {
            updatePoints(numCorrect, numCorrect);
            setUpdated(true);
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
                <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
                <div className='mixed-review-quiz-card'>
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        );
    }
}
