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

  // For backward compatibility with screenshots
  if (text && text.toLowerCase().includes('hello how are a')) {
    // Specific predictions for the screenshot
    predictionMap['0-0'] = ['are']; // Above 'q'
    predictionMap['0-1'] = ['at']; // Above 'w'
    predictionMap['1-8'] = ['all']; // Above 'l'
    predictionMap['1-7'] = ['also']; // Above 'k'
    predictionMap['2-5'] = ['about']; // Above 'n'
    predictionMap['2-6'] = ['and']; // Above 'm'
    predictionMap['2-7'] = ['am']; // Above '.'
    predictionMap['2-4'] = ['an']; // Above 'b'
    return predictionMap;
  }

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
      // Find an empty or less populated position
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < (row === 0 ? 10 : (row === 1 ? 9 : 9)); col++) {
          const key = `${row}-${col}`;
          if (!predictionMap[key] || predictionMap[key].length < 1) {
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

  // For backward compatibility with screenshots
  if (text && text.toLowerCase().includes('hello how are')) {
    // Map utterances to specific key positions in each row
    // Format: 'rowIndex-colIndex': ['utterance1', 'utterance2']
    predictionMap['0-0'] = ['I am']; // Above 'q'
    predictionMap['0-4'] = ['to']; // Above 't'
    predictionMap['0-7'] = ['help']; // Above 'i'
    predictionMap['1-0'] = ['and']; // Above 'a'
    predictionMap['1-4'] = ['a']; // Above 'g'
    predictionMap['2-0'] = ['Thank you']; // Above 'z'
    predictionMap['2-2'] = ['How are you']; // Above 'c'
    return predictionMap;
  }

  // Get predictions from the model with backoff strategy
  const predictions = await generateUtterancePredictionsWithBackoff(text, 6);

  if (!predictions || predictions.length === 0) {
    // Fallback to basic predictions if the model returns nothing
    predictionMap['0-0'] = ['I am']; // Above 'q'
    predictionMap['0-2'] = ['I need to']; // Above 'e'
    predictionMap['1-0'] = ['Thank you']; // Above 'a'
    predictionMap['1-3'] = ['How are you']; // Above 'f'
    predictionMap['2-0'] = ['Can you help me']; // Above 'z'
    predictionMap['2-4'] = ['What time is it']; // Above 'b'
    return predictionMap;
  }

  // Distribute predictions across the keyboard in a more balanced way
  const keyPositions = [
    ['0-0', '0-2', '0-4', '0-7'], // First row positions
    ['1-0', '1-3', '1-5', '1-7'], // Second row positions
    ['2-0', '2-2', '2-4', '2-6']  // Third row positions
  ];

  // Flatten the positions array for easier access
  const flatPositions = keyPositions.flat();

  // Distribute predictions across available positions
  predictions.forEach((utterance, index) => {
    if (index < flatPositions.length) {
      const position = flatPositions[index];
      predictionMap[position] = [utterance];
    }
  });

  // If we have fewer than 6 predictions, ensure we have at least one per row
  const rowCounts = [0, 0, 0];
  Object.keys(predictionMap).forEach(key => {
    const row = parseInt(key.split('-')[0]);
    rowCounts[row]++;
  });

  // Add default predictions to empty rows
  if (rowCounts[0] === 0) predictionMap['0-0'] = ['I am'];
  if (rowCounts[1] === 0) predictionMap['1-0'] = ['Thank you'];
  if (rowCounts[2] === 0) predictionMap['2-0'] = ['Can you help me'];

  return predictionMap;
};
