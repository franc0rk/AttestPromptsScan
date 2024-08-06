import React, { useState, useEffect, useRef } from "react";

// Define the props type
interface TypingEffectProps {
  text: string;
  speed?: number; // Optional prop with a default value
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isCursorVisible, setIsCursorVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    setIsCursorVisible(true);
    const t = setInterval(() => {
      setDisplayedText((prev) => {
        const nextText = text.slice(0, i + 1);
        i++;
        if (i > text.length) {
          clearInterval(t);
          setIsCursorVisible(false);
        }
        return nextText;
      });
    }, speed);

    return () => clearInterval(t);
  }, [text, speed]);

  if (!text) {
    return "";
  }

  return (
    <div className="relative break-words text-lg font-mono" ref={containerRef}>
      <span>{displayedText}</span>
      {isCursorVisible && (
        <span className="absolute inline-block w-1 h-6 bg-white ml-1"></span>
      )}
    </div>
  );
};

export default TypingEffect;
