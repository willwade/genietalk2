import React, { useRef, useEffect } from 'react';
import '../styles/UtteranceBar.css';

const UtteranceBar = ({ text, cursorPosition, setCursorPosition }) => {
  const utteranceRef = useRef(null);
  
  // Handle cursor positioning
  useEffect(() => {
    if (utteranceRef.current) {
      // Create a range to position the cursor
      const range = document.createRange();
      const selection = window.getSelection();
      
      // Find the text node
      const textNode = Array.from(utteranceRef.current.childNodes)
        .find(node => node.nodeType === Node.TEXT_NODE);
      
      if (textNode) {
        // Set the cursor position
        const offset = Math.min(cursorPosition, textNode.length);
        range.setStart(textNode, offset);
        range.setEnd(textNode, offset);
        
        // Apply the selection
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [cursorPosition, text]);
  
  const handleClick = (e) => {
    if (utteranceRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          setCursorPosition(range.startOffset);
        }
      }
    }
  };

  return (
    <div className="utterance-container">
      <div 
        className="utterance-bar" 
        ref={utteranceRef}
        contentEditable
        suppressContentEditableWarning
        onClick={handleClick}
        onKeyDown={(e) => e.preventDefault()} // Prevent direct editing
      >
        {text}
      </div>
      <div className="utterance-cursor" style={{ left: `${cursorPosition * 8}px` }}></div>
    </div>
  );
};

export default UtteranceBar;
