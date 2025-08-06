import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';
import { useEffect, useRef } from 'react';

export default function SpeechButton({ text, inSpanish, big, small }) {
  const synthRef = useRef(window.speechSynthesis);

  function getPreferredVoice(voices) {
    if (inSpanish) {
      // Prioritize natural-sounding Spanish voices
      return (
        voices.find(v => v.lang === 'es-MX' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang === 'es-US' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang.startsWith('es')) ||
        voices[0]
      );
    } else {
      // Prioritize natural-sounding English voices
      return (
        voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
      );
    }
  }

  function performSpeak() {
    const voices = synthRef.current.getVoices();
    const preferredVoice = getPreferredVoice(voices);

    const msg = new SpeechSynthesisUtterance(text);
    msg.voice = preferredVoice;
    msg.lang = preferredVoice?.lang || (inSpanish ? 'es-US' : 'en-US'); // Set lang based on prop
    msg.pitch = 1;
    msg.rate = 1; // Default rate often sounds more natural, but you can adjust
    msg.volume = 1;

    synthRef.current.speak(msg);
  }

  useEffect(() => {
    // This handles cases where voices aren't loaded immediately
    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.onvoiceschanged = () => {};
    }
  }, []);

  // Determine button size based on props
  let buttonStyle = {};
  if (big) {
    buttonStyle = { fontSize: '3rem', padding: '16px', width: '64px', height: '64px' };
  } else if (small) {
    buttonStyle = { fontSize: '1rem', padding: '4px', width: '32px', height: '32px' };
  }

  return (
    <div className="speech-button-container">
      <IconButton onClick={performSpeak} sx={buttonStyle}>
        <VolumeUpIcon fontSize="inherit" />
      </IconButton>
    </div>
  );
}