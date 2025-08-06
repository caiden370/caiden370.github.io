import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone'; // Import Tone.js

/**
 * Plays a short, pleasant "ding" sound for correct feedback.
 */
export function playCorrectSound() {
  // Ensure Tone.js audio context is started on user interaction
  // This is crucial for audio to play in modern browsers
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
  // Create a simple synth
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();

  // Play a short, rising arpeggio
  synth.triggerAttackRelease("C5", "8n", now);
  synth.triggerAttackRelease("E5", "8n", now + 0.1);
  synth.triggerAttackRelease("G5", "8n", now + 0.2);
  synth.triggerAttackRelease("C6", "8n", now + 0.3);

  // Dispose of the synth after a short delay to free up resources
  // This prevents memory leaks and ensures clean audio state
  setTimeout(() => {
    synth.dispose();
  }, 500);
}

/**
 * Plays a short, dissonant sound for incorrect feedback.
 */
export function playIncorrectSound() {
  // Ensure Tone.js audio context is started on user interaction
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
  // Create a simple synth
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();

  // Play a short, falling, slightly dissonant chord
  synth.triggerAttackRelease("C4", "8n", now);
  synth.triggerAttackRelease("B3", "8n", now + 0.1);
  synth.triggerAttackRelease("A3", "8n", now + 0.2);
  synth.triggerAttackRelease("G#3", "8n", now + 0.3);

  // Dispose of the synth after a short delay
  setTimeout(() => {
    synth.dispose();
  }, 500);
}

export default function SpeechButton({ text, inSpanish, big, small }) {
  const synthRef = useRef(window.speechSynthesis);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

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

  async function performSpeak() {
    // Ensure audio context is started (important for both Tone.js and speech synthesis)
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    // Cancel any ongoing speech first
    synthRef.current.cancel();
    
    // Add a small delay to ensure cancellation is complete
    setTimeout(() => {
      const voices = synthRef.current.getVoices();
      
      // Check if we have voices available
      if (voices.length === 0) {
        console.warn('No voices available for speech synthesis');
        return;
      }

      // Check if text is available
      if (!text || text.trim() === '') {
        console.warn('No text provided for speech synthesis');
        return;
      }

      const preferredVoice = getPreferredVoice(voices);
      console.log('Using voice:', preferredVoice?.name, preferredVoice?.lang);

      const msg = new SpeechSynthesisUtterance(text.trim());
      msg.voice = preferredVoice;
      msg.lang = preferredVoice?.lang || (inSpanish ? 'es-US' : 'en-US');
      msg.pitch = 1;
      msg.rate = 0.9; // Slightly slower for better clarity
      msg.volume = 1;

      // Add comprehensive error handling
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
    }, 150); // Slightly longer delay for better reliability
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