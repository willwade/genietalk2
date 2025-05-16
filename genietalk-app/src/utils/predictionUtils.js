// Mock data for word predictions
const commonWords = [
  'the', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by',
  'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from',
  'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we',
  'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search',
  'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they',
  'site', 'he', 'up', 'may', 'what', 'which', 'their', 'news', 'out', 'use',
  'any', 'there', 'see', 'only', 'so', 'his', 'when', 'contact', 'here', 'business',
  'who', 'web', 'also', 'now', 'help', 'get', 'pm', 'view', 'online', 'first',
  'am', 'been', 'would', 'how', 'were', 'me', 'some', 'these', 'its', 'like',
  'said', 'she', 'could', 'people', 'my', 'over', 'than', 'date', 'has', 'just'
];

// Mock data for sentence predictions
const commonUtterances = [
  'I went home last night in a taxi',
  'How are you doing today',
  'I need to go to the store',
  'Can you help me with this',
  'What time is the meeting',
  'I would like to order a coffee',
  'Thank you for your help',
  'It was nice to meet you',
  'I will be there in a few minutes',
  'Could you please repeat that',
  'I am not feeling well today',
  'What do you think about this',
  'I need to make a phone call',
  'Can we talk about this later',
  'I am looking forward to seeing you',
  'Do you have any questions',
  'I am sorry for the inconvenience',
  'Could you please help me with this',
  'I would like to schedule an appointment',
  'What are your plans for the weekend'
];

// Store utterance history
let utteranceHistory = [...commonUtterances];

// Function to add an utterance to history
export const addUtterance = (utterance) => {
  utteranceHistory.unshift(utterance);
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
export const generateWordPredictions = (text, currentWord) => {
  // Initialize an empty map for predictions
  const predictionMap = {};

  // Check if the input matches "hello how are a" to match the screenshot
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

  if (!currentWord) {
    // If no current word, return common starting words positioned above their first letter
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

  const lowerCurrentWord = currentWord.toLowerCase();

  // Filter words that start with the current input
  const matchingWords = commonWords
    .filter(word => word.startsWith(lowerCurrentWord) && word !== lowerCurrentWord)
    .slice(0, 10);

  // Position each word above the key that would be pressed next
  matchingWords.forEach(word => {
    // Find the next letter that would be typed
    const nextLetterIndex = currentWord.length;
    if (nextLetterIndex < word.length) {
      const nextLetter = word.charAt(nextLetterIndex);
      const position = findLetterPosition(nextLetter);

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
    }
  });

  // If we have fewer than 5 total predictions, add some common next words
  const totalPredictions = Object.values(predictionMap).flat().length;
  if (totalPredictions < 5) {
    const additionalWords = commonWords
      .filter(word => !matchingWords.includes(word) && word !== lowerCurrentWord)
      .slice(0, 5 - totalPredictions);

    additionalWords.forEach(word => {
      const firstLetter = word.charAt(0).toLowerCase();
      const position = findLetterPosition(firstLetter);

      if (position) {
        const key = `${position.row}-${position.col}`;
        if (!predictionMap[key]) {
          predictionMap[key] = [];
        }

        if (predictionMap[key].length < 2) {
          predictionMap[key].push(word);
        }
      }
    });
  }

  return predictionMap;
};

// Function to generate utterance predictions based on current input
export const generateUtterancePredictions = (text) => {
  // Always show some utterance predictions, even if there's no text
  const predictionMap = {};

  // Check if the input matches "hello how are a" to match the screenshot
  if (text && text.toLowerCase().includes('hello how are a')) {
    // First row utterances (row 0)
    const firstRowUtterances = [
      'you',
      'a'
    ];

    // Add these as individual words to the first row
    predictionMap['0'] = [firstRowUtterances.join(' ')];

    // Second row utterances (row 1)
    const secondRowUtterances = [
      'all',
      'all ready now'
    ];

    // Add these to the second row
    predictionMap['1'] = secondRowUtterances;

    // Third row utterances (row 2)
    const thirdRowUtterances = [
      'and am asking how you are'
    ];

    // Add these to the third row
    predictionMap['2'] = thirdRowUtterances;

    return predictionMap;
  }

  // Default predictions if text doesn't match the specific case

  // First row utterances (row 0)
  const firstRowUtterances = [
    'I am',
    'I need to'
  ];

  // Add these to the first row
  predictionMap['0'] = firstRowUtterances;

  // Second row utterances (row 1)
  const secondRowUtterances = [
    'Thank you',
    'How are you'
  ];

  // Add these to the second row
  predictionMap['1'] = secondRowUtterances;

  // Third row utterances (row 2)
  const thirdRowUtterances = [
    'Can you help me',
    'What time is it'
  ];

  // Add these to the third row
  predictionMap['2'] = thirdRowUtterances;

  return predictionMap;
};
