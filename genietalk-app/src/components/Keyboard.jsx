import React, { useState, useEffect } from 'react';
import KeyboardRow from './KeyboardRow';
import FunctionKeys from './FunctionKeys';
import '../styles/Keyboard.css';
import { generateWordPredictions, generateUtterancePredictions } from '../utils/predictionUtils';

const Keyboard = ({
  onKeyPress,
  onWordSelect,
  onUtteranceSelect,
  onDeleteWord,
  onBackspace,
  onDeleteAll,
  onSpeak,
  currentText,
  cursorPosition
}) => {
  const [wordPredictionMap, setWordPredictionMap] = useState({});
  const [utterancePredictionMap, setUtterancePredictionMap] = useState({});

  // Define keyboard layout
  const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '?']
  ];

  // Update predictions when text changes
  useEffect(() => {
    const updatePredictions = async () => {
      const textBeforeCursor = currentText.slice(0, cursorPosition);
      const words = textBeforeCursor.split(' ');
      const currentWord = words[words.length - 1] || '';

      try {
        // Generate word predictions (async)
        const wordMap = await generateWordPredictions(textBeforeCursor, currentWord);
        setWordPredictionMap(wordMap);

        // Generate utterance predictions (async)
        const utteranceMap = await generateUtterancePredictions(textBeforeCursor);
        setUtterancePredictionMap(utteranceMap);
      } catch (error) {
        console.error('Error updating predictions:', error);
        // Set empty predictions on error
        setWordPredictionMap({});
        setUtterancePredictionMap({});
      }
    };

    updatePredictions();
  }, [currentText, cursorPosition]);

  // Render a word prediction above a key
  const renderWordPrediction = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    const wordPredictions = wordPredictionMap[key] || [];

    return (
      <div className="key-prediction-container">
        {/* Word predictions (yellow) */}
        {wordPredictions.map((word, index) => (
          <button
            key={`word-${rowIndex}-${colIndex}-${index}`}
            className="prediction word-prediction"
            onClick={() => onWordSelect(word)}
          >
            {word}
          </button>
        ))}
      </div>
    );
  };

  // Helper function to check if a row has sentence predictions
  const hasSentencePredictionsForRow = (rowIndex) => {
    for (let colIndex = 0; colIndex < keyboardLayout[rowIndex].length; colIndex++) {
      const key = `${rowIndex}-${colIndex}`;
      const utterances = utterancePredictionMap[key] || [];
      if (utterances.length > 0) {
        return true;
      }
    }
    return false;
  };

  // Render utterance predictions positioned above their starting letters
  const renderPositionedUtterancePredictions = (rowIndex) => {
    const predictions = [];

    // Collect utterances for this row with their positions
    for (let colIndex = 0; colIndex < keyboardLayout[rowIndex].length; colIndex++) {
      const key = `${rowIndex}-${colIndex}`;
      const utterances = utterancePredictionMap[key] || [];

      if (utterances.length > 0) {
        // Only take the first (highest ranked) utterance for this position
        const utterance = utterances[0];

        predictions.push({
          utterance,
          colIndex,
          key: `positioned-utterance-${rowIndex}-${colIndex}`
        });
      }
    }

    if (predictions.length === 0) return null;

    // Calculate the total width of the keyboard row to center properly
    const keySize = 50; // --key-size
    const keySpacing = 8; // --key-spacing
    const numKeys = keyboardLayout[rowIndex].length;
    const totalKeysWidth = (numKeys * keySize) + ((numKeys - 1) * keySpacing);

    // Calculate the starting offset to center the row
    const containerWidth = 100; // This will be calculated as percentage
    const startOffset = `calc(50% - ${totalKeysWidth / 2}px)`;

    return (
      <div className="positioned-utterance-predictions">
        {predictions.map(({ utterance, colIndex, key }) => (
          <div
            key={key}
            className="positioned-utterance-container"
            style={{
              left: `calc(${startOffset} + ${colIndex * (keySize + keySpacing)}px)`,
            }}
          >
            {utterance.split(' ').map((word, wordIndex) => (
              <button
                key={`${key}-word-${wordIndex}`}
                className="prediction utterance-prediction"
                onClick={() => onUtteranceSelect(utterance, wordIndex)}
              >
                {word}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="keyboard-container">
      <div className="keyboard-layout">
        <div className="keyboard-main">
          {/* First row with word and utterance predictions */}
          <div className={`row-container ${hasSentencePredictionsForRow(0) ? 'has-sentence-predictions' : ''}`}>
            {/* Positioned utterance predictions */}
            {renderPositionedUtterancePredictions(0)}
            <div className="prediction-row">
              {keyboardLayout[0].map((key, colIndex) => (
                <div
                  key={`prediction-0-${colIndex}`}
                  className="key-prediction-slot"
                >
                  {renderWordPrediction(0, colIndex)}
                </div>
              ))}
            </div>
            <KeyboardRow
              keys={keyboardLayout[0]}
              onKeyPress={onKeyPress}
            />
          </div>

          {/* Second row with word and utterance predictions */}
          <div className={`row-container ${hasSentencePredictionsForRow(1) ? 'has-sentence-predictions' : ''}`}>
            {/* Positioned utterance predictions */}
            {renderPositionedUtterancePredictions(1)}
            <div className="prediction-row">
              {keyboardLayout[1].map((key, colIndex) => (
                <div
                  key={`prediction-1-${colIndex}`}
                  className="key-prediction-slot"
                >
                  {renderWordPrediction(1, colIndex)}
                </div>
              ))}
            </div>
            <KeyboardRow
              keys={keyboardLayout[1]}
              onKeyPress={onKeyPress}
            />
          </div>

          {/* Third row with word and utterance predictions */}
          <div className={`row-container ${hasSentencePredictionsForRow(2) ? 'has-sentence-predictions' : ''}`}>
            {/* Positioned utterance predictions */}
            {renderPositionedUtterancePredictions(2)}
            <div className="prediction-row">
              {keyboardLayout[2].map((key, colIndex) => (
                <div
                  key={`prediction-2-${colIndex}`}
                  className="key-prediction-slot"
                >
                  {renderWordPrediction(2, colIndex)}
                </div>
              ))}
            </div>
            <KeyboardRow
              keys={keyboardLayout[2]}
              onKeyPress={onKeyPress}
            />
          </div>

          <div className="spacebar-row">
            <button
              className="key spacebar"
              onClick={() => onKeyPress(' ')}
            >
              Space
            </button>
          </div>
        </div>

        <FunctionKeys
          onDeleteWord={onDeleteWord}
          onBackspace={onBackspace}
          onDeleteAll={onDeleteAll}
          onSpeak={onSpeak}
        />
      </div>
    </div>
  );
};

export default Keyboard;
