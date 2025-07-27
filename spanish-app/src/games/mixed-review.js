// Multiple Choice Multiple Languages
// Text response
// Matching
// 

import { useState, useEffect } from 'react';
import { MultipleChoice, TextResponse, FillInTheBlank } from './helper-game-objects';
import learningContent from '../json-files/learningContent.json';
import '../App.css';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { ProgressBar } from './ui-objects';

export default function MixedReview({ chapterIndex }) {
    const [jsonContent, setJsonContent] = useState(null);
    const [currResult, setCurrentResult] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [prev, setPrev] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const importAll = (r) => r.keys().map(r);
    const images = importAll(require.context('../static/avatars', false, /\.(png|jpe?g|svg)$/));

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
                <ProgressBar progress={(numCorrect*100 / 5) % 100}></ProgressBar>
            </div>
        )

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
