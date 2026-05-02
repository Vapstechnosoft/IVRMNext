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
                <div key={index} className="p-12 mb-8 border-b-2 border-gray-200 print:mb-0 print:border-none print:break-after-page min-h-[1000px] flex flex-col">
                    <div className="text-center mb-6">
                        {logo && <img src={logo} alt="Logo" className="mx-auto mb-4 max-h-24" />}
                        <h4 className="font-bold text-xl border-y-2 border-black py-3 mt-4 uppercase">
                            REGISTRATION RECEIPT / ADMISSION TEST INTIMATION
                        </h4>
                    </div>

                    <div className="flex justify-end mb-8">
                        <div className="flex items-center gap-2 font-bold">
                            <span>Date :</span>
                            <span className="border-b border-black min-w-[120px] text-center">
                                {user.ScheduleDate ? format(new Date(user.ScheduleDate), 'dd.MM.yyyy') : ''}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 text-lg">Sir/Madam,</div>

                    <div className="flex flex-row items-center gap-4 mb-6 text-lg">
                        <div className="w-24"></div>
                        <div className="shrink-0">Refer your Application No.</div>
                        <div className="border-b-2 border-dotted border-black flex-1 font-bold px-2">{user.regno}</div>
                    </div>

                    <div className="flex flex-row items-center gap-4 mb-4 text-lg">
                        <div className="w-8">1.</div>
                        <div className="shrink-0">Kindly bring Chi.</div>
                        <div className="border-b-2 border-dotted border-black flex-1 font-bold px-2">{user.name}</div>
                    </div>

                    <div className="flex flex-row items-center gap-4 mb-8 text-lg">
                        <div className="w-8"></div>
                        <div className="shrink-0">for the Admission Test on</div>
                        <div className="border-b-2 border-dotted border-black flex-1 font-bold px-2">
                            {user.ScheduleDate ? format(new Date(user.ScheduleDate), 'dd-MM-yyyy') : ''} from {user.ScheduleTime} to {user.ScheduleTimeTo}
                        </div>
                    </div>

                    <div className="space-y-4 text-lg leading-relaxed text-justify mb-8">
                        <p>
                            along with a copy of the 7th standard Annual Examination Marks card (if not already submitted). If 7th std. results are yet to be declared, a copy of the Preparatory Examination / 6th Std. Annual Examination marks cards is to be submitted.
                        </p>
                        <div className="flex gap-4">
                            <span className="font-bold">2.</span>
                            <p>
                                If your ward has obtained certificates(s) in any of the co-curricular activities like sports, dramatics, signing, writing/speaking competitions, please bring them along on the day of the Admission Test.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-start mb-12 gap-12">
                        <div className="w-[300px] border-2 border-black p-6 rounded-lg bg-gray-50">
                            <h4 className="font-bold text-center underline mb-6 text-lg">REGISTRATION RECEIPT</h4>
                            <table className="w-full text-base">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 font-semibold">Pros.No</td>
                                        <td className="py-2">: {user.regno}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 font-semibold">Place</td>
                                        <td className="py-2">: {user.PASR_PerCity}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 font-semibold">Amount</td>
                                        <td className="py-2">: Rs.300/-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-1 max-w-[250px] text-center">
                            <div className="mb-4 italic text-lg">Yours Faithfully,</div>
                            <div className="mb-4 h-24 flex items-center justify-center border border-dashed border-gray-300 rounded overflow-hidden">
                                <img src="/images/clients/SRKVS/swami Yukteshananda.jpg" alt="Signature" className="max-h-full object-contain" />
                            </div>
                            <div className="font-bold text-xl uppercase tracking-wider">Correspondent</div>
                        </div>
                    </div>

                    <div className="text-center border-4 border-double border-black p-4 font-extrabold text-lg mb-12 uppercase italic bg-gray-100 shadow-sm">
                        THIS LETTER MUST BE PRODUCED AT THE TIME OF THE TEST
                    </div>

                    <div className="flex justify-end mb-12">
                        <div className="w-[350px] text-base space-y-1">
                            <h5 className="font-bold text-lg mb-2 underline">To</h5>
                            <div className="font-bold text-lg">{user.name} ({user.class}) ({user.regno})</div>
                            <div className="font-semibold text-gray-800">S/O {user.fathername}</div>
                            <div>DOB: {user.PASR_DOB ? format(new Date(user.PASR_DOB), 'dd/MM/yyyy') : 'N/A'}</div>
                            <div>Email: {user.PASR_emailId}</div>
                            <div>Phone No: {user.PASR_MobileNo}</div>
                            <div className="pt-2 italic">
                                {user.PASR_PerStreet},<br />
                                {user.PASR_PerArea},<br />
                                {user.PASR_PerCity} - {user.PASR_PerPincode}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t-2 border-black">
                        <h5 className="font-bold text-lg mb-1">From</h5>
                        <div className="font-extrabold text-xl uppercase tracking-tight">SRI RAMAKRISHNA VIDYASHALA</div>
                        <div className="font-semibold text-gray-700">Residential Composite Pre-University College</div>
                        <div className="text-gray-600">Yadavagiri, MYSURU - 570 020.</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
