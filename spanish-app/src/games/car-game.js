import { speakSpanish, speakEnglish, delay } from "../speech"
import { askUserQuestionMic } from "./ui-objects"
import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ProgressBar } from './ui-objects';
import SpeechButton, { playCorrectSound, playIncorrectSound } from '../speech';
import { GameCompletionComponent } from './completion';
import Mascot from '../mascot';
import { loadChapterContent } from '../utils/contentCache';
import { LeaveButton } from './ui-objects';
import { SpanishMicButton } from './ui-objects';
import { BasicPopover } from './ui-objects';
import TranslateIcon from '@mui/icons-material/Translate';
import { processText } from './ui-objects';
import { Height } from '@mui/icons-material';

export const startPhrases = [
    'Hola',
    'Hola, ¿cómo estás?',
    'Hola, bienvenido.',
    'Hola, empecemos.'
];

export const positiveFeedbackPhrases = [
    '¡Correcto!',
    '¡Muy bien!',
    '¡Excelente!',
    '¡Exacto!',
    'Así es.',
    'Buen trabajo.'
];

export const negativeFeedbackPhrases = [
    'No, esa no es la respuesta.',
    'Incorrecto.',
    'No es correcto.',
    'No, estás equivocado.',
    'Intenta de nuevo.'
];

export const repeatPhrases = [
    '¿Puedes repetirlo?',
    'No te escuché bien. ¿Puedes decirlo otra vez?',
    'Por favor repite lo que dijiste.'
];

export const continuePhrase = [
    '¿Quieres continuar?',
    '¿Listo para seguir?',
    '¿Continuamos?'
];

export const finishedPhrases = [
    'Hemos terminado.',
    'Ya terminamos.',
    'Hemos llegado al final. Buen trabajo.',
    'Buen trabajo, hemos terminado por hoy.'
];

export const verbalCommands = [
    'repetir',
    'continuar',
    'saltar'
];

// Functions to get a random phrase from each list

export const getRandomStartPhrase = () => {
  const randomIndex = Math.floor(Math.random() * startPhrases.length);
  return startPhrases[randomIndex];
};

export const getRandomPositiveFeedback = () => {
  const randomIndex = Math.floor(Math.random() * positiveFeedbackPhrases.length);
  return positiveFeedbackPhrases[randomIndex];
};

export const getRandomNegativeFeedback = () => {
  const randomIndex = Math.floor(Math.random() * negativeFeedbackPhrases.length);
  return negativeFeedbackPhrases[randomIndex];
};

export const getRandomRepeatPhrase = () => {
  const randomIndex = Math.floor(Math.random() * repeatPhrases.length);
  return repeatPhrases[randomIndex];
};

export const getRandomContinuePhrase = () => {
  const randomIndex = Math.floor(Math.random() * continuePhrase.length);
  return continuePhrase[randomIndex];
};

export const getRandomFinishedPhrase = () => {
  const randomIndex = Math.floor(Math.random() * finishedPhrases.length);
  return finishedPhrases[randomIndex];
};

export const getRandomVerbalCommand = () => {
  const randomIndex = Math.floor(Math.random() * verbalCommands.length);
  return verbalCommands[randomIndex];
};




export default function CarGame({chapterIndex, setSection, updatePoints}) {
    const [numCompleted, setNumCompleted] = useState(0);
    const [numCorrect, setNumCorrect] = useState(0);
    const totalQuestions = 100;
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
        }
        

        if (answered) {
            setTimeout(() => {handleContinue(true)}, 400);
        }

    }, [answered])



    function generateNextQuestionContent(data) {
        let r = Math.floor(Math.random()*2); 
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


    function handleContinue(auto) {
        if (!answered && auto) {
            return;
        }

        if (auto) {
            delay(200);
        }
        
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
            <Button className='app-button success' variant='contained' sx={{width:'auto'}} onClick={() => {handleContinue(false)}}>
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
        return <div className="conversation-component-outer-container">
        <GameCompletionComponent numCorrect={numCorrect} totalQuestions={totalQuestions}  updatePoints={updatePoints}></GameCompletionComponent>
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
                {continueButton()}
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
    const Instructions = 'please translate the answer into Spanish'


    useEffect(() => {
        setAnswered(false);
        setUserText('');
        setIsCorrect(false);
        setShowModal(false);
        setShowSubmit(false);
        setShowHint(false);
        conversationFlow()
    }, [question])


    async function conversationFlow() {
        await delay(500);

        await speakSpanish(question);
        await delay(500);

      
        await speakEnglish(Instructions);
        await delay(1000);


      
        // Ask a question & wait for user reply
        const response = await askUserQuestionMic(atranslation, {
          questionInSpanish: false,
          responseInSpanish: true
        });
        await delay(200);

      
        if (response.success) {
            await speakSpanish(`Dijiste: ${response.transcript}`);
            await delay(200);
            setUserText(response.transcript);
            const result = handleSubmit(response.transcript);
            await speakSpanish(`${result? getRandomPositiveFeedback() : getRandomNegativeFeedback()}. ${answer}`)
            await delay(1000);
            onAnswered();
            setAnswered(true);
        } else {
            await speakSpanish(`No te escuché. ${answer}`);
            await delay(200);
            handleSubmit('None');
            await delay(300);
            onAnswered();
            setAnswered(true);
        }
      }



      function checkResponse(text) {
        const allowedMistakes = Math.floor(answer.length / 10) + 2;

        const processedResp = processText(text);
        const processedAnswer = processText(answer);

        if (processedAnswer.length != processedResp.length) {
            setIsCorrect(false);
            return false;
        }

        let mistakes = 0;
        for (let i = 0; i < processedResp.length; i++) {
            if (processedResp[i] != processedAnswer[i]) {
                mistakes += 1;
            }
            if (mistakes > allowedMistakes) {
                setIsCorrect(false);
                return false
            }
        }
        setIsCorrect(true);        
        return true;
    }



    function handleSubmit() {
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
        return result
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
        
    
    return (
        <div className='speak-container'>
            <Mascot clickable></Mascot>
            <div className='car-speak-question'>
            {/* <SpeechButton text={question} inSpanish={true}></SpeechButton> */}
            {<Typography align='center' sx={{fontWeight: 'bold'}}>{question}</Typography>}
            </div>
            <div className='speak-message'>Answer the question in Spanish</div>
            <div className='speak-hint'><Typography>{atranslation}</Typography></div>
            <div className='speak-response'>
               <Typography>{userText}</Typography> 
            </div>
            <div className='speak-mic-row'>
            {/* <SpanishMicButton callback={handleMicCallback}/> */}
            </div>
            {/* {showSubmit && submitButton()} */}
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
            await speakSpanish(`Dijiste: ${response.transcript}`);
            await delay(200);
            setUserText(response.transcript);
            const result = handleSubmit(response.transcript);
            await speakSpanish(`${result? getRandomPositiveFeedback() : getRandomNegativeFeedback()}. ${sentence}`)
            await delay(1000);
            onAnswered();
            setAnswered(true);

        } else {
            await speakSpanish(`No te escuché. ${sentence}`);
            await delay(200);
            handleSubmit('None');
            await delay(200);
            onAnswered();
            setAnswered(true);
            
        }
      }
    


    function checkResponse(text) {
        const allowedMistakes = Math.floor(sentence.length / 10) + 2;

        const processedResp = processText(text);
        const processedAnswer = processText(sentence);

        if (processedAnswer.length != processedResp.length) {
            setIsCorrect(false);
            return false;
        }

        let mistakes = 0;
        for (let i = 0; i < processedResp.length; i++) {
            if (processedResp[i] != processedAnswer[i]) {
                mistakes += 1;
            }
            if (mistakes > allowedMistakes) {
                setIsCorrect(false);
                return false
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
        const result = checkResponse(text);
        setShowModal(true);
        if (result) {
            setResult(true);
            playCorrectSound();
        } else {
            setResult(false);
            playIncorrectSound();
        }
        setShowSubmit(false);
        return result;
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
            <div className='car-speak-question'>
            {/* <SpeechButton text={translation} inSpanish={false}></SpeechButton> */}
            {<Typography align='center' sx={{fontWeight: 'bold'}}>{translation}</Typography>}
            </div>
            <div className='speak-message'>Translate</div>
            <div className='speak-response'>
               <Typography>{userText}</Typography> 
            </div>
            <div className='speak-mic-row'>
            {/* <SpanishMicButton callback={handleMicCallback}/> */}
            </div>
            {/* {showSubmit && submitButton()} */}
            {showModal && validationModal()}
        </div>
    )

}
