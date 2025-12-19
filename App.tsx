
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutRecord, WorkoutType, GripType } from './types';
import TimerDisplay from './components/TimerDisplay';
import { getWorkoutMotivation } from './services/geminiService';

const App: React.FC = () => {
  // Mode States
  const [workoutType, setWorkoutType] = useState<WorkoutType>('RUN');
  const [grip, setGrip] = useState<GripType>('OVERHAND');
  const [reps, setReps] = useState(10);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [totalTime, setTotalTime] = useState(30 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Data States
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [aiTip, setAiTip] = useState<string>("Ready for your workout?");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('workout_history_v2');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('workout_history_v2', JSON.stringify(history));
  }, [history]);

  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    }
  };

  const fetchTip = useCallback(async (duration: number, status: 'START' | 'FINISH', type: WorkoutType, g?: GripType, r?: number) => {
    setIsLoadingTip(true);
    const tip = await getWorkoutMotivation(duration, status, type, g, r);
    setAiTip(tip);
    setIsLoadingTip(false);
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      completeWorkout();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const completeWorkout = () => {
    setIsActive(false);
    audioRef.current?.play().catch(() => {});
    
    const now = new Date();
    const elapsedSeconds = totalTime - timeLeft;
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    
    const newRecord: WorkoutRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: workoutType,
      date: now.toISOString(),
      startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: durationMins,
      grip: workoutType === 'PULL_UP' ? grip : undefined,
      reps: workoutType === 'PULL_UP' ? reps : undefined,
    };

    setHistory(prev => [newRecord, ...prev]);
    fetchTip(durationMins, 'FINISH', workoutType, grip, reps);
  };

  const switchToRun = () => {
    setWorkoutType('RUN');
    setTotalTime(30 * 60);
    setTimeLeft(30 * 60);
    setIsActive(false);
  };

  const switchToPullUp = () => {
    setWorkoutType('PULL_UP');
    setTotalTime(5 * 60);
    setTimeLeft(5 * 60);
    setIsActive(false);
  };

  const startWorkout = (mins: number) => {
    initAudio();
    const duration = mins * 60;
    setTimeLeft(duration);
    setTotalTime(duration);
    setIsActive(true);
    fetchTip(mins, 'START', workoutType, grip, reps);
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === totalTime) {
      fetchTip(totalTime / 60, 'START', workoutType, grip, reps);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const weeklyHistory = history.filter(r => new Date(r.date) >= monday);
    
    const runMinutes = weeklyHistory
      .filter(r => r.type === 'RUN')
      .reduce((sum, r) => sum + r.durationMinutes, 0);
      
    const pullUpReps = weeklyHistory
      .filter(r => r.type === 'PULL_UP')
      .reduce((sum, r) => sum + (r.reps || 0), 0);

    return { runMinutes, pullUpReps };
  };

  const { runMinutes, pullUpReps } = getWeeklyStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TOP BRANDING & MODE HEADER */}
        <header className="lg:col-span-12 flex justify-between items-center py-4 border-b border-slate-200 mb-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-600">
            WORK OUT TIME <span className="text-slate-400 font-light ml-1">AI</span>
          </h1>
          <div className="flex items-center gap-3">
             <button 
                onClick={switchToRun}
                className={`${workoutType === 'RUN' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500'} px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2`}
             >
                <div className={`w-2 h-2 rounded-full ${workoutType === 'RUN' ? 'bg-blue-300 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-black uppercase tracking-[0.15em]">Cardio Mode</span>
             </button>
             <button 
                onClick={switchToPullUp}
                className={`${workoutType === 'PULL_UP' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-200 text-slate-500'} px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2`}
             >
                <div className={`w-2 h-2 rounded-full ${workoutType === 'PULL_UP' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-black uppercase tracking-[0.15em]">Strength Mode</span>
             </button>
          </div>
        </header>

        {/* Navigation / Mode Switcher */}
        <div className="lg:col-span-12 flex justify-center mb-4">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
            <button 
              onClick={switchToRun}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${workoutType === 'RUN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Running
            </button>
            <button 
              onClick={switchToPullUp}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${workoutType === 'PULL_UP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Pull-ups (單摃)
            </button>
          </div>
        </div>

        {/* Left Column: Timer & Controls */}
        <section className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-8 flex flex-col items-center border border-slate-100 h-full">
          {/* Type Specific Controls */}
          {workoutType === 'RUN' ? (
            <div className="flex gap-3 mb-10 w-full">
              {[15, 30, 45, 60].map(m => (
                <button
                  key={m}
                  onClick={() => startWorkout(m)}
                  disabled={isActive}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${
                    totalTime === m * 60 && isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6 mb-10">
              <div className="flex gap-3">
                <button
                  onClick={() => setGrip('OVERHAND')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${
                    grip === 'OVERHAND' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  正面 (Overhand)
                </button>
                <button
                  onClick={() => setGrip('UNDERHAND')}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${
                    grip === 'UNDERHAND' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  反面 (Underhand)
                </button>
              </div>
              <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400 ml-4">Rep Target</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setReps(Math.max(1, reps - 1))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xl hover:bg-slate-100">-</button>
                  <span className="text-3xl font-black text-slate-800 w-12 text-center">{reps}</span>
                  <button onClick={() => setReps(reps + 1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xl hover:bg-slate-100">+</button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-4">
             <TimerDisplay 
                timeLeft={timeLeft} 
                totalTime={totalTime} 
                isActive={isActive} 
                workoutType={workoutType} 
             />
          </div>

          <div className="flex gap-4 mt-8 w-full">
            <button
              onClick={toggleTimer}
              className={`flex-[2] py-5 rounded-3xl text-lg font-black transition-all transform active:scale-95 text-white shadow-lg ${
                isActive ? 'bg-slate-800 shadow-slate-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-500'
              }`}
            >
              {isActive ? 'Pause' : timeLeft < totalTime ? 'Resume' : 'Start Session'}
            </button>
            <button
              onClick={resetTimer}
              className="flex-1 py-5 rounded-3xl text-lg font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 w-full p-5 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path></svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70 mb-1">AI Coach</p>
              <p className={`text-sm font-medium leading-snug italic ${isLoadingTip ? 'animate-pulse' : ''}`}>
                "{aiTip}"
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Stats & Records */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Dashboard Stats */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Weekly Run</p>
              <h2 className="text-2xl font-black text-slate-800">{runMinutes}<span className="text-xs ml-1 opacity-50">min</span></h2>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Reps</p>
              <h2 className="text-2xl font-black text-slate-800">{pullUpReps}<span className="text-xs ml-1 opacity-50">qty</span></h2>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden max-h-[600px]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <button onClick={() => { if(confirm('Clear history?')) setHistory([]); }} className="text-[10px] font-bold text-slate-300 hover:text-red-400 uppercase tracking-widest transition-colors">Clear</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                  <p className="text-sm font-medium">Earn your first medal today!</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-slate-50/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                        item.type === 'RUN' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-800 text-white group-hover:bg-indigo-600'
                      }`}>
                        {item.type === 'RUN' ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="2"/><path d="M12 7v7"/><path d="m9 22 2-3"/><path d="m15 22-2-3"/><path d="m7 10 3 2 2-2 2 2 3-2"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16M7 4v3M17 4v3" /></svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-black text-slate-800">
                             {item.type === 'RUN' ? `${item.durationMinutes}m Cardio` : `${item.reps} Reps`}
                           </p>
                           {item.grip && (
                             <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                               {item.grip === 'OVERHAND' ? '正面' : '反面'}
                             </span>
                           )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {item.startTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+{item.type === 'RUN' ? item.durationMinutes : Math.ceil((item.reps || 0)/2)} XP</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
