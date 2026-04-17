'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface DetailedTimePickerProps {
    value?: string; // HH:mm
    onChange: (value: string) => void;
    error?: string;
}

export function DetailedTimePicker({ value = 'HH:MM', onChange, error }: DetailedTimePickerProps) {
    const [hours, setHours] = React.useState('HH');
    const [minutes, setMinutes] = React.useState('MM');

    React.useEffect(() => {
        if (value && value.includes(':')) {
            const [h, m] = value.split(':');
            setHours(h || 'HH');
            setMinutes(m || 'MM');
        } else {
            setHours('HH');
            setMinutes('MM');
        }
    }, [value]);

    const updateTime = (newHours: string, newMinutes: string) => {
        onChange(`${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`);
    };

    const handleIncrementHour = () => {
        const h = isNaN(parseInt(hours)) ? -1 : parseInt(hours);
        const nextH = (h + 1) % 24;
        updateTime(String(nextH), isNaN(parseInt(minutes)) ? '00' : minutes);
    };

    const handleDecrementHour = () => {
        const h = isNaN(parseInt(hours)) ? 1 : parseInt(hours);
        const nextH = (h - 1 + 24) % 24;
        updateTime(String(nextH), isNaN(parseInt(minutes)) ? '00' : minutes);
    };

    const handleIncrementMinute = () => {
        const m = isNaN(parseInt(minutes)) ? -1 : parseInt(minutes);
        const nextM = (m + 1) % 60;
        updateTime(isNaN(parseInt(hours)) ? '00' : hours, String(nextM));
    };

    const handleDecrementMinute = () => {
        const m = isNaN(parseInt(minutes)) ? 1 : parseInt(minutes);
        const nextM = (m - 1 + 60) % 60;
        updateTime(isNaN(parseInt(hours)) ? '00' : hours, String(nextM));
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);
        
        if (val === '') {
            setHours('HH');
            return;
        }

        const num = parseInt(val);
        if (num < 24) {
            setHours(val);
            updateTime(val, isNaN(parseInt(minutes)) ? '00' : minutes);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(-2);

        if (val === '') {
            setMinutes('MM');
            return;
        }

        const num = parseInt(val);
        if (num < 60) {
            setMinutes(val);
            updateTime(isNaN(parseInt(hours)) ? '00' : hours, val);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
                {/* Hours Group */}
                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={handleIncrementHour}
                        className="text-[#3b82f6] hover:scale-110 transition-all p-0.5"
                    >
                        <ChevronUp className="h-4 w-4 stroke-[2px]" />
                    </button>
                    <div className={cn(
                        "w-10 h-8 border rounded flex items-center justify-center bg-white transition-colors",
                         "border-[#3b82f6]"
                    )}>
                        <input
                            type="text"
                            value={hours}
                            onChange={handleHourChange}
                            onBlur={() => {
                                if (!isNaN(parseInt(hours))) setHours(hours.padStart(2, '0'));
                                else setHours('HH');
                            }}
                            className={cn(
                                "w-full h-full text-center text-lg font-bold bg-transparent outline-none",
                                hours === 'HH' ? "text-gray-300" : "text-gray-600"
                            )}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleDecrementHour}
                        className="text-[#3b82f6] hover:scale-110 transition-all p-0.5"
                    >
                        <ChevronDown className="h-4 w-4 stroke-[2px]" />
                    </button>
                </div>

                <div className={cn(
                    "text-2xl font-bold self-center mx-1 transition-colors",
                    "text-[#3b82f6]"
                )}>:</div>

                {/* Minutes Group */}
                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={handleIncrementMinute}
                        className="text-[#3b82f6] hover:scale-110 transition-all p-0.5"
                    >
                        <ChevronUp className="h-4 w-4 stroke-[2px]" />
                    </button>
                    <div className={cn(
                        "w-10 h-8 border rounded flex items-center justify-center bg-white transition-colors",
                         "border-[#3b82f6]"
                    )}>
                        <input
                            type="text"
                            value={minutes}
                            onChange={handleMinuteChange}
                            onBlur={() => {
                                if (!isNaN(parseInt(minutes))) setMinutes(minutes.padStart(2, '0'));
                                else setMinutes('MM');
                            }}
                            className={cn(
                                "w-full h-full text-center text-lg font-bold bg-transparent outline-none",
                                minutes === 'MM' ? "text-gray-300" : "text-gray-600"
                            )}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleDecrementMinute}
                        className="text-[#3b82f6] hover:scale-110 transition-all p-0.5"
                    >
                        <ChevronDown className="h-4 w-4 stroke-[2px]" />
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-sm font-medium mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
