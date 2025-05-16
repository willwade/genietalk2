import React from 'react';
import '../styles/KeyboardRow.css';

const KeyboardRow = ({ keys, onKeyPress }) => {
  return (
    <div className="keyboard-row">
      {keys.map((key, index) => (
        <button 
          key={`key-${key}-${index}`} 
          className="key" 
          onClick={() => onKeyPress(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default KeyboardRow;
