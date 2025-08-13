import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { IconButton} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

/**
 * Plays a "checkmark" sound - two ascending notes like "ding dong" ✓
 */
export function playCorrectSound() {
  // Ensure Tone.js audio context is started on user interaction
  if (Tone.context.state !== 'running') {
    Tone.start();
  }

  // Create a bright, playful synth
  const synth = new Tone.Synth({
    oscillator: {
      type: 'triangle'
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.1,
      release: 0.3
    }
  }).toDestination();

  // Add some sparkle with reverb
  const reverb = new Tone.Reverb({
    decay: 0.6,
    wet: 0.2
  }).toDestination();

  synth.connect(reverb);

  const now = Tone.now();

  // Two ascending notes - like drawing a checkmark ✓
  synth.triggerAttackRelease("E5", "16n", now);       // ding
  synth.triggerAttackRelease("B5", "8n", now + 0.12); // dong (perfect fifth up)

  setTimeout(() => {
    reverb.dispose();
    synth.dispose();
  }, 700);
}


/**
 * Plays a "do dun" error sound - two descending notes (gentle disappointment)
 */
export function playIncorrectSound() {
  // Ensure Tone.js audio context is started on user interaction
  if (Tone.context.state !== 'running') {
    Tone.start();
  }

  // Create a softer, warmer synth
  const synth = new Tone.Synth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.2,
      release: 0.3
    }
  }).toDestination();

  // Gentle filtering to keep it soft
  const filter = new Tone.Filter({
    frequency: 1000,
    type: 'lowpass'
  }).toDestination();

  synth.connect(filter);

  const now = Tone.now();

  // Two descending notes - "do dun" pattern
  synth.triggerAttackRelease("G4", "16n", now);       // do (higher)
  synth.triggerAttackRelease("D4", "8n", now + 0.12); // dun (perfect fourth down)

  setTimeout(() => {
    filter.dispose();
    synth.dispose();
  }, 500);
}

export default function SpeechButton({ text, inSpanish, big, small}) {
  const synthRef = useRef(window.speechSynthesis);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // localStorage helper function with error handling
  const loadFromStorage = (key, defaultValue = '') => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return defaultValue;
    }
  };

  function getSelectedVoice(voices) {
    // Get saved voice preference from localStorage
    const targetVoiceName = inSpanish ? 
      loadFromStorage('selectedSpanishVoice') : 
      loadFromStorage('selectedEnglishVoice');
    
    if (targetVoiceName) {
      const selectedVoice = voices.find(v => v.name === targetVoiceName);
      if (selectedVoice) {
        console.log('Using saved voice:', selectedVoice.name, selectedVoice.lang);
        return selectedVoice;
      }
    }
    
    // Fallback to automatic selection
    return getPreferredVoice(voices);
  }

  function getPreferredVoice(voices) {
    if (inSpanish) {
      const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
      
      if (spanishVoices.length === 0) {
        return voices[0];
      }
      
      // Score-based selection for Spanish voices
      function scoreVoice(voice) {
        let score = 0;
        const nameLower = voice.name.toLowerCase();
        
        if (nameLower.includes('neural') || nameLower.includes('premium')) score += 100;
        if (nameLower.includes('google')) score += 50;
        if (nameLower.includes('microsoft')) score += 40;
        if (nameLower.includes('apple')) score += 30;
        
        if (nameLower.includes('female') || nameLower.includes('mujer') || 
            nameLower.includes('maria') || nameLower.includes('sofia') || 
            nameLower.includes('paloma') || nameLower.includes('isabela')) {
          score += 20;
        }
        
        if (voice.lang === 'es-MX') score += 15;
        else if (voice.lang === 'es-US') score += 12;
        else if (voice.lang === 'es-ES') score += 10;
        else if (voice.lang.startsWith('es-')) score += 5;
        
        if (voice.localService) score += 25;
        if (voice.default) score += 15;
        
        return score;
      }
      
      spanishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      console.log('Using auto-selected Spanish voice:', spanishVoices[0]?.name, spanishVoices[0]?.lang);
      return spanishVoices[0];
      
    } else {
      // English voice selection
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      
      if (englishVoices.length === 0) {
        return voices[0];
      }
      
      const selectedVoice = (
        englishVoices.find(v => v.name.toLowerCase().includes('neural')) ||
        englishVoices.find(v => v.name.toLowerCase().includes('premium')) ||
        englishVoices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('google')) ||
        englishVoices.find(v => v.localService && v.lang === 'en-US') ||
        englishVoices.find(v => v.lang === 'en-US') ||
        englishVoices[0]
      );
      
      console.log('Using auto-selected English voice:', selectedVoice?.name, selectedVoice?.lang);
      return selectedVoice;
    }
  }

  async function performSpeak() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    synthRef.current.cancel();
    
    setTimeout(() => {
      const voices = synthRef.current.getVoices();
      
      if (voices.length === 0) {
        console.warn('No voices available for speech synthesis');
        return;
      }

      if (!text || text.trim() === '') {
        console.warn('No text provided for speech synthesis');
        return;
      }

      const preferredVoice = getSelectedVoice(voices);

      const msg = new SpeechSynthesisUtterance(text.trim());
      msg.voice = preferredVoice;
      msg.lang = preferredVoice?.lang || (inSpanish ? 'es-US' : 'en-US');
      msg.pitch = 1;
      msg.rate = inSpanish ? 0.85 : 0.9; // Slightly slower for Spanish
      msg.volume = 1;

      msg.onerror = (event) => {
        console.error('Speech synthesis error:', event.error, event);
        // Try to resume the speech synthesis if it gets interrupted
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted, attempting to resume...');
        }
      };

      msg.onstart = () => {
        console.log('Speech started for text:', text.substring(0, 50) + '...');
      };

      msg.onend = () => {
        console.log('Speech ended successfully');
      };

      msg.onpause = () => {
        console.log('Speech paused');
      };

      msg.onresume = () => {
        console.log('Speech resumed');
      };

      // Check if speech synthesis is available and not paused
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }

      synthRef.current.speak(msg);
      
      // Log current state
      console.log('Speech synthesis state:', {
        speaking: synthRef.current.speaking,
        pending: synthRef.current.pending,
        paused: synthRef.current.paused
      });
    }, 150);
  }

  useEffect(() => {
    const synth = synthRef.current;
    
    const handleVoicesChanged = () => {
      const voices = synth.getVoices();
      console.log('Voices changed event fired, found voices:', voices.length);
      if (voices.length > 0) {
        setVoicesLoaded(true);
        // Log available voices for debugging
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      }
    };

    // Force a check for voices on mount
    const checkVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        console.log('Voices already loaded:', voices.length);
        setVoicesLoaded(true);
        return true;
      }
      return false;
    };

    // Try to load voices immediately
    if (!checkVoices()) {
      // If voices aren't loaded yet, set up the listener
      synth.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Some browsers need a manual trigger
      setTimeout(checkVoices, 100);
      setTimeout(checkVoices, 500);
      setTimeout(checkVoices, 1000);
    }

    // Cleanup function
    return () => {
      synth.removeEventListener('voiceschanged', handleVoicesChanged);
      synth.cancel(); // Cancel any ongoing speech when component unmounts
    };
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
      <IconButton 
        onClick={performSpeak} 
        sx={buttonStyle}
        disabled={!voicesLoaded || !text}
        title={!voicesLoaded ? 'Loading voices...' : 'Click to speak'}
      >
        <VolumeUpIcon fontSize="inherit" />
      </IconButton>
    </div>
  );
}