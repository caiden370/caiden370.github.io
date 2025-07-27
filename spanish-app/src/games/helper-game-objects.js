import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import '../App.css';
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DoneIcon from '@mui/icons-material/Done';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SpeechButton from "../speech";
import { processText } from "./ui-objects";
//******************************************************************************** */
// Multiple Choice

//******************************************************************************** */
 
export function MultipleChoice({ setResult, question, options, answerIndex, onAnswered, questionInSpanish}) {
  const [correctIndex, setCorrectIndex] = useState(null);
  const [incorrectIndex, setIncorrectIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [currResult, setCurrResult] = useState(null);

  useEffect(()=>{setAnswered(false)},[question])

  const handleSubmit = (index) => {
    if (answered) return; // prevent double clicks
    onAnswered();
    const isCorrect = index === answerIndex;
    setResult(isCorrect);
    setCurrResult(isCorrect);
    setCorrectIndex(answerIndex);
    if (!isCorrect) { setIncorrectIndex(index) }  else setIncorrectIndex(null);
    setAnswered(true);
  };

  const selectColor = (index) => {
    if (!answered) return 'white';
    if (index === correctIndex) return 'rgb(88, 191, 83)';
    if (index === incorrectIndex) return 'rgb(229, 65, 65)';
    return 'white';
  };

  const selectBorderColor = (index) => {
    if (!answered) return 'primary';
    if (index === correctIndex) return 'rgb(13, 140, 24)';
    if (index === incorrectIndex) return 'rgb(215, 41, 41)';
    return 'primary';
  };

  const selectTextColor = (index) => {
    if (!answered) return 'black';
    if (index === correctIndex) return 'white';
    if (index === incorrectIndex) return 'white';
    return 'black';
  };

  const selectLetter = (index) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return (
      <div className="multiple-choice-letter-container">
        <Typography align='center'>{letters[index]}</Typography>
      </div>
    )
  }


  function validationModal(answer) {
    const statusClass = currResult ? "correct" : "incorrect";
    return (
    <div className="mr-text-response-modal-container">
      <div
        key="mr-text-response-modal"
        className={`mr-text-response-modal ${statusClass}`}
      >
        <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{currResult ? "Correct!" : "Incorrect"}</Typography>
        <Typography>{answer}</Typography>
      </div>
      </div>
    );
  }

  return (
    <div className="multiple-choice-container">

      <div className="multiple-choice-question">
        <SpeechButton text={question} inSpanish={questionInSpanish}></SpeechButton>
        <Typography align="center" sx={{fontWeight:'bold'}}>{question}</Typography>
      </div>
      
      


      <Box sx={{flexGrow: 1, width: '100%', justifyContent: 'center', display: 'flex',  height: '40%', color: 'primary' }}>
        <Grid  sx={{width: '100%'}}container spacing={1}>
      <div className="multiple-choice-options">
        {options.map((op, i) => (
          <Grid size={8} sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <Button
              key={i}
              variant="contained"
              fullWidth
              onClick={() => handleSubmit(i)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: 1,
                borderRadius: '8px',
                backgroundColor: selectColor(i),
                borderColor: selectBorderColor(i),
                color: selectTextColor(i),
                textTransform: 'none'
              }}
            >
              {selectLetter(i)}
              <div style={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography>{op}</Typography>
              </div>

              <SpeechButton text={op}  inSpanish={!questionInSpanish}/>
            </Button>
          </Grid>
        ))}
        
      </div>
      {answered && validationModal(options[answerIndex])}
      </Grid>
      </Box>
    </div>
    
  );
}
//******************************************************************************** */
// Text Response
//******************************************************************************** */

export function TextResponse({question, answer, onAnswered, setResult, questionInSpanish}) {

    const [response, setResponse] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(()=>{
        setAnswered(false);
        setResponse('');
        setShowModal(false);
    },[question])

    function handleSubmit() {
        let allowedMistakes = Math.floor(answer.length / 10) + 2;
        let mistakes = 0;
        onAnswered();
        setAnswered(true);
        setShowModal(true);
        const processedAnswer = processText(answer);
        const processedResp = processText(response);
        if (processedAnswer.length != processedResp.length) {
            setResult(false);
            setIsCorrect(false);
            return;
        }

        for (let i = 0; i < Math.min(processedAnswer.length, processedResp.length); i++) {
          if ((processedAnswer[i]+'').toLowerCase() != (processedResp[i]+'').toLowerCase()) {
                mistakes += 1
            }
            if (mistakes >= allowedMistakes) {
                setResult(false);
                setIsCorrect(false);
                return;
            }

        }
        setResult(true);
        setIsCorrect(true);
    }


    function validationModal() {
        const statusClass = isCorrect ? "correct" : "incorrect";
        return (
        <div className="mr-text-response-modal-container">
          <div
            key="mr-text-response-modal"
            className={`mr-text-response-modal ${statusClass}`}
          >
            <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{isCorrect ? "Correct!" : "Incorrect"}</Typography>
            <Typography>{answer}</Typography>
          </div>
          </div>
        );
      }

    function submitButton() {
      return (
        <div className='mixed-review-continue'>
        <Button disabled={answered} variant='contained' color='success' onClick={handleSubmit}>
            <Typography>Check</Typography>
        </Button>
        </div>
      )

    }

    function textField() {
        return (
            <div  className="mr-text-response-answer">
            <Typography align="left">Translate:</Typography>
            <div key='mrTextResponse' className="mr-text-response-textfield">
            <TextField
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666", // optional: label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#666", // optional: label color on focus
                  },
                }}

                
                value={response}
                onChange={(e) => 
                    !answered ? setResponse(e.target.value) : null}
                />
                </div>
            {!answered && submitButton()}

        </div>
        )
    }
      
    
    return (
        <div className="mr-text-response-container">
            <div className="mr-text-response-question">
            <SpeechButton inSpanish={questionInSpanish} text={question}></SpeechButton>
            <Typography align="center" sx={{fontWeight: 'bold'}} >{question}</Typography>
            </div>
            {textField()}
            {showModal && validationModal()}
        </div>
    );
}
//******************************************************************************** */

// FILL IN THE BLANK
//******************************************************************************** */

export function FillInTheBlank({phraseList, missingIndex, setResult, onAnswered, questionInSpanish}) {
  const [response, setResponse] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
    setAnswered(false);
    setResponse('');
    setShowModal(false);
  },[phraseList])
  
  function renderLine() {

    let question = '';
    let questionText = '';
    
    phraseList.map((word, i)=>{
      if (i != missingIndex) {
        question += word + ' ';
      } else {
        question += '. ? ? ? ? ? ? ? ? ? ? ? ? ? . ';
      }})

    

    return (
      <>
      <SpeechButton text={question} inSpanish={questionInSpanish}></SpeechButton>
      <div className="mr-fillblank-line">
      {phraseList.map((word, i)=>{
        if (i != missingIndex) {
          questionText += word + ' '
          return (<Typography align="center" sx={{fontWeight:'bold'}}>{word}</Typography>)
        } else {
          questionText += 'spacio '
          return (<Typography sx={{fontWeight:'bold'}}>_____</Typography>)
        }
        

      })}
      
       </div>
       </>
    )

  }


  function textField() {
    return (
        <div  className="mr-text-response-answer">
        <Typography align="left">Fill in the blank:</Typography>
        <div key='mrTextResponse' className="mr-text-response-textfield">
        <TextField
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#666", // optional: label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#666", // optional: label color on focus
              },
            }}

            
            value={response}
            onChange={(e) => 
                !answered ? setResponse(e.target.value) : null}
            />
            </div>
        {!answered && submitButton()}

    </div>
    )
}


function handleSubmit() {
  const answer = phraseList[missingIndex];
  let allowedMistakes = Math.floor(answer.length / 10) + 2;
  let mistakes = 0;
  onAnswered();
  setAnswered(true);
  setShowModal(true);
  const processedAnswer = processText(answer);
  const processedResp = processText(response);
  if (processedAnswer.length != processedResp.length) {
      setResult(false);
      setIsCorrect(false);
      return;
  }

  for (let i = 0; i < Math.min(processedAnswer.length, processedResp.length); i++) {
      if ((processedAnswer[i]+'').toLowerCase() != (processedResp[i]+'').toLowerCase()) {
          mistakes += 1
      }
      if (mistakes >= allowedMistakes) {
          setResult(false);
          setIsCorrect(false);
          return;
      }

  }
  setResult(true);
  setIsCorrect(true);
}



function submitButton() {
  return (
    <div className='mixed-review-continue'>
    <Button disabled={answered} variant='contained' color='success' onClick={handleSubmit}>
        <Typography>Check</Typography>
    </Button>
    </div>
  )

}

function validationModal() {
  const answer = phraseList[missingIndex];
  const statusClass = isCorrect ? "correct" : "incorrect";
  return (
  <div className="mr-text-response-modal-container">
    <div
      key="mr-text-response-modal"
      className={`mr-text-response-modal ${statusClass}`}
    >
      <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{isCorrect ? "Correct!" : "Incorrect"}</Typography>
      <Typography>{answer}</Typography>
    </div>
    </div>
  );
}

  return (
    <>
    <div className='mr-fillblank-container'>
      <div className='mr-fillblank-question'>
      {renderLine()}
      </div>
      
      {textField()}
      
    </div>
    {showModal && validationModal()}
    </>
  )
}
//******************************************************************************** */
// Audio Exact Text Response
//******************************************************************************** */

export function AudioExactTextResponse({question, answer, onAnswered, setResult, questionInSpanish}) {

  const [response, setResponse] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
      setAnswered(false);
      setResponse('');
      setShowModal(false);
  },[question])

  function handleSubmit() {
      let allowedMistakes = Math.floor(answer.length / 10) + 3;
      let mistakes = 0;
      onAnswered();
      setAnswered(true);
      setShowModal(true);
      const processedAnswer = processText(answer);
      const processedResp = processText(response);
      if (processedAnswer.length != processedResp.length) {
          setResult(false);
          setIsCorrect(false);
          return;
      }

      for (let i = 0; i < Math.min(processedAnswer.length, processedResp.length); i++) {
          if ((processedAnswer[i]+'').toLowerCase() != (processedResp[i]+'').toLowerCase()) {
              mistakes += 1
          }
          if (mistakes >= allowedMistakes) {
              setResult(false);
              setIsCorrect(false);
              return;
          }

      }
      setResult(true);
      setIsCorrect(true);
  }


  function validationModal() {
      const statusClass = isCorrect ? "correct" : "incorrect";
      return (
      <div className="mr-text-response-modal-container">
        <div
          key="mr-text-response-modal"
          className={`mr-text-response-modal ${statusClass}`}
        >
          <Typography sx={{fontWeight:'bold', fontFamily:'Segoe Print, Comic Sans MS, cursive'}}>{isCorrect ? "Correct!" : "Incorrect"}</Typography>
          <Typography>{answer}</Typography>
        </div>
        </div>
      );
    }

  function submitButton() {
    return (
      <div className='mixed-review-continue'>
      <Button disabled={answered} variant='contained' color='success' onClick={handleSubmit}>
          <Typography>Check</Typography>
      </Button>
      </div>
    )

  }

  function textField() {
      return (
          <div  className="mr-text-response-answer">
          <Typography align="left">What did you hear?</Typography>
          <div key='mrTextResponse' className="mr-text-response-textfield">
          <TextField
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666", // optional: label color
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#666", // optional: label color on focus
                },
              }}

              
              value={response}
              onChange={(e) => 
                  !answered ? setResponse(e.target.value) : null}
              />
              </div>
          {!answered && submitButton()}

      </div>
      )
  }
    
  
  return (
      <div className="mr-text-response-container">
          <div className="mr-text-response-question">
          <SpeechButton inSpanish={questionInSpanish} text={question} big={true}></SpeechButton>
          </div>
          {textField()}
          {showModal && validationModal()}
      </div>
  );
}

