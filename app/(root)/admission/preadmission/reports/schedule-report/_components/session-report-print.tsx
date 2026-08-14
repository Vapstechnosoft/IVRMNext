'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface SessionReportPrintProps {
    data: IScheduleReportList[];
    logo?: string;
    academicYear?: string;
    scheduleName?: string;
    scheduleTime?: string;
    scheduleDate?: string;
}

/**
 * Session Report print component (SRKVS layout).
 */
export default function SessionReportPrint({
    data,
    logo,
    academicYear,
    scheduleName,
    scheduleTime,
    scheduleDate
}: SessionReportPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="p-8 print:px-12 bg-white printable-content" style={{ color: 'black', background: 'white' }}>
            <div className="text-center mb-4">
                {logo && logo.trim() !== "" && (
                    <img 
                        src={logo} 
                        alt="Logo" 
                        className="mx-auto mb-2 max-h-24" 
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                )}
            </div>

            <div className="flex flex-row justify-between items-center mb-4 border-b-2 border-black pb-2 text-[10px] font-bold">
                <div>Academic Year: {academicYear || 'N/A'}</div>
                <div>Session: {scheduleName || 'N/A'} AT {scheduleTime || 'N/A'}</div>
                <div>Date: {scheduleDate ? format(new Date(scheduleDate), 'dd/MM/yyyy') : 'N/A'}</div>
            </div>

            <h2 className="text-center font-bold text-xl underline mb-6 uppercase">SESSION REPORT</h2>

            <table className="w-full border-collapse border border-black text-[10px]" style={{ border: '1px solid black' }}>
                <thead>
                    <tr className="bg-gray-100 font-bold">
                        <th className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>SL.No</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Name</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>RegNo</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Class</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Gender</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Schedule Date</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>From</th>
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>To</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className="break-inside-avoid">
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{index + 1}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.name}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.regno}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.class}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.gender}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>
                                {(user.ScheduleDate || user.scheduledate) ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd.MM.yyyy') : ''}
                            </td>
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{user.ScheduleTime || user.scheduletime || ''}</td>
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{user.ScheduleTimeTo || user.scheduletimeto || ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
