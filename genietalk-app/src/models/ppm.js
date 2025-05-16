// Import the PPM language model and vocabulary
import { PPMLanguageModel } from './ppm_language_model';
import { Vocabulary, rootSymbol } from './vocabulary';

class LanguageModelWrapper {
  constructor() {
    this.vocabulary = new Vocabulary();
    this.model = null;
    this.context = null;
    this.initialized = false;
    this.utteranceHistory = [];
  }

  // Initialize the model with training text
  initialize(trainingText) {
    // Add each character to the vocabulary
    for (let i = 0; i < trainingText.length; i++) {
      this.vocabulary.addSymbol(trainingText[i]);
    }

    // Create the model with a 5-gram context
    this.model = new PPMLanguageModel(this.vocabulary, 5);

    // Create a context for training
    this.context = this.model.createContext();

    // Train the model with the text
    for (let i = 0; i < trainingText.length; i++) {
      const symbolId = this.vocabulary.symbols_.indexOf(trainingText[i]);
      this.model.addSymbolAndUpdate(this.context, symbolId);
    }

    this.initialized = true;
  }

  // Add a new utterance to the history
  addUtterance(utterance) {
    this.utteranceHistory.push({
      text: utterance,
      timestamp: Date.now()
    });

    // Also update the language model with this utterance
    if (this.initialized) {
      const context = this.model.createContext();
      for (let i = 0; i < utterance.length; i++) {
        const symbol = utterance[i];
        // Add symbol to vocabulary if it doesn't exist
        this.vocabulary.addSymbol(symbol);
        const symbolId = this.vocabulary.symbols_.indexOf(symbol);
        this.model.addSymbolAndUpdate(context, symbolId);
      }
    }
  }

  // Get word predictions based on current input
  getWordPredictions(currentInput, maxPredictions = 5) {
    if (!this.initialized) {
      return [];
    }

    // Create a new context for prediction
    const context = this.model.createContext();

    // Add each character of the current input to the context
    for (let i = 0; i < currentInput.length; i++) {
      const symbol = currentInput[i];
      // Skip if symbol is not in vocabulary
      if (this.vocabulary.symbols_.indexOf(symbol) === -1) {
        continue;
      }
      const symbolId = this.vocabulary.symbols_.indexOf(symbol);
      this.model.addSymbolToContext(context, symbolId);
    }

    // Get probabilities for all symbols
    const probs = this.model.getProbs(context);

    // Convert probabilities to predictions
    const predictions = [];
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > 0) {
        predictions.push({
          symbol: this.vocabulary.symbols_[i],
          probability: probs[i]
        });
      }
    }

    // Sort by probability and take top N
    predictions.sort((a, b) => b.probability - a.probability);

    // Extract just the symbols
    return predictions.slice(0, maxPredictions).map(p => p.symbol);
  }

  // Get utterance predictions based on current input
  getUtterancePredictions(currentInput, maxPredictions = 3) {
    if (this.utteranceHistory.length === 0) {
      return [];
    }

    const lowerInput = currentInput.toLowerCase();

    // Find utterances that match the current input
    const matchingUtterances = this.utteranceHistory
      .filter(entry => {
        const lowerUtterance = entry.text.toLowerCase();
        // Check if the utterance starts with the current input
        // or if any word in the utterance starts with the last word of the input
        const words = lowerInput.split(' ');
        const lastWord = words[words.length - 1];

        return lowerUtterance.startsWith(lowerInput) ||
               lowerUtterance.includes(' ' + lastWord);
      })
      // Sort by recency (newest first)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxPredictions)
      .map(entry => entry.text);

    return matchingUtterances;
  }
}

// Create and export a singleton instance
const languageModel = new LanguageModelWrapper();
export default languageModel;
