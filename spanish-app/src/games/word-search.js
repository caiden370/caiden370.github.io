import { Typography } from "@mui/material";
import { useState, useEffect, use } from "react";
import "../App.css"
import learningContent from '../json-files/learningContent.json';
import {Button} from "@mui/material";
import { playCorrectSound, playIncorrectSound } from "../speech";



// ************************************************************************************
// Letter Box Component
// ************************************************************************************

export function LetterBox({r, c, letter, letterIndex, wordIndex, handleClick, inheritedState, setInheritedState}) {
    const baseState = 0;
    const disabled = 1;
    const checkState = 2;
    const correctState = 3;
    const [state, setState] = useState(inheritedState);
    const [styleClass, setStyleClass] = useState(handleClass(state));
    const [clicked, setClicked] = useState(false);



    function handleButtonClick() {
        if (!clicked) {
            setClicked(true);
            handleClick(r, c, wordIndex);
            if (wordIndex >= 0) {
                setState(correctState);
                setStyleClass(handleClass(correctState));

            } else {
                setState(checkState);
                setStyleClass(handleClass(checkState));
            }

        }
    }

    function handleClass(state) {

        switch (state) {
            case baseState:
                return 'base';
            case disabled:
                return 'disabled';
            case checkState:
                return 'check';
            case correctState:
                return 'correct';
        }
    }
    
    return (
        <div key={Date.now()} className={`wordsearch-letter-button ${styleClass}`} onClick={handleButtonClick}>
            {letter}
        </div>
    )
}

// ************************************************************************************
// Letter Grid Component
// ************************************************************************************
export function LetterGrid({words, Height, Width, onFinished, maxMisses}) {
    const [correctClicks, setCorrectClicks] = useState(0);
    const [misClicks, setMisClicks] = useState(0);
    const [wordsFound, setWordsFound] = useState(0);
    
    // Move all grid arrays to state so they persist across renders
    const [gridData, setGridData] = useState(null);
    // Separate state for completedWordsTracker so it triggers re-renders
    const [completedWordsTracker, setCompletedWordsTracker] = useState([]);

    // Initialize grid data only once when component mounts or words change
    useEffect(() => {
        const initializeGrid = () => {
            const wordIndexArray = create2DArray(Height, Width, -1);
            const booleanArray = create2DArray(Height, Width, false);
            const letterArray = createLetter2DArray();
            const statesArray = create2DArray(Height, Width, 0);
            const wordsList = createValidWordsList(words, booleanArray, letterArray, wordIndexArray);
            const initialTracker = createTrackerDictionary(wordsList);
            
            // Set the completed words tracker separately
            setCompletedWordsTracker(initialTracker);
            
            return {
                wordIndexArray,
                booleanArray,
                letterArray,
                statesArray,
                wordsList
            };
        };

        setGridData(initializeGrid());
    }, [words, Height, Width]); // Only recreate when these props change


    useEffect(
        () => {
            if (completedWordsTracker.length == 0) {
                return;
            }
            if (wordsFound >= completedWordsTracker.length || misClicks >= maxMisses) {
                onFinished(wordsFound, misClicks);
            }

        }, [wordsFound, misClicks]


    )

    function processPhrases(phrases) {
        let concatenatedLetters = "";
        const punctuationAndSpaceRegex = /[¿¡.,;:\s!?]/g;
      
        for (const phrase of phrases) {
          const cleanedPhrase = phrase.replace(punctuationAndSpaceRegex, '');
          concatenatedLetters += cleanedPhrase;
        }
        
        return concatenatedLetters.toLowerCase();
    }

    function create2DArray(rows, cols, defaultValue) {
        return Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => defaultValue)
        );
    }

    function createLetter2DArray() {
        const possibleLetters = processPhrases(words);
        const n = possibleLetters.length;
        
        const grid = Array();
        for (let r = 0; r<Height; r++) {
            grid.push(Array())
            for (let c = 0; c < Width; c++) {
                grid[r].push(possibleLetters[Math.floor(Math.random()*n)])
            }
        }
        return grid;
    }

    function tryToPlaceWord(letterArray, booleanArray, startR, startC, word, direction, wordIndexArray, wordIndex) {
        // Horizontal (left to right)
        if (direction == 0) {
            if (word.length + startC >= Width) {
                return false;
            }
            for (let c = startC; c < word.length + startC; c++) {
                if (booleanArray[startR][c] ) { //&& letterArray[startR][c] != word[c - startC]
                    return false
                }
            }
            for (let c = startC; c < word.length + startC; c++) {
                booleanArray[startR][c] = true;
                letterArray[startR][c] = word[c - startC];
                wordIndexArray[startR][c] = wordIndex;
            }

        // Vertical (top to bottom)
        } else if (direction == 1) {
            if (word.length + startR >= Height) {
                return false;
            }
            for (let r = startR; r < word.length + startR; r++) {
                if (booleanArray[r][startC]) {  //&& letterArray[r][startC] != word[r - startR]
                    return false
                }
            }
            for (let r = startR; r < word.length + startR; r++) {
                booleanArray[r][startC] = true;
                letterArray[r][startC] = word[r - startR];
                wordIndexArray[r][startC] = wordIndex;
            }
        }
        return true;
    }

    function createValidWordsList(words, booleanArray, letterArray, wordIndexArray) {
        const wordsArray = Array(0);
        const punctuationAndSpaceRegex = /[¿¡.,;:\s!?]/g;
        const collection = {};

        const maxTries = 20;
        for (let i = 0; i < words.length; i++) {
            for (let t = 0; t<maxTries; t++) {
                let startC = Math.floor(Math.random()*(Width))
                let startR = Math.floor(Math.random()*(Height))
                let direction = Math.floor(Math.random()*2);
                let word =words[i].replace(/\s/g, '').replace(punctuationAndSpaceRegex, '');
                if (collection[word] || word.length < 3) {
                    continue;
                }
                collection[word] = true;
                if (tryToPlaceWord(letterArray, booleanArray, startR, startC, word, direction, wordIndexArray, wordsArray.length)) {
                    wordsArray.push(word)
                    break;
                }
            }
        }
        return wordsArray;
    }

    function updateArrayValue(statesArray, r, c, value) {
        statesArray[r][c] = value;
    }

    function updateTracker(wordIndex) {
        if (wordIndex >= 0) {
            setCompletedWordsTracker(prevTracker => {
                const newTracker = [...prevTracker]; // Create a new array
                newTracker[wordIndex] = newTracker[wordIndex] - 1;
                
                return newTracker;
            });
            if (completedWordsTracker[wordIndex] === 1) {
                setWordsFound(wordsFound + 1);
                playCorrectSound();
            }
            
            setCorrectClicks(prev => prev + 1);
        } else {
            setMisClicks(prev => prev + 1);
            playIncorrectSound();
        }
    }

    function createTrackerDictionary(wordsList) {
        const tracker = Array(wordsList.length);
        for (let i = 0; i < wordsList.length; i++) {
            tracker[i] = wordsList[i].length;
        }
        return tracker;
    }

    function handleLetterButtonClick(r, c, wordIndex) {
        if (gridData) {
            updateTracker(wordIndex);
        }
    }

    function renderLetterGrid() {
        if (!gridData) return <div>Loading...</div>;

        const { letterArray, wordIndexArray, statesArray, wordsList } = gridData;
        
        return (
            <>
            <div className='ws-score-container'>
                <div className='ws-score-found'>Found: {wordsFound}</div>
                <div className='ws-score-misses'>Lives: {maxMisses - misClicks}</div>
                
            </div>
            <div className='ws-letter-grid-container'>
            {letterArray.map((row, r) => {
                return (
                    <div key={r} className='ws-letter-grid-row'>
                    {
                        row.map((letter, c)=> {
                            return (
                                <div key={`${r}-${c}`} className='ws-letter-grid-letter'>
                                    <LetterBox 
                                        r={r}
                                        c={c}
                                        letter={letter}
                                        wordIndex={wordIndexArray[r][c]}
                                        handleClick={handleLetterButtonClick}
                                        inheritedState={statesArray[r][c]}
                                        setInheritedState={updateArrayValue}
                                    />
                                </div>
                            )
                        })
                    }
                    </div>
                )
            })}
            </div>
            <div key={Date.now()} className='ws-wordslist-container'>
                <div className="ws-wordslist-grid">
            
                {wordsList.map((word, i)=>{
                    return (
                        <div key={i + '-' + Date.now()} className={`ws-wordslist-word ${completedWordsTracker[i] <= 0? 'complete':'incomplete'}`}>
                            <Typography>{word}</Typography>
                        </div>
                    );
                })}
                </div>
            </div>
            </>
        )
    }

    return (
        <>
        {renderLetterGrid()}
        </>
    )
}





// ***********************************************************************************
// Word Search Completion Component
// ***********************************************************************************

export function GameCompletionWordSearchComponent({ numFound, numMisses, maxMisses }) {
    function getMessage() {
      const fractionCorrect = 1 - (numMisses / maxMisses);
      if (fractionCorrect <= 0.1) return 'Nice Try!';
      if (fractionCorrect <= 0.3) return 'Good Effort!';
      if (fractionCorrect <= 0.5) return 'Good!';
      if (fractionCorrect <= 0.7) return 'Great Job!';
      if (fractionCorrect <= 0.9) return 'Great Job!';
      if (fractionCorrect < 1) return 'Almost Perfect'
      return 'Perfecto!';
    }
  
  
    return (
      <div className="game-completion-container">
          {/* Message */}
          <h1 className="completion-message">
            {getMessage()}
          </h1>
  
          {/* Stats */}
          <div className="completion-stats-container">
            <div className="completion-stat-row completion-stat-total">
              <span className="completion-stat-label">Total Lives:</span>
              <span className="completion-stat-value">{maxMisses}</span>
            </div>
            
            <div className="completion-stat-row completion-stat-correct">
              <span className="completion-stat-label">Words Found:</span>
              <span className="completion-stat-value">{numFound}</span>
            </div>
            
            <div className="completion-stat-row completion-stat-incorrect">
              <span className="completion-stat-label">Lives Used:</span>
              <span className="completion-stat-value">{numMisses}</span>
            </div>
          </div>
        </div>
    );
  }

// ************************************************************************************
// Word Search Component
// ************************************************************************************

export default function WordSearch({chapterIndex, setSection, updatePoints}) {
    const [jsonContent, setJsonContent] = useState(null);
    const [wordSearchComponent, setWordSearchComponent] = useState(null);
    const Height = 11;
    const Width = 8;
    const [finished, setFinished] = useState(false);
    const [misses, setMisses] = useState(0);
    const [found, setFound] = useState(0);
    const [updated, setUpdated] = useState(false);
    const maxMisses = 5;

    

    useEffect(() => {
        const words = learningContent[chapterIndex.toString()]?.words;
        if (words) {
            setJsonContent(words);   
            let component = renderWordSearchComponent(processWords(words));
            setWordSearchComponent(component);
            setFinished(false);
            setMisses(0);
            setFound(0);
            setUpdated(false);
        }
    }, [chapterIndex]);

    function shuffleArray(array) {
        const shuffled = [...array]; // copy the array to avoid mutating the original
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
      


    function processWords(words) {
        const wordsList = Array();
        for (let i = 0; i < words.length; i++) {
            let splits = words[i].spanish.toLowerCase().split(' ');
            let w = '';
            let maxLength = Math.max(Width, Height);
            for (let j=0; j < splits.length; j++) {
                if (splits[j].length <= maxLength) {
                    wordsList.push(splits[j])
                }
            }
            
        }
        return shuffleArray(wordsList);
    }


    function renderWordSearchComponent(wordsList) {
        return (
            <>
            <LetterGrid
            words={wordsList}
            Height={Height}
            Width={Width}
            onFinished={(found, misses)=>{
                setFinished(true);
                setFound(found);
                setMisses(misses)    
            }}
            maxMisses={maxMisses}
            >
            </LetterGrid>
            </>
        )

    }

    function handleQuit() {
        setSection('MenuGame');
    }

    function handleRetry() {
        setFinished(false);
        setMisses(0);
        setFound(0);
        let component = renderWordSearchComponent(processWords(jsonContent));
        setWordSearchComponent(component);
        setUpdated(false);
    }




    if (finished) {
        if (!updated) {
            setUpdated(true);
            updatePoints(found, found);
        }
        return (
        <div className="conversation-component-outer-container">
                <GameCompletionWordSearchComponent
                numFound={found}
                numMisses={misses}
                maxMisses={maxMisses}
                >

                </GameCompletionWordSearchComponent>
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
        )
    } else {
        return (
            <div className='wordsearch-container'>
                <div className='ws-grid-container'>{wordSearchComponent && wordSearchComponent}</div>
            </div>
        )

    }





}