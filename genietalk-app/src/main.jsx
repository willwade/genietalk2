import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Load configuration from package.json
// In a real production app, this would be done differently
// but for simplicity, we'll use this approach
import packageJson from '../package.json';

// Set the configuration in a global variable for the config module to access
window.__GENIETALK_CONFIG__ = packageJson.genietalkConfig || { predictionModel: 'ppm' };

// Log the configuration
console.log('GenieTalk configuration:', window.__GENIETALK_CONFIG__);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
