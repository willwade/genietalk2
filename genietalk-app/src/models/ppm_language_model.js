// Simplified version of the PPM language model for the web app

import { rootSymbol } from './vocabulary';

// Kneser-Ney "-like" smoothing parameters.
const knAlpha = 0.49;
const knBeta = 0.77;

// Epsilon for sanity checks.
const epsilon = 1E-10;

/**
 * Context for the PPM language model.
 */
class Context {
  constructor(head = null, order = 0) {
    this.head_ = head;
    this.order_ = order;
  }
}

/**
 * Node in a search tree, which is implemented as a suffix trie.
 */
class Node {
  constructor() {
    // Leftmost child node for the current node.
    this.child_ = null;
    // Next node.
    this.next_ = null;
    // Node in the backoff structure.
    this.backoff_ = null;
    // Frequency count for this node.
    this.count_ = 1;
    // Symbol that this node stores.
    this.symbol_ = rootSymbol;
  }

  /**
   * Finds child of the current node with a specified symbol.
   */
  findChildWithSymbol(symbol) {
    let current = this.child_;
    while (current != null) {
      if (current.symbol_ == symbol) {
        return current;
      }
      current = current.next_;
    }
    return current;
  }

  /**
   * Returns total count of all children.
   */
  totalChildrenCounts(exclusionMask) {
    let count = 0;
    let child = this.child_;
    while (child != null) {
      if (!exclusionMask || !exclusionMask[child.symbol_]) {
        count += child.count_;
      }
      child = child.next_;
    }
    return count;
  }

  /**
   * Returns number of children.
   */
  numChildren(exclusionMask) {
    let count = 0;
    let child = this.child_;
    while (child != null) {
      if (!exclusionMask || !exclusionMask[child.symbol_]) {
        count++;
      }
      child = child.next_;
    }
    return count;
  }
}

/**
 * Prediction by Partial Matching (PPM) Language Model.
 */
export class PPMLanguageModel {
  /**
   * @param {?Vocabulary} vocab Symbol vocabulary object.
   * @param {number} maxOrder Maximum length of the context.
   */
  constructor(vocab, maxOrder) {
    this.vocab_ = vocab;
    
    if (this.vocab_.size() <= 1) {
      throw new Error("Expecting at least two symbols in the vocabulary");
    }

    this.maxOrder_ = maxOrder;
    this.root_ = new Node();
    this.rootContext_ = new Context();
    this.rootContext_.head_ = this.root_;
    this.rootContext_.order_ = 0;
    this.numNodes_ = 1;

    // Exclusion mechanism: Off by default
    this.useExclusion_ = false;
  }

  /**
   * Adds symbol to the context.
   */
  addSymbolToContext(context, symbol) {
    if (context.order_ >= this.maxOrder_) {
      // Context is already at maximum order, need to back off.
      context.head_ = context.head_.backoff_;
      context.order_--;
    }

    // Find or create a node for the symbol.
    const symbolNode = this.addSymbolToNode_(context.head_, symbol);
    context.head_ = symbolNode;
    context.order_++;
    
    return context;
  }

  /**
   * Adds symbol to the context and updates the model.
   */
  addSymbolAndUpdate(context, symbol) {
    this.addSymbolToContext(context, symbol);
    
    // Update counts in the trie.
    let node = context.head_;
    while (node != this.root_) {
      node.count_++;
      node = node.backoff_;
    }
    
    return context;
  }

  /**
   * Adds symbol to the node.
   */
  addSymbolToNode_(node, symbol) {
    // Try to find an existing child with this symbol.
    let symbolNode = node.findChildWithSymbol(symbol);
    
    if (symbolNode == null) {
      // Create a new node for this symbol.
      symbolNode = new Node();
      symbolNode.symbol_ = symbol;
      
      // Add to the beginning of the children list.
      symbolNode.next_ = node.child_;
      node.child_ = symbolNode;
      
      this.numNodes_++;
      
      // Set up backoff pointer.
      if (node == this.root_) {
        // Shortest possible context.
        symbolNode.backoff_ = this.root_;
      } else {
        symbolNode.backoff_ = this.addSymbolToNode_(node.backoff_, symbol);
      }
    }
    
    return symbolNode;
  }

  /**
   * Creates new context which is initially empty.
   */
  createContext() {
    return new Context(this.rootContext_.head_, this.rootContext_.order_);
  }

  /**
   * Clones existing context.
   */
  cloneContext(context) {
    return new Context(context.head_, context.order_);
  }

  /**
   * Returns probabilities for all the symbols in the vocabulary given the context.
   */
  getProbs(context) {
    // Initialize the initial estimates.
    const numSymbols = this.vocab_.size();
    const probs = new Array(numSymbols).fill(0.0);
    
    // Create exclusion mask if needed.
    const exclusionMask = this.useExclusion_ ? new Array(numSymbols).fill(false) : null;
    
    // Estimate the probabilities for all the symbols in the supplied context.
    let totalMass = 1.0;
    let node = context.head_;
    let gamma = totalMass;
    
    while (node != null) {
      const count = node.totalChildrenCounts(exclusionMask);
      
      if (count > 0) {
        const numChildren = node.numChildren(exclusionMask);
        const denominator = count + knAlpha;
        
        // Process all children of the current node.
        let child = node.child_;
        while (child != null) {
          if (!exclusionMask || !exclusionMask[child.symbol_]) {
            const childProb = Math.max(child.count_ - knBeta, 0.0) / denominator;
            
            if (childProb > 0.0) {
              probs[child.symbol_] += gamma * childProb;
              
              // Mark as excluded if needed.
              if (this.useExclusion_) {
                exclusionMask[child.symbol_] = true;
              }
            }
          }
          child = child.next_;
        }
        
        // Calculate remaining probability mass.
        totalMass = gamma * (numChildren * knBeta + knAlpha) / denominator;
      }
      
      // Backoff to lower-order context.
      node = node.backoff_;
      gamma = totalMass;
    }
    
    // Count the total number of symbols that should have their estimates
    // blended with the uniform distribution.
    let numUnseenSymbols = 0;
    for (let i = 1; i < numSymbols; i++) {
      if (!exclusionMask || !exclusionMask[i]) {
        numUnseenSymbols++;
      }
    }
    
    // Distribute the remaining probability mass uniformly.
    if (numUnseenSymbols > 0 && totalMass > 0.0) {
      const uniformProb = totalMass / numUnseenSymbols;
      for (let i = 1; i < numSymbols; i++) {
        if (!exclusionMask || !exclusionMask[i]) {
          probs[i] += uniformProb;
        }
      }
    }
    
    return probs;
  }

  /**
   * Prints the trie to console.
   */
  printToConsole() {
    this.printToConsole_(this.root_, "");
  }
  
  /**
   * Prints the trie to console (helper method).
   */
  printToConsole_(node, indent) {
    console.log(indent + "  " + this.vocab_.symbols_[node.symbol_] +
                "(" + node.symbol_ + ") [" + node.count_ + "]");
    indent += "  ";
    let child = node.child_;
    while (child != null) {
      this.printToConsole_(child, indent);
      child = child.next_;
    }
  }
}
