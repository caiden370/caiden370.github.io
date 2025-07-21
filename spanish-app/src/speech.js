import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton, Button } from '@mui/material';
import { useEffect, useRef } from 'react';

export default function SpeechButton({ text, inSpanish, big }) {
  const synthRef = useRef(window.speechSynthesis);


  
  function performSpeak() {
    const voices = synthRef.current.getVoices();

    let preferredVoice = null;

    if (inSpanish) {
        preferredVoice =
        voices.find(
          voice =>
            (voice.lang === 'es-MX' || voice.lang === 'es-US' || voice.lang.startsWith('es')) &&
            voice.name.toLowerCase().includes('latin')
        ) || voices.find(voice => voice.lang.startsWith('es')) || voices[0];
    } else {
        preferredVoice =
        voices.find(
          voice =>
            (voice.lang === 'en-US' || voice.lang.startsWith('en'))
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

    }



    const msg = new SpeechSynthesisUtterance(text);
    msg.voice = preferredVoice;
    msg.lang = preferredVoice?.lang || 'es-US';
    msg.pitch = 1;
    msg.rate = 0.85; // Slightly slower for clarity
    msg.volume = 1;

    synthRef.current.speak(msg);
  }

  useEffect(() => {
    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.onvoiceschanged = () => {};
    }
  }, []);


  let useBigStyle = false
  if (big) {
    useBigStyle = true
  }

  const BigStyle = {fontSize: '3rem',     
        padding: '16px',       
        width: '64px',
        height: '64px'}

  return (
    <div className='speech-button-container'>
    <IconButton onClick={performSpeak} sx={useBigStyle? BigStyle : {}}>
      <VolumeUpIcon fontSize='inherit'/>
    </IconButton>
    </div>
  );
}
