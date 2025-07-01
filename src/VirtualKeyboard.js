import React, { useState } from 'react';
import './VirtualKeyboard.css';

function VirtualKeyboard({ onClose }) {
  const [shift, setShift] = useState(false);

  const row1 = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  const row2 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
  const row3 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  const row4 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
  const bottomRow = ['Ctrl', 'Alt', 'Space', 'Shift', 'Backspace'];

  const shiftMap = {
    '`': '~',
    1: '!',
    2: '@',
    3: '#',
    4: '$',
    5: '%',
    6: '^',
    7: '&',
    8: '*',
    9: '(',
    0: ')',
    '-': '_',
    '=': '+',
    '[': '{',
    ']': '}',
    '\\': '|',
    ';': ':',
    "'": '"',
    ',': '<',
    '.': '>',
    '/': '?',
  };

  const insertToActiveElement = (value) => {
    const el = document.activeElement;
    if (!el) return;

    const isTextInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';

    if (isTextInput) {
      try {
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? start;
        el.setRangeText(value, start, end, 'end');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        el.value += value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // refocus in case the element was re-rendered
      setTimeout(() => el.focus(), 0);
    } else if (el.isContentEditable) {
      try {
        document.execCommand('insertText', false, value);
      } catch (_) {
        // fallback for browsers that don't support execCommand
        const selection = window.getSelection();
        if (selection) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(value));
          range.collapse(false);
        }
      }
      setTimeout(() => el.focus(), 0);
    }
  };

  const handleBackspace = () => {
    const el = document.activeElement;
    if (!el) return;
    const isTextInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';

    if (isTextInput) {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      const targetStart = start === end ? Math.max(start - 1, 0) : start;
      try {
        el.setRangeText('', targetStart, end, 'end');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (_) {
        // fallback
        const value = el.value;
        el.value = value.substring(0, targetStart) + value.substring(end);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setTimeout(() => el.focus(), 0);
    } else if (el.isContentEditable) {
      document.execCommand('delete');
      setTimeout(() => el.focus(), 0);
    }
  };

  const handleClick = (key) => {
    if (key === 'Shift') {
      setShift((s) => !s);
      return;
    }

    if (key === 'Backspace') {
      handleBackspace();
      return;
    }

    if (key === 'Ctrl' || key === 'Alt') {
      return;
    }

    let value = key;
    if (key === 'Space') {
      value = ' ';
    } else if (shift) {
      value = shiftMap[key] || (key.length === 1 ? key.toUpperCase() : key);
    }

    insertToActiveElement(value);

    if (shift && key !== 'Shift') {
      setShift(false);
    }
  };

  const preventFocus = (e) => {
    e.preventDefault();
  };

  return (
    <div className='virtualKeyboard'>
      {[row1, row2, row3, row4].map((row, rowIndex) => (
        <div key={rowIndex} className={`virtualKeyboard__row virtualKeyboard__row--${rowIndex}`}>
          {row.map((key) => (
            <button
              key={key}
              type='button'
              className={`virtualKeyboard__key${
                key === 'Shift' && shift ? ' virtualKeyboard__key--active' : ''
              }`}
              onMouseDown={preventFocus}
              onClick={() => handleClick(key)}
            >
              {shift && shiftMap[key]
                ? shiftMap[key]
                : shift && /^[a-z]$/.test(key)
                ? key.toUpperCase()
                : key}
            </button>
          ))}
        </div>
      ))}
      <div className='virtualKeyboard__row virtualKeyboard__row--bottom'>
        {bottomRow.map((key) => (
          <button
            key={key}
            type='button'
            className={`virtualKeyboard__key${
              key === 'Space'
                ? ' virtualKeyboard__space'
                : key === 'Backspace'
                ? ' virtualKeyboard__close'
                : ''
            }${key === 'Shift' && shift ? ' virtualKeyboard__key--active' : ''}`}
            onMouseDown={preventFocus}
            onClick={() => (key === 'Space' ? handleClick('Space') : handleClick(key))}
          >
            {key}
          </button>
        ))}
      </div>
      <button
        type='button'
        className='virtualKeyboard__closeBtn'
        onMouseDown={preventFocus}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

export default VirtualKeyboard;
