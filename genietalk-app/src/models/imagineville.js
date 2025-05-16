// Imagineville API client for word and utterance predictions

/**
 * Imagineville API client for text predictions
 */
class ImaginvilleClient {
  constructor() {
    this.baseUrl = 'https://api.imagineville.org';
    this.initialized = false;
  }

  /**
   * Initialize the API client
   */
  initialize() {
    console.log('Initializing Imagineville API client...');
    this.initialized = true;
    return true;
  }

  /**
   * Get word predictions from the Imagineville API
   * @param {string} currentInput - The current input text
   * @param {number} maxPredictions - Maximum number of predictions to return
   * @returns {Promise<string[]>} - Array of predicted words
   */
  async getWordPredictions(currentInput, maxPredictions = 5) {
    if (!this.initialized) {
      console.warn('Imagineville API client not initialized');
      return [];
    }

    try {
      // Extract the last word as the prefix if there are spaces
      const words = currentInput.trim().split(' ');
      const prefix = words.length > 1 ? words[words.length - 1] : currentInput;
      const left = words.length > 1 ? words.slice(0, -1).join(' ') : '';

      // Build the URL with query parameters
      const url = new URL(`${this.baseUrl}/word/predict`);
      url.searchParams.append('num', maxPredictions.toString());
      
      if (left) {
        url.searchParams.append('left', left);
      }
      
      if (prefix) {
        url.searchParams.append('prefix', prefix);
      }
      
      // Make the API request
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.words || [];
    } catch (error) {
      console.error('Error fetching word predictions from Imagineville API:', error);
      return [];
    }
  }

  /**
   * Get utterance predictions based on current input
   * @param {string} currentInput - The current input text
   * @param {number} maxPredictions - Maximum number of predictions to return
   * @returns {Promise<string[]>} - Array of predicted utterances
   */
  async getUtterancePredictions(currentInput, maxPredictions = 3) {
    if (!this.initialized) {
      console.warn('Imagineville API client not initialized');
      return [];
    }

    try {
      // For utterance predictions, we'll use a combination of word predictions
      // and add common sentence starters
      const wordPredictions = await this.getWordPredictions(currentInput, maxPredictions);
      
      // Convert word predictions to utterance predictions by adding context
      const utterancePredictions = wordPredictions.map(word => {
        // If the current input ends with a space, add the word
        if (currentInput.endsWith(' ')) {
          return `${currentInput}${word}`;
        }
        
        // If the current input has spaces, replace the last word
        const words = currentInput.trim().split(' ');
        if (words.length > 1) {
          return `${words.slice(0, -1).join(' ')} ${word}`;
        }
        
        // Otherwise, just return the word
        return word;
      });
      
      return utterancePredictions;
    } catch (error) {
      console.error('Error generating utterance predictions from Imagineville API:', error);
      return [];
    }
  }

  /**
   * Add an utterance to the history (no-op for API client, but kept for interface compatibility)
   * @param {string} utterance - The utterance to add
   * @returns {boolean} - Success status
   */
  addUtterance(utterance) {
    // This is a no-op for the API client since we can't update the remote model
    // But we keep this method for interface compatibility with the PPM model
    return true;
  }
}

// Create and export a singleton instance
const imaginvilleClient = new ImaginvilleClient();
export default imaginvilleClient;
