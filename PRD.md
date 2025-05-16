# GenieTalk Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose
GenieTalk is an assistive text entry system designed to accelerate communication for users with disabilities by integrating word prediction and utterance retrieval directly into the typing workflow. The system combines a split QWERTY keyboard with contextual word and sentence prediction to help users communicate more efficiently without requiring mode switching between typing and phrase retrieval.

### 1.2 Target Users
- Primary: Users with physical disabilities that affect typing speed and efficiency
- Secondary: Users with language or cognitive impairments who benefit from prediction
- Tertiary: Any user seeking to improve typing efficiency on touchscreen devices

### 1.3 Key Objectives
1. Increase text entry speed for users with disabilities
2. Reduce cognitive load by eliminating mode switching
3. Preserve the user's authentic voice and communication style
4. Support both transactional and interactional conversation
5. Provide an intuitive interface with minimal learning curve

## 2. User Interface Specifications

### 2.1 Overall Layout

#### 2.1.1 Main Components
- **Utterance Bar**: Positioned at the top of the screen
- **Split QWERTY Keyboard**: Occupies the central and lower portion of the screen
- **Function Keys**: Positioned to the right of the keyboard
- **Prediction Areas**: Located in the spaces between keyboard rows

#### 2.1.2 Screen Dimensions and Responsiveness
- The interface should adapt to various screen sizes while maintaining the spatial relationship between keys and prediction areas
- Minimum supported screen size: 7-inch tablet
- Touch targets should be at least 44×44 pixels for accessibility

### 2.2 Keyboard Design

#### 2.2.1 Key Layout
- **Split QWERTY Configuration**: Standard QWERTY layout with three main rows of letter keys
- **Row Spacing**: Distinct spaces between keyboard rows to accommodate prediction display
- **Key Arrangement**:
  - Top row: q, w, e, r, t, y, u, i, o, p
  - Middle row: a, s, d, f, g, h, j, k, l
  - Bottom row: z, x, c, v, b, n, m, . (period), ? (question mark)
  - Space bar: Centered below the bottom row

#### 2.2.2 Key Styling
- **Key Shape**: Rounded rectangle
- **Key Color**: Light gray (#D3D3D3) for standard keys
- **Key Size**: Minimum 40×40 pixels with 5px spacing between keys
- **Key Labels**: Sans-serif font, high contrast, minimum 18pt

### 2.3 Function Keys

#### 2.3.1 Available Functions
- **Speak**: Triggers speech synthesis of the entered text
- **Stand By**: Pauses prediction functionality
- **Delete Word**: Removes the last entered word
- **Backspace**: Deletes the last entered character
- **Delete All**: Clears all entered text
- **Undo**: Reverts the last action

#### 2.3.2 Function Key Styling
- **Position**: Vertical arrangement on the right side of the keyboard
- **Visual Distinction**: Different color or shape from letter keys
- **Labeling**: Clear, high-contrast text or universally recognized icons

### 2.4 Utterance Bar

#### 2.4.1 Specifications
- **Position**: Full width at the top of the screen
- **Height**: Minimum 44px, expandable to show multiple lines of text
- **Text Styling**: Sans-serif font, minimum 16pt, high contrast
- **Cursor**: Visible blinking cursor indicating insertion point

#### 2.4.2 Functionality
- Displays text as it is being composed
- Shows selected text from predictions
- Provides visual feedback during editing
- Scrolls horizontally if text exceeds visible area

### 2.5 Prediction Display Areas

#### 2.5.1 Word Prediction Area
- **Location**: In the spaces between keyboard rows
- **Visual Styling**: Yellow rectangular boxes (#FFEB3B or similar)
- **Text Styling**: Black text (#000000) on yellow background, sans-serif font
- **Size**: Height of 30-40px, width proportional to word length

#### 2.5.2 Sentence Prediction Area
- **Location**: In the spaces between keyboard rows
- **Visual Styling**: Green rectangular boxes (#4CAF50 or similar)
- **Text Styling**: Black text (#000000) on green background, sans-serif font
- **Size**: Height of 30-40px, width proportional to sentence length, with scrolling for longer sentences

## 3. Prediction System Specifications

### 3.1 Word Prediction

#### 3.1.1 Algorithm
- Utilizes a Prediction by Partial Matching (PPM) language model
- Adapts to user's typing patterns over time
- Considers both character-level and word-level context
- Maintains a context window of recently typed characters

#### 3.1.2 Display Logic
- **Positioning**: Word predictions appear above keys the user is likely to press next
- **Example**: After typing "s", predictions like "see," "said," "she," and "some" appear above relevant keys
- **Number of Predictions**: Configurable via settings, default 3-5 predictions
- **Sorting**: Ordered by probability, with most likely predictions in most accessible positions

#### 3.1.3 Selection Mechanism
- Tapping a predicted word inserts it into the utterance bar
- Automatically adds a space after the inserted word
- Updates the prediction context based on the selected word

### 3.2 Utterance Retrieval

#### 3.2.1 Storage System
- Automatically logs all spoken utterances without explicit user action
- Maintains a database of user's historical utterances
- Indexes utterances for efficient retrieval
- Stores metadata including usage frequency and recency

#### 3.2.2 Retrieval Algorithm
- Uses a probabilistic algorithm to identify relevant historical utterances
- Considers current input context, word frequency, and recency
- Prioritizes the user's own language patterns
- Updates relevance scores based on selection behavior

#### 3.2.3 Display Logic
- **Positioning**: Retrieved utterances appear in the spaces between keyboard rows
- **Visual Coding**: Displayed in green rectangular boxes
- **Number of Retrievals**: Configurable via settings, default 2-3 utterances
- **Truncation**: Long utterances may be truncated with ellipsis (...)

#### 3.2.4 Partial Selection Mechanism
- Users can select any word within a retrieved utterance
- Selecting a word copies the preceding sequence into the utterance bar
- Example: From "I went home last night in a taxi," selecting "night" copies "I went home last night" to the utterance bar
- After selection, the user can continue typing to modify or extend the utterance

### 3.3 Prediction-UI Integration

#### 3.3.1 Keyboard-Prediction Relationship
- Predictions are positioned directly above the keys where the user might type next
- This spatial relationship reduces visual scanning and cognitive load
- Example: If the user has typed "I am" and is likely to type "going" next, the prediction "going" appears above the "g" key

#### 3.3.2 Dynamic Updates
- Predictions update in real-time as the user types
- Each keystroke triggers a recalculation of predictions
- Predictions appear with minimal latency (<100ms)
- Animation transitions may be used to reduce visual disruption

#### 3.3.3 Selection Feedback
- Visual feedback when a prediction is selected (brief highlight)
- Auditory feedback optional and configurable
- Haptic feedback optional and configurable

## 4. User Interaction Specifications

### 4.1 Text Entry Workflow

#### 4.1.1 Basic Typing
1. User taps letter keys on the keyboard
2. Letters appear in the utterance bar
3. Word predictions update with each keystroke
4. Sentence retrievals update based on the current context

#### 4.1.2 Prediction Selection
1. User views available predictions
2. Taps desired word or sentence prediction
3. Selected text is inserted into the utterance bar
4. Cursor is positioned at the end of the inserted text
5. Predictions update based on the new context

#### 4.1.3 Partial Utterance Selection
1. User views retrieved utterances (green boxes)
2. Taps a specific word within a retrieved utterance
3. System copies text from the beginning of the utterance up to and including the selected word
4. Copied text appears in the utterance bar
5. User can continue typing to modify or extend the utterance

#### 4.1.4 Text Editing
1. User can position cursor within the utterance bar
2. Delete functions (Delete Word, Backspace, Delete All) modify text as expected
3. Undo function reverts the last action
4. Predictions update based on the edited context

### 4.2 Speech Output

#### 4.2.1 Speech Synthesis
1. User composes text in the utterance bar
2. Taps the Speak function key
3. System synthesizes speech for the entered text
4. Utterance is logged for future retrieval
5. Utterance bar is cleared or maintained based on settings

### 4.3 Configuration Options

#### 4.3.1 User-Configurable Settings
- Maximum number of word predictions displayed
- Maximum number of sentence retrievals displayed
- Text size and contrast
- Speech rate and voice
- Keyboard size and spacing
- Prediction sensitivity and adaptation rate

## 5. Technical Requirements

### 5.1 Language Model

#### 5.1.1 PPM Implementation
- Implements Prediction by Partial Matching algorithm
- Supports adaptive learning from user input
- Maintains a suffix trie data structure for efficient prediction
- Configurable maximum order (context length)

#### 5.1.2 Performance Requirements
- Prediction generation in <50ms
- Memory usage optimized for mobile devices
- Efficient storage and retrieval of the language model
- Graceful degradation under resource constraints

### 5.2 Utterance Storage

#### 5.2.1 Database Requirements
- Efficient storage of user utterances
- Indexing for fast retrieval
- Persistence across sessions
- Backup and restore capabilities

#### 5.2.2 Privacy and Security
- Local storage of personal language data
- Optional encrypted storage
- User control over data retention
- Clear privacy policy regarding language data

## 6. Accessibility Requirements

### 6.1 Visual Accessibility
- High contrast mode
- Adjustable text size
- Color schemes for color-blind users
- Screen reader compatibility

### 6.2 Motor Accessibility
- Adjustable key size and spacing
- Configurable touch sensitivity
- Dwell selection option for users who cannot tap
- Switch access compatibility

### 6.3 Cognitive Accessibility
- Simplified interface option
- Reduced number of predictions for less visual clutter
- Clear, consistent visual cues
- Predictable behavior across the application

## 7. Success Metrics

### 7.1 Performance Metrics
- Text entry speed (words per minute)
- Prediction accuracy rate
- Prediction utilization rate
- Error rate and correction time

### 7.2 User Experience Metrics
- Cognitive load assessment
- User satisfaction ratings
- Learning curve measurements
- Long-term adoption rates

## 8. Future Considerations

### 8.1 Potential Enhancements
- Integration with external language models
- Cloud-based synchronization of personal language models
- Multi-language support
- Voice input for hybrid interaction
- Machine learning for improved prediction accuracy
- Customizable keyboard layouts
