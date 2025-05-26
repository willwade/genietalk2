// Import the model initializer and functions
import {
  initializeModel,
  addUtteranceToModel,
  generateWordPredictionsWithBackoff,
  generateUtterancePredictionsWithBackoff
} from '../models/modelInitializer';
import { usePPMModel, useImaginvilleAPI } from '../config/appConfig';

// Initialize the appropriate model when this module is loaded
initializeModel();

// Store utterance history
let utteranceHistory = [];

// Function to add an utterance to history and update the model
export const addUtterance = (utterance) => {
  // Add to local history
  utteranceHistory.unshift(utterance);

  // Also update the PPM model
  addUtteranceToModel(utterance);
};

// Map of letters to their position in the keyboard layout
const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '?']
];

// Function to find the position of a letter in the keyboard
const findLetterPosition = (letter) => {
  for (let rowIndex = 0; rowIndex < keyboardLayout.length; rowIndex++) {
    const colIndex = keyboardLayout[rowIndex].indexOf(letter.toLowerCase());
    if (colIndex !== -1) {
      return { row: rowIndex, col: colIndex };
    }
  }
  return null;
};

// Function to generate word predictions based on current input
export const generateWordPredictions = async (text, currentWord) => {
  // Initialize an empty map for predictions
  const predictionMap = {};

  // Remove hardcoded mock data - use real predictions only

  // Get predictions from the model with backoff strategy
  const predictions = await generateWordPredictionsWithBackoff(text, currentWord, 10);

  if (!predictions || predictions.length === 0) {
    // Fallback to basic predictions if the model returns nothing
    const startingWords = ['I', 'The', 'A', 'In', 'To'];

    startingWords.forEach(word => {
      const firstLetter = word.charAt(0).toLowerCase();
      const position = findLetterPosition(firstLetter);
      if (position) {
        if (!predictionMap[`${position.row}-${position.col}`]) {
          predictionMap[`${position.row}-${position.col}`] = [];
        }
        predictionMap[`${position.row}-${position.col}`].push(word);
      }
    });

    return predictionMap;
  }

  // Position each predicted word above the key that would be pressed next
  predictions.forEach(word => {
    // Determine which key the prediction should appear above
    let position;

    if (!currentWord) {
      // If no current word, position above the first letter of the predicted word
      const firstLetter = word.charAt(0).toLowerCase();
      position = findLetterPosition(firstLetter);
    } else {
      // Find the next letter that would be typed
      const nextLetterIndex = currentWord.length;
      if (nextLetterIndex < word.length) {
        const nextLetter = word.charAt(nextLetterIndex);
        position = findLetterPosition(nextLetter);
      } else {
        // If we're at the end of the word, use the first letter
        const firstLetter = word.charAt(0).toLowerCase();
        position = findLetterPosition(firstLetter);
      }
    }

    if (position) {
      const key = `${position.row}-${position.col}`;
      if (!predictionMap[key]) {
        predictionMap[key] = [];
      }

      // Only add if we don't already have too many predictions at this position
      if (predictionMap[key].length < 2) {
        predictionMap[key].push(word);
      }
    }
  });

  // If we have fewer than 5 total predictions, distribute them more evenly
  const totalPredictions = Object.values(predictionMap).flat().length;
  if (totalPredictions < 5 && predictions.length > 0) {
    // Try to add more predictions to empty slots
    const remainingPredictions = predictions.filter(word =>
      !Object.values(predictionMap).flat().includes(word)
    );

    remainingPredictions.forEach(word => {
      // Find an empty or less populated position (allow up to 2 words per key)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < (row === 0 ? 10 : (row === 1 ? 9 : 9)); col++) {
          const key = `${row}-${col}`;
          if (!predictionMap[key] || predictionMap[key].length < 2) {
            if (!predictionMap[key]) {
              predictionMap[key] = [];
            }
            predictionMap[key].push(word);
            // Break out of both loops
            row = 3;
            break;
          }
        }
      }
    });
  }

  return predictionMap;
};

// Function to generate utterance predictions based on current input
export const generateUtterancePredictions = async (text) => {
  // Initialize an empty map for predictions
  const predictionMap = {};

  // Remove hardcoded mock data - use real predictions only

  // Get predictions from the model with backoff strategy
  const predictions = await generateUtterancePredictionsWithBackoff(text, 8);

  if (!predictions || predictions.length === 0) {
    // Fallback to basic predictions if the model returns nothing
    predictionMap['0-8'] = ['I am']; // Above 'i'
    predictionMap['0-0'] = ['Thank you']; // Above 'q'
    predictionMap['1-7'] = ['How are you']; // Above 'k'
    predictionMap['1-2'] = ['Can you help me']; // Above 'd'
    predictionMap['2-6'] = ['What time is it']; // Above 'm'
    predictionMap['2-2'] = ['I need to']; // Above 'c'
    return predictionMap;
  }

  // Position each utterance prediction above the first letter of the sentence
  predictions.forEach((utterance, index) => {
    if (index >= 8) return; // Limit to 8 predictions max

    // Get the first letter of the utterance
    const firstLetter = utterance.charAt(0).toLowerCase();
    const position = findLetterPosition(firstLetter);

    if (position) {
      const key = `${position.row}-${position.col}`;

      // If this position is already taken, try to find an alternative nearby
      if (predictionMap[key]) {
        // Try adjacent positions in the same row
        const row = position.row;
        const maxCols = row === 0 ? 10 : 9;

        for (let offset = 1; offset < maxCols; offset++) {
          // Try right first
          let newCol = position.col + offset;
          if (newCol < maxCols) {
            const newKey = `${row}-${newCol}`;
            if (!predictionMap[newKey]) {
              predictionMap[newKey] = [utterance];
              return;
            }
          }

          // Then try left
          newCol = position.col - offset;
          if (newCol >= 0) {
            const newKey = `${row}-${newCol}`;
            if (!predictionMap[newKey]) {
              predictionMap[newKey] = [utterance];
              return;
            }
          }
        }

        // If no space in the same row, try other rows
        for (let rowOffset = 1; rowOffset <= 2; rowOffset++) {
          for (let direction of [-1, 1]) {
            const newRow = row + (direction * rowOffset);
            if (newRow >= 0 && newRow < 3) {
              const newMaxCols = newRow === 0 ? 10 : 9;
              if (position.col < newMaxCols) {
                const newKey = `${newRow}-${position.col}`;
                if (!predictionMap[newKey]) {
                  predictionMap[newKey] = [utterance];
                  return;
                }
              }
            }
          }
        }
      } else {
        // Position is free, use it
        predictionMap[key] = [utterance];
      }
    } else {
      // If we can't find the first letter, use fallback positions
      const fallbackPositions = [
        '0-0', '0-2', '0-4', '0-6', '0-8', // First row
        '1-0', '1-2', '1-4', '1-6', '1-8', // Second row
        '2-0', '2-2', '2-4', '2-6', '2-8'  // Third row
      ];

      for (const fallbackKey of fallbackPositions) {
        if (!predictionMap[fallbackKey]) {
          predictionMap[fallbackKey] = [utterance];
          break;
        }
      }
    }
  });

  // Ensure we have at least some predictions if the above logic didn't work
  if (Object.keys(predictionMap).length === 0) {
    predictionMap['0-8'] = ['I am']; // Above 'i'
    predictionMap['0-0'] = ['Thank you']; // Above 'q'
    predictionMap['1-7'] = ['How are you']; // Above 'k'
  }

  return predictionMap;
};
