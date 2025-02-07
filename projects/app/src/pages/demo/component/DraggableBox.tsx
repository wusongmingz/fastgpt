import React, { useState, useCallback } from 'react';

interface DraggableBoxProps {
  children: React.ReactNode;
}

const DraggableBox: React.FC<DraggableBoxProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
      setOffset({
        x: event.clientX - position.x,
        y: event.clientY - position.y
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        setPosition({
          x: event.clientX - offset.x,
          y: event.clientY - offset.y
        });
      }
    },
    [isDragging, offset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
};

export default DraggableBox;
