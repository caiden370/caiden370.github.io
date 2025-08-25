import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Settings as SettingsIcon, PlayArrow as PlayArrowIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { SettingsButton } from './settings-page';
import { VolumeUp } from '@mui/icons-material';


export function VoiceSettingsButton() {
  const [open, setOpen] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [spanishVoices, setSpanishVoices] = useState([]);
  const [englishVoices, setEnglishVoices] = useState([]);
  const [selectedSpanishVoice, setSelectedSpanishVoice] = useState('');
  const [selectedEnglishVoice, setSelectedEnglishVoice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // localStorage helper functions with error handling
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
      setStorageError(false);
    } catch (error) {
      console.warn('localStorage not available:', error);
      setStorageError(true);
    }
  };

  const loadFromStorage = (key, defaultValue = '') => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn('localStorage not available:', error);
      setStorageError(true);
      return defaultValue;
    }
  };

  function scoreSpanishVoice(voice) {
    let score = 0;
    const nameLower = voice.name.toLowerCase();
    
    // Prefer neural/premium voices
    if (nameLower.includes('enhanced') || nameLower.includes('premium')) score += 100;
    if (nameLower.includes('google')) score += 50;
    if (nameLower.includes('microsoft')) score += 40;
    if (nameLower.includes('apple')) score += 30;
    
    // Prefer female voices (often clearer)
    if (nameLower.includes('female') || nameLower.includes('mujer') || 
        nameLower.includes('maria') || nameLower.includes('sofia') || 
        nameLower.includes('paulina') || nameLower.includes('Paulina')) {
      score += 20;
    }
    
    // Regional preferences
    if (voice.lang === 'es-ES') score += 15;
    else if (voice.lang === 'es-US') score += 12;
    else if (voice.lang === 'es-MS') score += 10;
    else if (voice.lang.startsWith('es-')) score += 5;
    
    // Quality indicators
    if (voice.localService) score += 25;
    if (voice.default) score += 15;
    
    return score;
  }

  function scoreEnglishVoice(voice) {
    let score = 0;
    const nameLower = voice.name.toLowerCase();
    
    if (nameLower.includes('neural') || nameLower.includes('premium')) score += 100;
    if (nameLower.includes('google')) score += 50;
    if (nameLower.includes('microsoft')) score += 40;
    if (nameLower.includes('apple')) score += 30;
    if (nameLower.includes('samantha')) score += 50;
    if (nameLower.includes('samantha')) score += 50;
    
    if (voice.lang === 'en-US') score += 15;
    else if (voice.lang === 'en-GB') score += 10;
    else if (voice.lang.startsWith('en-')) score += 5;
    
    if (voice.localService) score += 25;
    if (voice.default) score += 15;
    
    return score;
  }

  function loadVoices() {
    const voices = synthRef.current.getVoices();
    
    if (voices.length === 0) return false;
    
    const spanish = voices.filter(v => v.lang.startsWith('es'))
      .sort((a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a));
    
    const english = voices.filter(v => v.lang.startsWith('en'))
      .sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a));
    
    setSpanishVoices(spanish);
    setEnglishVoices(english);
    setVoicesLoaded(true);
    
    // Load saved preferences or set defaults
    const savedSpanishVoice = loadFromStorage('selectedSpanishVoice');
    const savedEnglishVoice = loadFromStorage('selectedEnglishVoice');
    
    if (savedSpanishVoice && spanish.find(v => v.name === savedSpanishVoice)) {
      setSelectedSpanishVoice(savedSpanishVoice);
    } else if (spanish.length > 0) {
      const defaultVoice = spanish[0].name;
      setSelectedSpanishVoice(defaultVoice);
      saveToStorage('selectedSpanishVoice', defaultVoice);
    }
    
    if (savedEnglishVoice && english.find(v => v.name === savedEnglishVoice)) {
      setSelectedEnglishVoice(savedEnglishVoice);
    } else if (english.length > 0) {
      const defaultVoice = english[0].name;
      setSelectedEnglishVoice(defaultVoice);
      saveToStorage('selectedEnglishVoice', defaultVoice);
    }
    
    return true;
  }

  function testVoice(voice, isSpanish) {
    synthRef.current.cancel();
    
    setTimeout(() => {
      const msg = new SpeechSynthesisUtterance(
        isSpanish ? "Hola, esta es una prueba de voz en español" : "Hello, this is a test of the English voice"
      );
      msg.voice = voice;
      msg.lang = voice.lang;
      msg.rate = isSpanish ? 0.85 : 0.9;
      msg.volume = 1;
      
      synthRef.current.speak(msg);
    }, 100);
  }

  const handleSpanishVoiceChange = (voiceName) => {
    setSelectedSpanishVoice(voiceName);
    saveToStorage('selectedSpanishVoice', voiceName);
  };

  const handleEnglishVoiceChange = (voiceName) => {
    setSelectedEnglishVoice(voiceName);
    saveToStorage('selectedEnglishVoice', voiceName);
  };

  useEffect(() => {
    const synth = synthRef.current;
    
    const handleVoicesChanged = () => {
      loadVoices();
    };

    if (!loadVoices()) {
      synth.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Retry loading voices
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
    }

    return () => {
      synth.removeEventListener('voiceschanged', handleVoicesChanged);
      synth.cancel();
    };
  }, []);

  const getVoiceDisplayName = (voice) => {
    const baseName = voice.name.replace(/\s*\(.*?\)\s*/g, '').trim();
    return `${baseName} (${voice.lang})`;
  };

  // Export function to get current voice selections (for use by SpeechButton)
  window.getVoicePreferences = () => ({
    spanish: loadFromStorage('selectedSpanishVoice'),
    english: loadFromStorage('selectedEnglishVoice')
  });

  return (
    <>
      <SettingsButton 
        handleClick={() => setOpen(true)}
        label="Voice Settings"
        description="change you voices the app uses."
        iconContent={<VolumeUp></VolumeUp>}
        
      />
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        sx={{marginLeft: '20px', marginRight:'20px'}}
        PaperProps={{
          sx: { minHeight: '300px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VolumeUpIcon />
            Voice Settings
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {storageError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              localStorage is not available. Settings will not persist between sessions.
            </Alert>
          )}
          
          {!voicesLoaded ? (
            <Typography>Loading voices...</Typography>
          ) : (
            <Box>
              {/* Spanish Voices Section */}
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel component="legend" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                  Spanish Voices ({spanishVoices.length} available)
                </FormLabel>
                <RadioGroup
                  value={selectedSpanishVoice}
                  onChange={(e) => handleSpanishVoiceChange(e.target.value)}
                >
                  {spanishVoices.map((voice, index) => (
                    <Box key={voice.name} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <FormControlLabel
                        value={voice.name}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              {getVoiceDisplayName(voice)}
                              {index === 0 && (
                                <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                  (Recommended)
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {voice.localService ? 'Local' : 'Network'} • Score: {scoreSpanishVoice(voice)}
                            </Typography>
                          </Box>
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => testVoice(voice, true)}
                        title="Test voice"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              {/* English Voices Section */}
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                  English Voices ({englishVoices.length} available)
                </FormLabel>
                <RadioGroup
                  value={selectedEnglishVoice}
                  onChange={(e) => handleEnglishVoiceChange(e.target.value)}
                >
                  {englishVoices.map((voice, index) => (
                    <Box key={voice.name} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <FormControlLabel
                        value={voice.name}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              {getVoiceDisplayName(voice)}
                              {index === 0 && (
                                <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                  (Recommended)
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {voice.localService ? 'Local' : 'Network'} • Score: {scoreEnglishVoice(voice)}
                            </Typography>
                          </Box>
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => testVoice(voice, false)}
                        title="Test voice"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}