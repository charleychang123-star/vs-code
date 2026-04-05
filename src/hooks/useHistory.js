import { useReducer, useCallback, useEffect, useRef } from 'react';

const MAX = 30;
const DEBOUNCE_MS = 400;

function reducer(state, action) {
  const { history, cursor } = state;
  switch (action.type) {
    case 'PUSH': {
      // Collapse if same key changed within debounce window
      const last = history[cursor];
      const now  = action.timestamp;
      if (
        action.key &&
        state.lastKey === action.key &&
        now - state.lastTs < DEBOUNCE_MS &&
        cursor === history.length - 1
      ) {
        // Replace last entry instead of appending
        const next = history.slice(0, cursor);
        next.push(action.payload);
        return { history: next, cursor: next.length - 1, lastKey: action.key, lastTs: now };
      }
      const next = history.slice(0, cursor + 1);
      next.push(action.payload);
      if (next.length > MAX) next.shift();
      return { history: next, cursor: next.length - 1, lastKey: action.key, lastTs: now };
    }
    case 'UNDO':
      return cursor > 0 ? { ...state, cursor: cursor - 1, lastKey: null } : state;
    case 'REDO':
      return cursor < history.length - 1 ? { ...state, cursor: cursor + 1, lastKey: null } : state;
    default:
      return state;
  }
}

export function useHistory(initial) {
  const [state, dispatch] = useReducer(reducer, {
    history: [initial],
    cursor: 0,
    lastKey: null,
    lastTs: 0,
  });

  const params = state.history[state.cursor];

  const updateGlobal = useCallback((key, value) => {
    const current = state.history[state.cursor];
    const next = { ...current, [key]: value };
    dispatch({ type: 'PUSH', payload: next, key, timestamp: Date.now() });
  }, [state.history, state.cursor]);

  const updateShape = useCallback((shapeKey, field, value) => {
    const current = state.history[state.cursor];
    const next = {
      ...current,
      shapes: {
        ...current.shapes,
        [shapeKey]: { ...current.shapes[shapeKey], [field]: value },
      },
    };
    dispatch({ type: 'PUSH', payload: next, key: `shape_${shapeKey}_${field}`, timestamp: Date.now() });
  }, [state.history, state.cursor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return {
    params,
    updateGlobal,
    updateShape,
    undo:     () => dispatch({ type: 'UNDO' }),
    redo:     () => dispatch({ type: 'REDO' }),
    canUndo:  state.cursor > 0,
    canRedo:  state.cursor < state.history.length - 1,
  };
}
