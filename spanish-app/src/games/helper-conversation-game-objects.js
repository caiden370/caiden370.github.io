import { Typography, Button, CircularProgress, Box } from "@mui/material"
import SpeechButton from "../speech"
import { useState, useEffect, useRef } from "react";
import TranslateIcon from '@mui/icons-material/Translate';
import { BasicPopover } from "./ui-objects";
import { MultipleChoice } from "./helper-game-objects";
import Mascot from "../mascot";
import { GameCompletionComponent } from "./completion";





//******************************************************************************** */
// Conversation Block
// Will render the whole conversation
// messageList: [{text:'Hola como estas', speaker: 'david'},...]
//******************************************************************************** */
export function ConversationBlock({topic, messageList, audioOnly, numMessages}) {
    const bottomRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom whenever messageList or numMessages changes
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messageList, numMessages]);


    function message(text, translation, speaker, side, key) {
        return (
            <div
                key={key}
                className={`conversation-message-row ${side}`}
            >
                <div className={`conversation-message-bubble conversation-message-${side} conversation-message-big`}>
                    <div className="conversation-message-header">
                        <span className={`conversation-message-speaker ${side}`}>{speaker}</span>
                        <span className={`conversation-message-icons ${side}`}>
                            <span className="icon-small">
                                <SpeechButton inSpanish={true} text={text} />
                            </span>
                            <span className="icon-small">
                                <BasicPopover popoverText={translation} buttonContent={<TranslateIcon fontSize="small" />} />
                            </span>
                        </span>
                    </div>
                    <span className="conversation-message-text">{text}</span>
                </div>
            </div>
        );
    }

    function messageAudioOnly(text, translation, speaker, side, key) {
      return (
        <div
            key={key}
            className={`conversation-message-row ${side}`}
        >
            <div className={`conversation-message-bubble conversation-message-${side}`}>
                <div className="conversation-message-header">
                    <span className={`conversation-message-speaker ${side}`}>{speaker}</span>
                </div>
                <span className="conversation-message-text">
                <SpeechButton inSpanish={true} text={text} />
                </span>
            </div>
        </div>
    );

    }

    function createMessageList() {
        const constrainedNumMessages = Math.min(messageList.length, numMessages);
        let currentMessageList = Array(constrainedNumMessages);
        for (let i = 0; i<constrainedNumMessages; i++) {
            currentMessageList[i] = messageList[i];
        } 
        return currentMessageList;
    }

    function renderConversation() {
        let sideIndicator = true;
        let side = 'left'; 
        function messageFunc() {
          return audioOnly? messageAudioOnly : message;
        }      
        return (
            <>
            {createMessageList().map((messageContent, i)=>{
                side = sideIndicator ? 'left' : 'right';
                sideIndicator = !sideIndicator;
                return(
                    <>
                    {messageFunc()(messageContent.spanish, messageContent.english, messageContent.speaker, side, i)}
                    </>
                )
            })}
            {/* This div is always at the end */}
            <div ref={bottomRef} />
            </>
        );

    }

    return (
        <div className='conversation-container'>
            <div className='conversation-topic'><Typography sx={{fontWeight: 'bold'}}>{topic}</Typography></div>
            <div className='conversation-dialog-container'>{renderConversation()}</div>
        </div>
    )


}

//******************************************************************************** */
//MultipleChoiceModal

//******************************************************************************** */
export function ConversationMultipleChoiceBlock({questionItem, onAnswered, setResult}) {


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

    function renderQuestion(questionItem) {

        const options = questionItem.options;
        const question = questionItem.question;
        const randIndices = generateRandomIndicesDupless(options, options.length);
        let answerIndex = questionItem.answerIndex;
        const answer = questionItem.answer;
        const randomizedOptions = Array(options.length);
        let tempAnswerIndex = 0;

        for (let i = 0; i < options.length; i++) {
            randomizedOptions[i] = options[randIndices[i]];
            if (randIndices[i] == answerIndex) {
                tempAnswerIndex = i;
            }
        }
        answerIndex=tempAnswerIndex;

        return (
            <div className='conversation-multiple-choice-'>
                <MultipleChoice
                setResult={setResult}
                question={question}
                options={randomizedOptions}
                answerIndex={answerIndex}
                onAnswered={onAnswered}
                questionInSpanish={true}
                >
                </MultipleChoice>
            </div>
        )

    }


    return (
        <>
        {renderQuestion(questionItem)}
        </>
    )


}




//******************************************************************************** */

// Conversation Multiple Choice (audio option)
//******************************************************************************** */
export function ConversationMultiChoice({topic, dialog, questions, audioOnly, onAnswered, setResult, setOuterFinished}) {
    const [numVisibleMessages, setNumVisibleMessages] = useState(0);  
    const [conversationComponent, setConversationComponent] = useState(null); 
    const [progresSteps, setProgressSteps] = useState(0);
    const [multipleChoiceMode, setMultipleChoiceMode] = useState(false);
    const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
    const [answered, setAnswered] = useState(true);
    const [finished, setFinished] = useState(false);
    const [numCorrect, setNumCorrect] = useState(0);


    useEffect(
        () => {
        setConversationComponent(<ConversationBlock topic={topic} messageList={dialog} audioOnly={audioOnly} numMessages={0}></ConversationBlock>);
        setNumVisibleMessages(0);  
        setProgressSteps(0);
        onAnswered(0);
        setFinished(false);
        setNumCorrect(0);
        setCurrQuestionIndex(0)
    }, [dialog]
    )



    function handleNextMessage() {
        setProgressSteps(progresSteps + 1);
        if (onAnswered) {
            onAnswered(progresSteps + 1);
        }
        setNumVisibleMessages(numVisibleMessages + 1);
        setConversationComponent(<ConversationBlock topic={topic} messageList={dialog} audioOnly={audioOnly} numMessages={numVisibleMessages + 1}></ConversationBlock>);
    }
    
    function nextMessageButton() {
        return (
            <div className='conversation-next-button'>
                <Button className='app-button primary' variant='contained' onClick={handleNextMessage}>Next
                </Button>
            </div>
        )

    }

    function handleSetResult(result) {
        setResult(result);
        if (result) {
            setNumCorrect(numCorrect+1);
        }
    }


    function handleNextMCQ() {
        if (onAnswered && currQuestionIndex > 0) {
            setProgressSteps(progresSteps + 1);
            onAnswered(progresSteps + 1, numCorrect);
        }
        if (currQuestionIndex >= questions.length) {
            setFinished(true);
            setOuterFinished(true);
        } else {
            setAnswered(false);
            setMultipleChoiceMode(true);
            setConversationComponent(<ConversationMultipleChoiceBlock questionItem={questions[currQuestionIndex]} onAnswered={()=>{setAnswered(true)}} setResult={handleSetResult}></ConversationMultipleChoiceBlock>)
            setCurrQuestionIndex(currQuestionIndex + 1);
        }
    }

    function nextMCQuestionButton() {
        return (
            <div className='conversation-next-button'>
                <Button className='app-button primary' variant='contained' disabled={!answered && currQuestionIndex>0} onClick={handleNextMCQ}>{currQuestionIndex == 0? 'Take Quiz' : 'Next'}
                </Button>
            </div>
        )
    }

    
    if (finished) {
        return <div className="conversation-component-outer-container">
            <GameCompletionComponent numCorrect={numCorrect} totalQuestions={questions.length}></GameCompletionComponent>
        </div>

    } else {
        return (
            <div className="conversation-component-outer-container">
            {conversationComponent && conversationComponent} 
            {numVisibleMessages <= dialog.length? nextMessageButton() : nextMCQuestionButton()}
            </div>
        )

    }



}





// Conversations fill in the blank (audio only option)


// Conversations full responses (audio only option)


// Conversations Multiple Choice Options


// 

