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
    console.log('Imagineville getUtterancePredictions called with:', currentInput);

    if (!this.initialized) {
      console.warn('Imagineville API client not initialized');
      return [];
    }

    try {
      // For empty input, provide common sentence starters
      if (!currentInput || currentInput.trim() === '') {
        const commonStarters = [
          'I am',
          'I need',
          'I want',
          'I would like',
          'Can you',
          'How are',
          'Thank you',
          'Please help'
        ];
        return commonStarters.slice(0, maxPredictions);
      }

      // Handle specific common sentence patterns
      const trimmedInput = currentInput.trim().toLowerCase();
      const sentenceCompletions = this.getCommonSentenceCompletions(trimmedInput);

      if (sentenceCompletions.length > 0) {
        console.log('Using common sentence completions:', sentenceCompletions);
        return sentenceCompletions.slice(0, maxPredictions);
      }

      // Get word predictions to build sentence completions
      const wordPredictions = await this.getWordPredictions(currentInput, maxPredictions * 3);
      console.log('Word predictions from API:', wordPredictions);

      if (!wordPredictions || wordPredictions.length === 0) {
        console.log('No word predictions from API, using fallback completions');
        return this.getFallbackCompletions(currentInput, maxPredictions);
      }

      // Convert word predictions to utterance predictions by building longer phrases
      const utterancePredictions = [];

      for (const word of wordPredictions) {
        let utterance;

        // If the current input ends with a space, add the word and try to extend
        if (currentInput.endsWith(' ')) {
          utterance = `${currentInput}${word}`;
          // Try to get additional words to make a more complete phrase
          const extendedPredictions = await this.getWordPredictions(utterance, 2);
          if (extendedPredictions && extendedPredictions.length > 0) {
            utterance = `${utterance} ${extendedPredictions[0]}`;
          }
        } else {
          // If the current input has spaces, replace the last word and extend
          const words = currentInput.trim().split(' ');
          if (words.length > 1) {
            const basePhrase = words.slice(0, -1).join(' ');
            utterance = `${basePhrase} ${word}`;
            // Try to extend the phrase
            const extendedPredictions = await this.getWordPredictions(utterance, 2);
            if (extendedPredictions && extendedPredictions.length > 0) {
              utterance = `${utterance} ${extendedPredictions[0]}`;
            }
          } else {
            // For single words, try to build a complete phrase
            utterance = word;
            const extendedPredictions = await this.getWordPredictions(utterance, 3);
            if (extendedPredictions && extendedPredictions.length > 1) {
              utterance = `${utterance} ${extendedPredictions[0]} ${extendedPredictions[1]}`;
            }
          }
        }

        // Only add if it's different from what we already have and is meaningful
        if (!utterancePredictions.includes(utterance) && utterance.trim().split(' ').length >= 2) {
          utterancePredictions.push(utterance);
        }

        // Stop when we have enough predictions
        if (utterancePredictions.length >= maxPredictions) {
          break;
        }
      }

      console.log('Generated utterance predictions:', utterancePredictions);
      return utterancePredictions.length > 0 ? utterancePredictions : this.getFallbackCompletions(currentInput, maxPredictions);
    } catch (error) {
      console.error('Error generating utterance predictions from Imagineville API:', error);
      return this.getFallbackCompletions(currentInput, maxPredictions);
    }
  }

  /**
   * Get common sentence completions for known patterns
   * @param {string} input - The input text (lowercase)
   * @returns {string[]} - Array of completions
   */
  getCommonSentenceCompletions(input) {
    const completions = {
      'how are': ['you doing?', 'you feeling?', 'you today?'],
      'how is': ['it going?', 'everything?', 'your day?'],
      'what are': ['you doing?', 'you thinking?', 'you planning?'],
      'what is': ['your name?', 'the time?', 'happening?'],
      'where are': ['you going?', 'you from?', 'you now?'],
      'where is': ['the bathroom?', 'my phone?', 'the exit?'],
      'when are': ['you coming?', 'we leaving?', 'you free?'],
      'when is': ['the meeting?', 'dinner ready?', 'your birthday?'],
      'why are': ['you here?', 'you sad?', 'you leaving?'],
      'why is': ['this happening?', 'it broken?', 'it important?'],
      'i am': ['fine thank you', 'doing well', 'feeling good'],
      'i need': ['to go', 'some help', 'to rest'],
      'i want': ['to eat', 'to sleep', 'to go home'],
      'i would': ['like to', 'prefer to', 'rather not'],
      'can you': ['help me?', 'please come?', 'do this?'],
      'could you': ['help me?', 'please come?', 'do this?'],
      'will you': ['help me?', 'come with me?', 'be there?'],
      'do you': ['understand?', 'know how?', 'have time?'],
      'thank you': ['very much', 'for helping', 'so much'],
      'please help': ['me with this', 'me understand', 'me find']
    };

    for (const [pattern, options] of Object.entries(completions)) {
      if (input.startsWith(pattern)) {
        // Return just the completion part, not the full sentence
        return options;
      }
    }

    return [];
  }

  /**
   * Get fallback completions when API fails
   * @param {string} currentInput - The current input
   * @param {number} maxPredictions - Maximum predictions to return
   * @returns {string[]} - Array of fallback completions
   */
  getFallbackCompletions(currentInput, maxPredictions) {
    const fallbacks = [
      'I am fine',
      'Thank you very much',
      'Can you help me?',
      'How are you doing?',
      'I need some help',
      'What time is it?'
    ];

    if (!currentInput || currentInput.trim() === '') {
      return fallbacks.slice(0, maxPredictions);
    }

    // Try to find relevant fallbacks
    const lowerInput = currentInput.toLowerCase();
    const relevantFallbacks = fallbacks.filter(fallback =>
      fallback.toLowerCase().includes(lowerInput) ||
      lowerInput.split(' ').some(word => fallback.toLowerCase().includes(word))
    );

    return relevantFallbacks.length > 0
      ? relevantFallbacks.slice(0, maxPredictions)
      : fallbacks.slice(0, maxPredictions);
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
