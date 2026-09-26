import React, { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Fade out slightly before unmounting
    const timeout = setTimeout(() => {
      setOpacity(0);
    }, 3700); // Wait 3.7s then fade out (total 4.0s as in App.tsx)

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFFFF] transition-opacity duration-300"
      style={{ opacity }}
    >
      <style>{`
        .loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loader-square {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          animation: jumpSwap 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }

        .sq-1 {
          background-color: #FFC700;
          animation-delay: 0s;
        }

        .sq-2 {
          background-color: #00C2FF;
          animation-delay: 0.15s;
        }

        .sq-3 {
          background-color: #7B2CBF;
          animation-delay: 0.3s;
        }

        @keyframes jumpSwap {
          0%, 100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) scale(0.8) rotate(45deg);
          }
          50% {
            transform: translateY(0) scale(1) rotate(90deg);
          }
        }
      `}</style>
      
      <div className="loader-container">
        <div className="loader-square sq-1"></div>
        <div className="loader-square sq-2"></div>
        <div className="loader-square sq-3"></div>
      </div>
    </div>
  );
}
