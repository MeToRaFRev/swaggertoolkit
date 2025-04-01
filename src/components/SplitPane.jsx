import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';

export default function SplitPane({ children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(300);
  const splitPaneRef = React.useRef(null);

  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (isDragging && splitPaneRef.current) {
        const splitPaneRect = splitPaneRef.current.getBoundingClientRect();
        const newWidth = e.clientX - splitPaneRect.left;
        // Ensure minimum widths
        if (newWidth >= 200 && newWidth <= splitPaneRect.width - 200) {
          setLeftWidth(newWidth);
        }
      }
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDragging);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopDragging);
    };
  }, [isDragging, onMouseMove, stopDragging]);

  const [left, right] = React.Children.toArray(children);

  return (
    <Box
      ref={splitPaneRef}
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      <Box
        sx={{
          width: leftWidth,
          minWidth: 200,
          maxWidth: '50%'
        }}
      >
        {left}
      </Box>

      <Box
        onMouseDown={startDragging}
        sx={{
          width: '4px', // equivalent to Tailwind's w-1 (approx. 4px)
          backgroundColor: isDragging ? '#60a5fa' : '#e5e7eb', // blue-400 when dragging, gray-200 otherwise
          cursor: 'col-resize',
          position: 'relative',
          '&:hover': {
            backgroundColor: '#60a5fa'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-8px',
            right: 0,
            cursor: 'col-resize'
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 200
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
