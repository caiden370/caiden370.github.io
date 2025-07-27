import learningContent from '../json-files/learningContent.json';
import { useEffect } from 'react';
import { useState } from 'react';
import { generateRandomIndicesDupless } from './ui-objects';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


//******************************************************************************** */
//Sentence Practice Component
//******************************************************************************** */

export default function SentencePractice ({chapterIndex, setSection}) {
    const [numCorrect, setNumCorrect] = useState(0);
    const [currResult, setCurrentResult] = useState(null);
    const [questionComponent, setQuestionComponent] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [prev, setPrev] = useState(0);
    const [totalCount, setTotalCount] = useState(10);
    // const [scoreBarComponent, setScoreBarComponent] = useState(scoreBar(0));
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const conversations = learningContent[chapterIndex.toString()]?.conversations;
        if (conversations) {
            setJsonContent(conversations);
            const content = generateNextQuestionContent(conversations);
            const component = buildNextQuestionComponent(content);
            setQuestionComponent(component);
            // setScoreBarComponent(scoreBar(0));
            setNumCorrect(0);
            setAnswered(false);
            setFinished(false);
        }
    }, [chapterIndex]);



    function generateNextQuestionContent(conversations) {
        return generateSentenceJumbleContent(conversations);
    }

    function buildNextQuestionComponent(content) {
        if (content.type == 'sentence-jumble') {
            return buildSentenceJumbleComponent(content);
        }


    }

    function generateSentenceJumbleContent(conversations) {
        const randI = Math.floor((Math.random()*conversations.length));
        const randConvo = conversations[randI].dialog;
        const randSentenceI = Math.floor(Math.random() * randConvo.length)
        const randSentence = randConvo[randSentenceI]

        return {
            'type':'sentence-jumble',
            'sentence': randSentence.spanish,
            'translation' : randSentence.english,
        }

    }

    function buildSentenceJumbleComponent(content) {
        return (
            <SentenceJumble sentence={content.sentence} translation={content.translation}>
        </SentenceJumble>

        )

    }


    return (
        <div className='mixed-review-container'>
        <div className='mixed-review-quiz-card'>
        {/* {scoreBarComponent} */}
        {questionComponent}
        <div className='finished-row'>
        </div>
        
        </div>
        </div>
    )

}

//******************************************************************************** */
//Sentence Jumble Helper Functions
//******************************************************************************** */

export function SentenceJumble({sentence, translation}) {

    const [selectedSentence, setSelectedSentence] = useState(Array());
    const [availableWords, setAvailableWords] = useState(processSentence(sentence));
    const [correctSentence, setCorrectSentence] = useState(processSentence(sentence));
    const [correct, setCorrect] = useState(null);
    const [answered, setAnswered] = useState(false)


    useEffect(
        () => {
            setSelectedSentence(Array());
            setAvailableWords(processSentence(sentence));
            setAnswered(false);
            setCorrectSentence(processSentence(sentence))
        }, [sentence]
    )



    function checkSentence() {
        if (correctSentence.length != selectedSentence.length) {
            return false;
        }
        for (let i = 0; i < correctSentence.length; i++) {
            if (selectedSentence[i] === correctSentence[i]) {
                return false
            }

        }
        return true;
    }
    
    
    function processSentence(sentence) {
        const punctuationAndSpaceRegex = /[¿¡.,;:!?]/g;
        const words = sentence.replace(punctuationAndSpaceRegex, '').split(" ");
        const randIndices = generateRandomIndicesDupless(words, words.length);
        const randomizedWords = Array(words.length);
        for (let i = 0; i < words.length; i++) {
            randomizedWords[i] = words[randIndices[i]]
        }
        return randomizedWords;

    }

    function addToAndReplaceArray(arr, newItem) {
        const temp = Array(arr.length + 1);
        for (let i = 0; i < selectedSentence.length; i++) {
            temp[i] = arr[i]
        }
        temp[arr.length] = newItem;
        return temp
    }


    function handleAddWord(index) {
        const word = availableWords[index];
        setAvailableWords(availableWords => availableWords.filter((word, i) => i !== index));
        setSelectedSentence(addToAndReplaceArray(selectedSentence, word));
    }
    
    function handleRemoveWord(index) {
        const word = selectedSentence[index]; // Fix: get word from selectedSentence, not availableWords
        setSelectedSentence(selectedSentence => selectedSentence.filter((word, i) => i !== index));
        setAvailableWords(addToAndReplaceArray(availableWords, word));
    }

    const ButtonStyle = {
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "blue",   
        padding: "3px"
    }

    function WordButton({word, i, handleFunction}) {
        if (word == null) {
            return 
        }
        return (
            <Button sx={ButtonStyle} onClick={() => handleFunction(i)}>
                <Typography>{word}</Typography>
            </Button>
        )
    }

    function handleCheckButton() {
        setAnswered(true);
        if (checkSentence) {
            setCorrect(true);
        } else {
            setCorrect(false);
        }
    }

    function validationModal() {
        const statusClass = correct ? "correct" : "incorrect";
        return (
        <div className="mr-text-response-modal-container">
          <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
          >
            <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{correct ? "Correct!" : "Incorrect"}</Typography>
            <Typography>{sentence}</Typography>
          </div>
          </div>
        );
      }


    return (
        <div className='sentence-jumble-container'>
            <div className='sentence-translation'>
                <Typography>
                    {translation}
                </Typography>

            </div>
            <div className='jumbled-selected-sentence-container'> {
                selectedSentence.map((word, i) =>  {
                    return (
                        <WordButton key={'jumpled1' + i} word={word} i={i} handleFunction={handleRemoveWord}></WordButton>
                    )
                   
                })}

            </div>

            <div className='jumbled-available-words-container'>
            
            {availableWords.map((word, i) => {
                return (
                    <WordButton key={'jumbled2' + i} word={word} i={i} handleFunction={handleAddWord}></WordButton>
                )})
                 
            }
            </div>
            {answered && validationModal()}
            <div>
                <Button variant='contained' color='primary' onClick={handleCheckButton}>
                    <Typography>Check</Typography>
                </Button>
            </div>
            

        </div>
    )    

    

}