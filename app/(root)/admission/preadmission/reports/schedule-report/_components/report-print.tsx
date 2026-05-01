'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface ReportPrintProps {
    data: IScheduleReportList[];
    logo?: string;
}

/**
 * Standard Schedule Report print component.
 */
export default function ScheduleReportPrint({
    data,
    logo
}: ReportPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="p-8 print:pt-12 print:px-0 bg-white printable-content" style={{ color: 'black', background: 'white' }}>
            <div className="mb-6 text-center">
                {logo && <img src={logo} alt="Logo" className="mx-auto mb-2 max-h-24" />}
                <h1 className="font-bold text-2xl uppercase underline" style={{ color: 'black' }}>
                    SCHEDULE REPORT
                </h1>
            </div>

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
                        <th className="border border-black p-2 text-left" style={{ border: '1px solid black' }}>Remarks</th>
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
                                {user.ScheduleDate ? format(new Date(user.ScheduleDate), 'dd.MM.yyyy') : ''}
                            </td>
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{user.ScheduleTime}</td>
                            <td className="border border-black p-2 text-center" style={{ border: '1px solid black' }}>{user.ScheduleTimeTo}</td>
                            <td className="border border-black p-2" style={{ border: '1px solid black' }}>{user.PAOTS_Remarks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-8 text-center text-xs italic">
                <span>Printed on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</span>
            </div>
        </div>
    );
}
