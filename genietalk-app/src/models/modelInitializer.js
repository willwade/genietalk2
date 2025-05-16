// Model initializer for the PPM language model
import languageModel from './ppm';
import { combinedTrainingText } from '../data/trainingData';

// Function to initialize the PPM model with training data
export const initializeModel = () => {
  console.log('Initializing PPM language model...');
  
  try {
    // Initialize the model with the combined training text
    languageModel.initialize(combinedTrainingText);
    
    // Enable exclusion mechanism for better predictions
    // This is beneficial once the model has been trained with sufficient data
    if (languageModel.model) {
      languageModel.model.useExclusion_ = true;
    }
    
    console.log('PPM language model initialized successfully.');
    return true;
  } catch (error) {
    console.error('Error initializing PPM language model:', error);
    return false;
  }
};

// Function to add a new utterance to the model
export const addUtteranceToModel = (utterance) => {
  try {
    languageModel.addUtterance(utterance);
    return true;
  } catch (error) {
    console.error('Error adding utterance to model:', error);
    return false;
  }
};

// Function to get word predictions from the model
export const getWordPredictionsFromModel = (currentInput, maxPredictions = 5) => {
  try {
    return languageModel.getWordPredictions(currentInput, maxPredictions);
  } catch (error) {
    console.error('Error getting word predictions from model:', error);
    return [];
  }
};

// Function to get utterance predictions from the model
export const getUtterancePredictionsFromModel = (currentInput, maxPredictions = 3) => {
  try {
    return languageModel.getUtterancePredictions(currentInput, maxPredictions);
  } catch (error) {
    console.error('Error getting utterance predictions from model:', error);
    return [];
  }
};

// Function to generate word predictions with backoff strategy
export const generateWordPredictionsWithBackoff = (currentInput, currentWord, maxPredictions = 5) => {
  // Try to get predictions from the PPM model first
  const modelPredictions = getWordPredictionsFromModel(currentWord || currentInput, maxPredictions);
  
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
export const generateUtterancePredictionsWithBackoff = (currentInput, maxPredictions = 3) => {
  // Try to get predictions from the PPM model first
  const modelPredictions = getUtterancePredictionsFromModel(currentInput, maxPredictions);
  
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
  console.log('Model state saving functionality to be implemented');
};

// Export a function to load the model state (for future implementation)
export const loadModelState = () => {
  // This would load a serialized model state from localStorage or a server
  // For now, just a placeholder
  console.log('Model state loading functionality to be implemented');
  return false;
};
