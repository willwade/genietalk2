// Application configuration utilities

/**
 * Default configuration values
 */
const defaultConfig = {
  // Default to using the PPM model
  predictionModel: 'ppm',
  // Other configuration options can be added here
};

/**
 * Get the application configuration
 * This reads from package.json and merges with default values
 * @returns {Object} The application configuration
 */
export const getAppConfig = () => {
  try {
    // In a real implementation, this would dynamically import the package.json
    // However, for simplicity and to avoid build issues, we'll use a global variable
    // that will be set during initialization
    
    // If window.__GENIETALK_CONFIG__ exists, use it
    if (typeof window !== 'undefined' && window.__GENIETALK_CONFIG__) {
      return {
        ...defaultConfig,
        ...window.__GENIETALK_CONFIG__
      };
    }
    
    return defaultConfig;
  } catch (error) {
    console.error('Error loading configuration:', error);
    return defaultConfig;
  }
};

/**
 * Get the prediction model type from configuration
 * @returns {string} 'ppm' or 'api'
 */
export const getPredictionModelType = () => {
  const config = getAppConfig();
  return config.predictionModel || defaultConfig.predictionModel;
};

/**
 * Check if the PPM model should be used
 * @returns {boolean} True if PPM model should be used
 */
export const usePPMModel = () => {
  return getPredictionModelType() === 'ppm';
};

/**
 * Check if the Imagineville API should be used
 * @returns {boolean} True if Imagineville API should be used
 */
export const useImaginvilleAPI = () => {
  return getPredictionModelType() === 'api';
};
