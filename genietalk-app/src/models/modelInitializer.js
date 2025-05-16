// Model initializer for prediction models (PPM or Imagineville API)
import ppmModel from './ppm';
import imaginvilleClient from './imagineville';
import { combinedTrainingText } from '../data/trainingData';
import { usePPMModel, useImaginvilleAPI } from '../config/appConfig';

// Function to initialize the appropriate model based on configuration
export const initializeModel = () => {
  // Check which model to use based on configuration
  if (usePPMModel()) {
    console.log('Initializing PPM language model...');

    try {
      // Initialize the model with the combined training text
      ppmModel.initialize(combinedTrainingText);

      // Enable exclusion mechanism for better predictions
      // This is beneficial once the model has been trained with sufficient data
      if (ppmModel.model) {
        ppmModel.model.useExclusion_ = true;
      }

      console.log('PPM language model initialized successfully.');
      return true;
    } catch (error) {
      console.error('Error initializing PPM language model:', error);
      return false;
    }
  } else if (useImaginvilleAPI()) {
    console.log('Initializing Imagineville API client...');

    try {
      // Initialize the Imagineville API client
      imaginvilleClient.initialize();

      console.log('Imagineville API client initialized successfully.');
      return true;
    } catch (error) {
      console.error('Error initializing Imagineville API client:', error);
      return false;
    }
  } else {
    console.error('No valid prediction model specified in configuration');
    return false;
  }
};

// Function to add a new utterance to the model
export const addUtteranceToModel = (utterance) => {
  try {
    if (usePPMModel()) {
      ppmModel.addUtterance(utterance);
    } else if (useImaginvilleAPI()) {
      imaginvilleClient.addUtterance(utterance);
    }
    return true;
  } catch (error) {
    console.error('Error adding utterance to model:', error);
    return false;
  }
};

// Function to get word predictions from the model
export const getWordPredictionsFromModel = async (currentInput, maxPredictions = 5) => {
  try {
    if (usePPMModel()) {
      return ppmModel.getWordPredictions(currentInput, maxPredictions);
    } else if (useImaginvilleAPI()) {
      return await imaginvilleClient.getWordPredictions(currentInput, maxPredictions);
    }
    return [];
  } catch (error) {
    console.error('Error getting word predictions from model:', error);
    return [];
  }
};

// Function to get utterance predictions from the model
export const getUtterancePredictionsFromModel = async (currentInput, maxPredictions = 3) => {
  try {
    if (usePPMModel()) {
      return ppmModel.getUtterancePredictions(currentInput, maxPredictions);
    } else if (useImaginvilleAPI()) {
      return await imaginvilleClient.getUtterancePredictions(currentInput, maxPredictions);
    }
    return [];
  } catch (error) {
    console.error('Error getting utterance predictions from model:', error);
    return [];
  }
};

// Function to generate word predictions with backoff strategy
export const generateWordPredictionsWithBackoff = async (currentInput, currentWord, maxPredictions = 5) => {
  // Try to get predictions from the model first
  const modelPredictions = await getWordPredictionsFromModel(currentWord || currentInput, maxPredictions);

  // If we have predictions from the model, use them
  if (modelPredictions && modelPredictions.length > 0) {
    return modelPredictions;
  }

  // Otherwise, fall back to a simpler approach (e.g., frequency-based)
  // This could be expanded with more sophisticated backoff strategies
  const commonWords = [
    'the', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by',
    'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from'
  ];

  if (!currentWord) {
    return commonWords.slice(0, maxPredictions);
  }

  const lowerCurrentWord = currentWord.toLowerCase();
  const matchingWords = commonWords
    .filter(word => word.startsWith(lowerCurrentWord) && word !== lowerCurrentWord)
    .slice(0, maxPredictions);

  return matchingWords.length > 0 ? matchingWords : commonWords.slice(0, maxPredictions);
};

// Function to generate utterance predictions with backoff strategy
export const generateUtterancePredictionsWithBackoff = async (currentInput, maxPredictions = 3) => {
  // Try to get predictions from the model first
  const modelPredictions = await getUtterancePredictionsFromModel(currentInput, maxPredictions);

  // If we have predictions from the model, use them
  if (modelPredictions && modelPredictions.length > 0) {
    return modelPredictions;
  }

  // Otherwise, fall back to a simpler approach
  const commonUtterances = [
    'I am',
    'Thank you',
    'How are you',
    'I need to',
    'Can you help me',
    'What time is it',
    'I would like to',
    'Please let me know'
  ];

  if (!currentInput) {
    return commonUtterances.slice(0, maxPredictions);
  }

  const lowerInput = currentInput.toLowerCase();
  const matchingUtterances = commonUtterances
    .filter(utterance => {
      const lowerUtterance = utterance.toLowerCase();
      return lowerUtterance.startsWith(lowerInput) ||
             lowerUtterance.includes(' ' + lowerInput.split(' ').pop());
    })
    .slice(0, maxPredictions);

  return matchingUtterances.length > 0 ? matchingUtterances : commonUtterances.slice(0, maxPredictions);
};

// Export a function to save the model state (for future implementation)
export const saveModelState = () => {
  // This would serialize the model state to localStorage or a server
  // For now, just a placeholder
  if (usePPMModel()) {
    console.log('PPM model state saving functionality to be implemented');
    // In a real implementation, we would save the PPM model state
  } else {
    console.log('No state to save for Imagineville API');
  }
};

// Export a function to load the model state (for future implementation)
export const loadModelState = () => {
  // This would load a serialized model state from localStorage or a server
  // For now, just a placeholder
  if (usePPMModel()) {
    console.log('PPM model state loading functionality to be implemented');
    // In a real implementation, we would load the PPM model state
  } else {
    console.log('No state to load for Imagineville API');
  }
  return false;
};
