'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endDate, className }: CountdownTimerProps) {
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const difference = endDate.getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-1 sm:gap-2', className)}>
        {['Nap', 'Óra', 'Perc', 'Mp'].map((label, i) => (
          <div key={label} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <span className="text-lg font-bold text-secondary-400">:</span>}
            <div className="bg-secondary-900 text-white rounded-lg p-2 min-w-[44px] sm:min-w-[52px] text-center">
              <div className="text-base sm:text-lg font-bold leading-none">00</div>
              <div className="text-[9px] sm:text-[10px] text-secondary-400 uppercase mt-1">{label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 sm:gap-2', className)}>
      <TimeBlock value={timeLeft.days} label="Nap" />
      <span className="text-lg font-bold text-secondary-400">:</span>
      <TimeBlock value={timeLeft.hours} label="Óra" />
      <span className="text-lg font-bold text-secondary-400">:</span>
      <TimeBlock value={timeLeft.minutes} label="Perc" />
      <span className="text-lg font-bold text-secondary-400">:</span>
      <TimeBlock value={timeLeft.seconds} label="Mp" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-secondary-900 text-white rounded-lg p-2 min-w-[44px] sm:min-w-[52px] text-center">
      <div className="text-base sm:text-lg font-bold leading-none">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[9px] sm:text-[10px] text-secondary-400 uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
