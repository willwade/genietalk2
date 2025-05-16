import React, { useState, useEffect } from 'react';
import Keyboard from './components/Keyboard';
import UtteranceBar from './components/UtteranceBar';
import { addUtterance } from './utils/predictionUtils';
import { initializeModel, saveModelState, loadModelState } from './models/modelInitializer';
import './styles/App.css';

function App() {
  const [text, setText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [utteranceHistory, setUtteranceHistory] = useState([]);

  // Initialize the PPM model when the app loads
  useEffect(() => {
    console.log('Initializing PPM model in App component...');

    // Try to load saved model state first
    const modelLoaded = loadModelState();

    // If no saved state, initialize with default training data
    if (!modelLoaded) {
      initializeModel();
    }

    // Save model state when the component unmounts
    return () => {
      console.log('Saving PPM model state...');
      saveModelState();
    };
  }, []);

  const handleKeyPress = (key) => {
    const newText = text.slice(0, cursorPosition) + key + text.slice(cursorPosition);
    setText(newText);
    setCursorPosition(cursorPosition + 1);
  };

  const handleWordSelect = (word) => {
    // Add space after word if it's not at the beginning and there's no space before
    const needsSpace = cursorPosition > 0 && text[cursorPosition - 1] !== ' ';
    const prefix = needsSpace ? ' ' : '';

    const newText = text.slice(0, cursorPosition) + prefix + word + ' ' + text.slice(cursorPosition);
    setText(newText);
    setCursorPosition(cursorPosition + prefix.length + word.length + 1);
  };

  const handleUtteranceSelect = (utterance, selectedWordIndex) => {
    // Extract text up to and including the selected word
    const words = utterance.split(' ');
    const selectedPortion = words.slice(0, selectedWordIndex + 1).join(' ');

    const newText = text.slice(0, cursorPosition) + selectedPortion + ' ' + text.slice(cursorPosition);
    setText(newText);
    setCursorPosition(cursorPosition + selectedPortion.length + 1);
  };

  const handleDeleteWord = () => {
    // Find the last word boundary before the cursor
    let newCursorPos = cursorPosition;
    let i = cursorPosition - 1;

    // Skip trailing spaces
    while (i >= 0 && text[i] === ' ') {
      i--;
      newCursorPos--;
    }

    // Find the beginning of the word
    while (i >= 0 && text[i] !== ' ') {
      i--;
      newCursorPos--;
    }

    const newText = text.slice(0, i + 1) + text.slice(cursorPosition);
    setText(newText);
    setCursorPosition(newCursorPos);
  };

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const newText = text.slice(0, cursorPosition - 1) + text.slice(cursorPosition);
      setText(newText);
      setCursorPosition(cursorPosition - 1);
    }
  };

  const handleDeleteAll = () => {
    setText('');
    setCursorPosition(0);
  };

  const handleSpeak = () => {
    if (text.trim()) {
      // Add the utterance to our history and update the PPM model
      addUtterance(text);

      // Update local state
      setUtteranceHistory(prevHistory => [text, ...prevHistory]);

      // In a real implementation, this would trigger speech synthesis
      // For example:
      // const speech = new SpeechSynthesisUtterance(text);
      // window.speechSynthesis.speak(speech);

      console.log('Speaking:', text);
      console.log('Added to PPM model for future predictions');

      // Clear the text field
      setText('');
      setCursorPosition(0);

      // Save model state after adding a new utterance
      saveModelState();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GenieTalk</h1>
        <p>Assistive Text Entry System</p>
      </header>
      <UtteranceBar
        text={text}
        cursorPosition={cursorPosition}
        setCursorPosition={setCursorPosition}
      />
      <Keyboard
        onKeyPress={handleKeyPress}
        onWordSelect={handleWordSelect}
        onUtteranceSelect={handleUtteranceSelect}
        onDeleteWord={handleDeleteWord}
        onBackspace={handleBackspace}
        onDeleteAll={handleDeleteAll}
        onSpeak={handleSpeak}
        currentText={text}
        cursorPosition={cursorPosition}
      />
    </div>
  );
}

export default App;
