import React from 'react';
import '../styles/FunctionKeys.css';

const FunctionKeys = ({ onDeleteWord, onBackspace, onDeleteAll, onSpeak }) => {
  return (
    <div className="function-keys">
      <button className="function-key" onClick={onSpeak}>
        Speak
      </button>
      <button className="function-key">
        Stand By
      </button>
      <button className="function-key" onClick={onDeleteWord}>
        Del Word
      </button>
      <button className="function-key" onClick={onBackspace}>
        ⌫
      </button>
      <button className="function-key" onClick={onDeleteAll}>
        Del All
      </button>
      <button className="function-key">
        Undo
      </button>
    </div>
  );
};

export default FunctionKeys;
