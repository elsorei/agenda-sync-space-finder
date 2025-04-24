
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grab, Hand } from "lucide-react";

interface AnimatedCursorProps {
  color?: string;
  size?: number;
  delay?: number;
}

const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ 
  color = "#9b87f5", 
  size = 32, 
  delay = 0.1 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isOverEvent, setIsOverEvent] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    // Handle event interactions
    const handleMouseDown = () => {
      if (isOverEvent) setIsGrabbing(true);
    };
    
    const handleMouseUp = () => setIsGrabbing(false);

    // Check if mouse is over an event
    const handleElementCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsOverEvent(target.closest('.event-container') !== null);
    };

    window.addEventListener('mousemove', (e) => {
      updatePosition(e);
      handleElementCheck(e);
    });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Inizialmente imposta a visibile dopo un piccolo ritardo
    const timeout = setTimeout(() => setVisible(true), 500);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      clearTimeout(timeout);
    };
  }, [isOverEvent]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center"
      animate={{
        x: position.x - size / 2,
        y: position.y - size / 2,
        opacity: visible ? 1 : 0,
        scale: visible ? (isGrabbing ? 0.9 : 1) : 0.8,
      }}
      transition={{ duration: delay, ease: "easeOut" }}
      style={{ 
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: `${color}10`, // Colore molto trasparente
        border: `2px solid ${color}`,
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    >
      {isOverEvent && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotate: isGrabbing ? 0 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {isGrabbing ? (
            <Grab size={16} color={color} />
          ) : (
            <Hand size={16} color={color} />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedCursor;

