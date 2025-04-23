
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Inizialmente imposta a visibile dopo un piccolo ritardo
    const timeout = setTimeout(() => setVisible(true), 500);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50"
      animate={{
        x: position.x - size / 2,
        y: position.y - size / 2,
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
      }}
      transition={{ duration: delay, ease: "easeOut" }}
      style={{ 
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: `${color}30`, // Colore semi-trasparente
        border: `2px solid ${color}`,
        mixBlendMode: "difference",
        willChange: "transform",
        boxShadow: `0 0 10px ${color}40`,
      }}
    />
  );
};

export default AnimatedCursor;
