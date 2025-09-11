import { speakSpanish, speakEnglish, delay } from "../speech"
import { askUserQuestionMic } from "./ui-objects"
import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import SpeechButton, { playCorrectSound, playIncorrectSound } from '../speech';
import { GameCompletionComponent } from './helper-conversation-game-objects';
import Mascot from '../mascot';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';
import { SpanishMicButton } from './ui-objects';
import { BasicPopover } from './ui-objects';
import TranslateIcon from '@mui/icons-material/Translate';
import { processText } from './ui-objects';
import { Height } from '@mui/icons-material';

export const startPhrases = [
    'Hola'
]


export const positiveFeedbackPhrases = [
    'Bueno!'
]


export const negativeFeedbackPhrases = [
    'Mal'
]


export const repeatPhrases = [
    'Try again I didnt quite hear you'
]

export const continuePhrase = [
    'Should I continue'
]

export const finishedPhrases = [
    'We are done',
    'Nice job',
]

export const verbalCommands = [
    'repeat',
    'continue',
    'skip'
]



export default function CarGame({chapterIndex, setSection, updatePoints}) {
    const [numCompleted, setNumCompleted] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const totalQuestions = 10;
    const [currResult, setCurResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);
    const [updated, setUpdated] = useState(false);
    const numKeywords = 1

    useEffect(() => {
        async function getContent() {
            try {
                const contentObj = await loadChapterContent(chapterIndex);
                const data = contentObj
                if (data) {
                    setJsonContent(data);
                    const content = generateNextQuestionContent(data);
                    const component = buildNextQuestionComponent(content);
                    setQuestionComponent(component);
                    setAnswered(false);
                    setFinished(false);
                    setCurResult(false);
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
            updatePoints(1, 1);
            setNumCorrect(prev => prev + 1);
            handleContinue();
        }
    }, [answered])



    function generateNextQuestionContent(data) {
        let r = Math.floor(Math.random()*1); 
        if (r == 0) {
            return generateSpeakingTranslateContent(data);

        } else if (r == 1) {
            return generateSpeakingContent(data);
        }
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'speak-answer') {
            return buildSpeakingComponent(content);
        } else if (content.type == 'speak-translate') {
            return buildSpeakingTranslateComponent(content);
        }
    }

    function generateSpeakingContent(data) {
        const questions = data['speaking'].questions_and_answers;
        const randIndex = Math.floor(Math.random() * questions.length);
        
        return {
            'type':'speak-answer',
            'question':questions[randIndex].question.spanish,
            'answer':questions[randIndex].answer.spanish,
            'question_translation':questions[randIndex].question.english,
            'answer_translation':questions[randIndex].answer.english,
        }
    }

    function generateSpeakingTranslateContent(data) {
        const wordsArray = data.words;
        const randIndex = Math.floor(Math.random() * wordsArray.length);
        return {
            'type': 'speak-translate',
            'sentence': wordsArray[randIndex]['spanish'],
            'translation': wordsArray[randIndex]['english']
        }
    }



    function getRandSubset(list, n) {
        const indices = Array(list.length);
        const result = Array(n);
        for (let i = 0; i < list.length; i++) {
            indices[i] = i;
            
        }

        for (let i = 0; i < n; i++) {
            result[i] = list[indices.splice(Math.floor(Math.random*indices.length), 1)];
        }

        return result;
    }

    function buildSpeakingComponent(content) {
        return (
            <CarSpeakAnswer
            key={Date.now()}
            question={content.question} 
            answer={content.answer}
            qtranslation={content.question_translation}
            atranslation={content.answer_translation}
            setResult={setCurResult}
            onAnswered={() => {setAnswered(true)}}>
            </CarSpeakAnswer>
        )

    }

    function buildSpeakingTranslateComponent(content) {
        return (
            <CarSpeakTranslate 
            key={Date.now()}
            sentence={content.sentence} 
            setResult={setCurResult}
            translation={content.translation}
            onAnswered={() => {setAnswered(true)}}>
            </CarSpeakTranslate>
        )
        
    }


    function handleContinue() {
        if (numCompleted >= totalQuestions - 1) {
            setFinished(true);
        }
        const conversations = jsonContent;
        const content = generateNextQuestionContent(conversations);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setNumCompleted(0);
        setAnswered(false);
        setNumCompleted(numCompleted + 1);
        setCurResult(false);
    }

    function continueButton() {
        return (
            <div className="sentence-continue-button-container">
            <Button className='app-button success' variant='contained' sx={{width:'auto'}} onClick={handleContinue}>
                <Typography>Continue</Typography>
            </Button>
            </div>
        )

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
        const content = generateNextQuestionContent(jsonContent);
        const component = buildNextQuestionComponent(content);
        setQuestionComponent(component);
        setAnswered(false);
        setFinished(false);
        setNumCompleted(0);
        setNumCorrect(0);
        setUpdated(false);
    }



    if (finished) {

        if (!updated) {
            updatePoints(numCorrect, numCorrect);
            setUpdated(true);
        }


        return <div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions}></GameCompletionComponent>
        <div className='finished-row'>
            <div className='mixed-review-continue'>
                <Button className='app-button info' onClick={handleQuit}>
                    <Typography>Quit</Typography>
                </Button>
            </div>
            <div className='mixed-review-continue'>
            <Button className='app-button success' onClick={handleRetry}>
                <Typography>Play Again</Typography>
            </Button>
            </div>
        </div>
    </div>
    } else {

        return (
            <div className='mixed-review-container'>
                <LeaveButton setSection={setSection} updatePoints={() => updatePoints(numCorrect, numCorrect)}></LeaveButton>
                <div className='mixed-review-quiz-card'>
                {/* {scoreBarComponent} */}
                {scoreBar()}
                {questionComponent}
                {answered && continueButton()}
                </div>
            </div>
        )
    }
}


// Repeat After Me
// Translate English into Spanish or vice versa
// Translate Englsih into Spanish but first hear the question
// Story but what words did you recognize
// Conversation and Questions

// ****************************** CarSpeakAnswer ******************************
export function CarSpeakAnswer({setResult, onAnswered, question, answer, qtranslation, atranslation}) {
    const [userText, setUserText] = useState('');
    const [answered, setAnswered] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        setAnswered(false);
        setUserText('');
        setIsCorrect(false);
        setShowModal(false);
        setShowSubmit(false);
        setShowHint(false);
    }, [question])



    function checkResponse(response, correctAnswer) {
        const allowedMistakes = Math.floor(correctAnswer.length / 6) + 2;
        const processedResp = processText(response);
        const processedAnswer = processText(correctAnswer);

        if (processedAnswer.length != processedAnswer.length) {
            setIsCorrect(false);
            return false;
        }

        let mistakes = 0;
        for (let i = 0; i < processedResp.length; i++) {
            if (processedResp[i] != processedAnswer[i] && mistakes < allowedMistakes) {
                mistakes += 1;
                setIsCorrect(false);
                return false;
            }
        }
        setIsCorrect(true);        
        return true;
    }




    function handleMicCallback({
        transcript,
        confidence,
        success,
        error,
      }) {
        setUserText(transcript);
        setShowSubmit(true);
    }


    function handleSubmit() {
        onAnswered();
        setAnswered(true);
        const result = checkResponse(userText, answer);
        setResult(isCorrect);
        setShowModal(true);
        if (result) {
            setResult(true);
            playCorrectSound();
        } else {
            setResult(false);
            playIncorrectSound();
        }
        setShowSubmit(false);
    }


    function submitButton() {
        return (
            <div className="sentence-continue-button-container">
            <Button className='app-button success' variant='contained' sx={{width:'auto'}} onClick={handleSubmit}>
                <Typography>Check</Typography>
            </Button>
            </div>
        )

    }
    
    function validationModal() {
        const statusClass = isCorrect ? "correct" : "incorrect";
        return (
        <div className="mr-text-response-modal-container">
          <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
          >
            <div className='sentence-validation-top-row'>
            <Typography sx={{fontWeight:'bold'}}>{isCorrect ? "Correct!" : "Incorrect"} </Typography>
            <SpeechButton sx={{}} text={answer} inSpanish={true} ></SpeechButton>
            </div>
            <Typography>{answer}</Typography>
          </div>
          </div>
        );
      }

    function hintButton() {


        function handleHint() {
            setShowHint(true);
        }
        
        return (
            <div className='speak-hint-button'>
            <Button className='app-button primary' variant='contained' onClick={handleHint}>
                <Typography>Hint</Typography>
            </Button>
            </div>
        )
    }
    
    
    
    
    return (
        <div className='speak-container'>
            <Mascot clickable></Mascot>
            <div className='speak-question'>
            <SpeechButton text={question} inSpanish={true}></SpeechButton>
            {<Typography align='left' sx={{fontWeight: 'bold'}}>{question}</Typography>}
            </div>
            <div className='speak-message'>Answer the question in Spanish</div>
            <div className='speak-hint'>{showHint? (<Typography>{atranslation}</Typography>) : hintButton()}</div>
            <div className='speak-response'>
               <Typography>{userText}</Typography> 
            </div>
            <div className='speak-mic-row'>
            <SpanishMicButton callback={handleMicCallback}/>
            </div>
            {showSubmit && submitButton()}
            {showModal && validationModal()}
        </div>
    )

}





// ****************************** CarSpeakTranslate ******************************
export function CarSpeakTranslate({setResult, onAnswered, sentence, translation}) {
    const [userText, setUserText] = useState('');
    const [answered, setAnswered] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const Instructions = 'Translate the following phrase.'

    useEffect(() => {
        setAnswered(false);
        setUserText('');
        setIsCorrect(false);
        setShowModal(false);
        setShowSubmit(false);
        conversationFlow();
    }, [sentence])




    async function conversationFlow() {
        await delay(500);
      
        await speakEnglish(Instructions);
        await delay(500);


      
        // Ask a question & wait for user reply
        const response = await askUserQuestionMic(translation, {
          questionInSpanish: false,
          responseInSpanish: true
        });
        await delay(200);

      
        if (response.success) {
          await speakSpanish(`Tu Dijiste: ${response.transcript}`);
          await delay(200);
          setUserText(response.transcript);
          handleSubmit(response.transcript);
        } else {
          await speakEnglish("Sorry, I didn’t catch that.");
          await delay(200);
          handleSubmit('None');
        }
      }
    


    function checkResponse(text) {
        const allowedMistakes = Math.floor(sentence.length / 10) + 2;

        const processedResp = processText(text);
        const processedAnswer = processText(sentence);

        if (processedAnswer.length != processedAnswer.length) {
            setIsCorrect(false);
            return false;
        }

        let mistakes = 0;
        for (let i = 0; i < processedResp.length; i++) {
            if (processedResp[i] != processedAnswer[i] && mistakes < allowedMistakes) {
                mistakes += 1;
                setIsCorrect(false);
                return false;
            }
        }
        setIsCorrect(true);        
        return true;
    }




    function handleMicCallback({
        transcript,
        confidence,
        success,
        error,
      }) {
        setUserText(transcript);
        setShowSubmit(true);
    }


    function handleSubmit(text) {
        onAnswered();
        setAnswered(true);
        const result = checkResponse(text);
        setResult(isCorrect);
        setShowModal(true);
        if (result) {
            setResult(true);
            playCorrectSound();
        } else {
            setResult(false);
            playIncorrectSound();
        }
        setShowSubmit(false);
    }


    function submitButton() {
        return (
            <div className="sentence-continue-button-container">
            <Button className='app-button success' variant='contained' sx={{width:'auto'}} onClick={handleSubmit}>
                <Typography>Check</Typography>
            </Button>
            </div>
        )

    }
    
    function validationModal() {
        const statusClass = isCorrect ? "correct" : "incorrect";
        return (
        <div className="mr-text-response-modal-container">
          <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
          >
            <div className='sentence-validation-top-row'>
            <Typography sx={{fontWeight:'bold'}}>{isCorrect ? "Correct!" : "Incorrect"} </Typography>
            <SpeechButton sx={{}} text={sentence} inSpanish={true} ></SpeechButton>
            </div>
            <Typography>{sentence}</Typography>
          </div>
          </div>
        );
      }
    
    
    
    
    return (
        <div className='speak-container'>
            <Mascot clickable></Mascot>
            <div className='speak-question'>
            <SpeechButton text={translation} inSpanish={false}></SpeechButton>
            {<Typography align='left' sx={{fontWeight: 'bold'}}>{translation}</Typography>}
            </div>
            <div className='speak-message'>Translate</div>
            <div className='speak-response'>
               <Typography>{userText}</Typography> 
            </div>
            <div className='speak-mic-row'>
            {/* <SpanishMicButton callback={handleMicCallback}/> */}
            </div>
            {showSubmit && submitButton()}
            {showModal && validationModal()}
        </div>
    )

}
