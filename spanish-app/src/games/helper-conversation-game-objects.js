import { Typography, Button } from "@mui/material"
import SpeechButton from "../speech"
import { useState, useEffect } from "react";
import TranslateIcon from '@mui/icons-material/Translate';
import { BasicPopover } from "./ui-objects";




//******************************************************************************** */
// Conversation Block
// Will render the whole conversation
// messageList: [{text:'Hola como estas', speaker: 'david'},...]
//******************************************************************************** */
export function ConversationBlock({topic, messageList, audioOnly, numMessages}) {


    function message(text, translation, speaker, side, key) {
        return (
            <div key={key} className='conversation-message'> 
                <div className="conversation-message-speaker" >
                    <Typography variant='caption' align="center">{speaker}</Typography>
                </div>
                <div classame='conversation-message-icons'>
                <SpeechButton inSpanish={true} text={text}></SpeechButton>
                <BasicPopover popoverText={translation} buttonContent={<TranslateIcon></TranslateIcon>}></BasicPopover>
                </div>
                <div className={'conversation-message-'+ side}>
                    <Typography variant='body2' align='left'>{text}</Typography>
                </div>
            </div>

        )
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
        return (
            <>
            {createMessageList().map((messageContent, i)=>{
                side = sideIndicator ? 'left' : 'right';
                sideIndicator = !sideIndicator;
                return(
                    <>
                    {message(messageContent.spanish, messageContent.english, messageContent.speaker, side, i)}
                    </>
                )
            })}
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

// Conversation Multiple Choice (audio option)
//******************************************************************************** */
export function ConversationMultiChoice({topic, dialog, questions, audioOnly, onAnswered, setResult}) {
    const [numVisibleMessages, setNumVisibleMessages] = useState(0);  
    const [conversationComponent, setConversationComponent] = useState(null); 


    useEffect(
        () => {
        setConversationComponent(<ConversationBlock topic={topic} messageList={dialog} audioOnly={audioOnly} numMessages={0}></ConversationBlock>);
        setNumVisibleMessages(0);    
    }, [dialog]
    )

    function handleNextMessage() {
        setNumVisibleMessages(numVisibleMessages + 1);
        setConversationComponent(<ConversationBlock topic={topic} messageList={dialog} audioOnly={audioOnly} numMessages={numVisibleMessages + 1}></ConversationBlock>);
    }
    
    function nextMessageButton() {
        return (
            <Button variant='contained' color='primary' onClick={handleNextMessage}>Next
            </Button>
        )

    }
    
    return (
        <div className="conversation-component-outer-container">
        {conversationComponent && conversationComponent} 
        {numVisibleMessages <= dialog.length && nextMessageButton()}
        </div>
    )


}





// Conversations fill in the blank (audio only option)


// Conversations full responses (audio only option)


// Conversations Multiple Choice Options


// 

