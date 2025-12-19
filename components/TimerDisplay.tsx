
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  workoutType?: 'RUN' | 'PULL_UP';
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, isActive, workoutType = 'RUN' }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <style>
        {`
          @keyframes run-body {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes run-arm-front {
            0%, 100% { transform: rotate(-30deg); }
            50% { transform: rotate(40deg); }
          }
          @keyframes run-arm-back {
            0%, 100% { transform: rotate(40deg); }
            50% { transform: rotate(-30deg); }
          }
          @keyframes run-leg-front {
            0%, 100% { transform: rotate(-40deg); }
            50% { transform: rotate(50deg); }
          }
          @keyframes run-leg-back {
            0%, 100% { transform: rotate(50deg); }
            50% { transform: rotate(-40deg); }
          }
          .animate-runner-body { animation: run-body 0.6s infinite ease-in-out; }
          .animate-runner-arm-front { transform-origin: 12px 8px; animation: run-arm-front 0.6s infinite ease-in-out; }
          .animate-runner-arm-back { transform-origin: 12px 8px; animation: run-arm-back 0.6s infinite ease-in-out; }
          .animate-runner-leg-front { transform-origin: 12px 14px; animation: run-leg-front 0.6s infinite ease-in-out; }
          .animate-runner-leg-back { transform-origin: 12px 14px; animation: run-leg-back 0.6s infinite ease-in-out; }
          
          @keyframes pull-up-move {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-pullup { animation: pull-up-move 2s infinite ease-in-out; }
        `}
      </style>

      <svg className="w-72 h-72 transform -rotate-90">
        <circle
          cx="144"
          cy="144"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="144"
          cy="144"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-600 transition-all duration-1000 ease-linear"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {workoutType === 'RUN' ? (
          <div className={`w-20 h-20 mb-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-600 w-full h-full ${isActive ? 'animate-runner-body' : ''}`}>
              {/* Back Arm */}
              <path d="M12 8l-2 4 1 2" className={isActive ? "animate-runner-arm-back" : ""} opacity="0.5" />
              {/* Back Leg */}
              <path d="M12 14l1 4-2 2" className={isActive ? "animate-runner-leg-back" : ""} opacity="0.5" />
              {/* Head */}
              <circle cx="13" cy="5" r="1.5" fill="currentColor" />
              {/* Torso */}
              <path d="M12 7c0 0 1 2 0 7" strokeWidth="2.5" />
              {/* Front Leg */}
              <path d="M12 14l-3 4 2 2" className={isActive ? "animate-runner-leg-front" : ""} />
              {/* Front Arm */}
              <path d="M12 8l3 3-1 3" className={isActive ? "animate-runner-arm-front" : ""} />
            </svg>
          </div>
        ) : (
          <div className={`w-20 h-20 mb-2 transition-all duration-300 ${isActive ? 'animate-pullup opacity-100' : 'opacity-40'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 w-full h-full">
              {/* Bar */}
              <path d="M2 4h20" strokeWidth="1" stroke="currentColor" opacity="0.3" />
              {/* Person hanging */}
              <circle cx="12" cy="8" r="1.5" fill="currentColor" />
              <path d="M12 10v6" strokeWidth="2" />
              <path d="M12 10l-4-3" />
              <path d="M12 10l4-3" />
              <path d="M10 20l2-2 2 2" />
            </svg>
          </div>
        )}
        
        <span className="text-6xl font-black tracking-tighter text-slate-800 tabular-nums">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
          {isActive ? (workoutType === 'RUN' ? 'Maintaining Pace' : 'Powering Through') : 'Ready to Start'}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
