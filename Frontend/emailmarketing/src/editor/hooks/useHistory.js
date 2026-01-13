import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing undo/redo history
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum history size (default: 50)
 * @returns {object} - { state, setState, undo, redo, canUndo, canRedo, clearHistory }
 */
export const useHistory = (initialState, maxHistory = 50) => {
    const [state, setStateInternal] = useState(initialState);
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Set state and add to history
    const setState = useCallback((newState) => {
        setStateInternal(newState);

        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, currentIndex + 1);

        // Add new state to history
        newHistory.push(newState);

        // Limit history size
        if (newHistory.length > maxHistory) {
            newHistory.shift();
        } else {
            setCurrentIndex(currentIndex + 1);
        }

        setHistory(newHistory);
    }, [history, currentIndex, maxHistory]);

    // Undo
    const undo = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setStateInternal(history[newIndex]);
        }
    }, [currentIndex, history]);

    // Redo
    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setStateInternal(history[newIndex]);
        }
    }, [currentIndex, history]);

    // Check if can undo/redo
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    // Clear history
    const clearHistory = useCallback(() => {
        setHistory([state]);
        setCurrentIndex(0);
    }, [state]);

    return {
        state,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory
    };
};
