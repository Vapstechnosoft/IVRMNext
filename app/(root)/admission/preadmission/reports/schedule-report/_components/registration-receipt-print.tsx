'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface RegistrationReceiptPrintProps {
    data: IScheduleReportList[];
    logo?: string;
}

/**
 * Registration Receipt / Admission Test Intimation print component.
 * Each student starts on a new page.
 */
export default function RegistrationReceiptPrint({
    data,
    logo
}: RegistrationReceiptPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-white printable-content" style={{ color: 'black', background: 'white' }}>
            {data.map((user, index) => (
                <div key={index} className="p-4 print:px-6 mb-2 border-b-2 border-gray-200 print:mb-0 print:border-none print:break-after-page flex flex-col overflow-hidden text-xs">
                    <div className="text-center mb-2">
                        {logo && logo.trim() !== "" && (
                            <img 
                                src={logo} 
                                alt="Logo" 
                                className="mx-auto mb-1 max-h-12" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        )}
                        <h4 className="font-bold text-base border-y border-black py-1 mt-1 uppercase">
                            REGISTRATION RECEIPT / ADMISSION TEST INTIMATION
                        </h4>
                    </div>

                    <div className="flex justify-end mb-2">
                        <div className="flex items-center gap-2 font-bold text-[10px]">
                            <span>Date :</span>
                            <span className="border-b border-black min-w-[80px] text-center">
                                {(user.ScheduleDate || user.scheduledate) ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd.MM.yyyy') : ''}
                            </span>
                        </div>
                    </div>

                    <div className="mb-1 text-sm">Sir/Madam,</div>

                    <div className="flex flex-row items-center gap-2 mb-2 text-sm">
                        <div className="w-12"></div>
                        <div className="shrink-0">Refer your Application No.</div>
                        <div className="border-b border-dotted border-black flex-1 font-bold px-1">{user.regno}</div>
                    </div>

                    <div className="flex flex-row items-center gap-2 mb-2 text-sm">
                        <div className="w-4">1.</div>
                        <div className="shrink-0">Kindly bring Chi.</div>
                        <div className="border-b border-dotted border-black flex-1 font-bold px-1">{user.name}</div>
                    </div>

                    <div className="flex flex-row items-center gap-2 mb-4 text-sm">
                        <div className="w-4"></div>
                        <div className="shrink-0">for the Admission Test on</div>
                        <div className="border-b border-dotted border-black flex-1 font-bold px-1">
                            {(user.ScheduleDate || user.scheduledate) ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd-MM-yyyy') : ''} from {user.ScheduleTime || user.scheduletime} to {user.ScheduleTimeTo || user.scheduletimeto}
                        </div>
                    </div>

                    <div className="space-y-2 text-xs leading-tight text-justify mb-4">
                        <p>
                            along with a copy of the 7th standard Annual Examination Marks card (if not already submitted). If 7th std. results are yet to be declared, a copy of the Preparatory Examination / 6th Std. Annual Examination marks cards is to be submitted.
                        </p>
                        <div className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <p>
                                If your ward has obtained certificates(s) in any of the co-curricular activities like sports, dramatics, signing, writing/speaking competitions, please bring them along on the day of the Admission Test.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-start mb-4 gap-6">
                        <div className="w-[220px] border border-black p-3 rounded bg-gray-50">
                            <h4 className="font-bold text-center underline mb-2 text-sm">REGISTRATION RECEIPT</h4>
                            <table className="w-full text-xs">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-1 font-semibold">Pros.No</td>
                                        <td className="py-1">: {user.regno}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-1 font-semibold">Place</td>
                                        <td className="py-1">: {user.PASR_PerCity}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-1 font-semibold">Amount</td>
                                        <td className="py-1">: Rs.300/-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-1 max-w-[180px] text-center">
                            <div className="mb-1 italic text-sm">Yours Faithfully,</div>
                            <div className="mb-1 h-12 flex items-center justify-center border border-dashed border-gray-300 rounded overflow-hidden">
                                {/* Signature image removed - file not found on server */}
                            </div>
                            <div className="font-bold text-base uppercase tracking-tight">Correspondent</div>
                        </div>
                    </div>

                    <div className="text-center border-2 border-double border-black p-2 font-bold text-sm mb-4 uppercase italic bg-gray-100">
                        THIS LETTER MUST BE PRODUCED AT THE TIME OF THE TEST
                    </div>

                    <div className="flex justify-end mb-4">
                        <div className="w-[250px] text-xs space-y-0.5">
                            <h5 className="font-bold text-sm mb-0.5 underline">To</h5>
                            <div className="font-bold text-sm">{user.name} ({user.class}) ({user.regno})</div>
                            <div className="font-semibold text-gray-800">S/O {user.fathername}</div>
                            <div>DOB: {user.PASR_DOB ? format(new Date(user.PASR_DOB), 'dd/MM/yyyy') : 'N/A'}</div>
                            <div>Email: {user.PASR_emailId}</div>
                            <div>Phone No: {user.PASR_MobileNo}</div>
                            <div className="italic text-[10px]">
                                {user.PASR_PerStreet}, {user.PASR_PerArea}, {user.PASR_PerCity} - {user.PASR_PerPincode}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-black">
                        <h5 className="font-bold text-sm mb-0.5">From</h5>
                        <div className="font-extrabold text-base uppercase tracking-tighter">SRI RAMAKRISHNA VIDYASHALA</div>
                        <div className="font-semibold text-gray-700 text-xs">Residential Composite Pre-University College</div>
                        <div className="text-gray-600 text-[10px]">Yadavagiri, MYSURU - 570 020.</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
