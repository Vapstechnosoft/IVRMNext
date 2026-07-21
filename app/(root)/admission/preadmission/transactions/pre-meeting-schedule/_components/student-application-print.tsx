'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { getStudentPrintData } from '@/server/admission/preadmission/transactions/application_form';

interface StudentApplicationPrintProps {
    isOpen: boolean;
    onClose: () => void;
    record: IPreMeetingSchedule | null;
}

export default function StudentApplicationPrint({ isOpen, onClose, record }: StudentApplicationPrintProps) {
    const [printData, setPrintData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Student_Application_${record?.studentname || 'Details'}`,
    });

    useEffect(() => {
        if (isOpen && record) {
            const fetchPrintData = async () => {
                setIsLoading(true);
                try {
                    // Assuming ASMCL_Id, ASMAY_Id, ASMST_Id are retrieved or passed differently.
                    // For now, passing 0 or mock ids as the legacy code just sent pasR_Id for this specific API.
                    // If the backend requires them, we might need to fetch them from the record if available.
                    const res = await getStudentPrintData(record.pasr_id, 0, 0, 0);
                    const dtObj = res?.studentReg_DTObj as any[];
                    if (dtObj && dtObj.length > 0) {
                        setPrintData(dtObj[0]);
                    }
                } catch (error) {
                    console.error("Error fetching print data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPrintData();
        } else {
            setPrintData(null);
        }
    }, [isOpen, record]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-blue-800">
                        Application Details - {record?.studentname}
                    </DialogTitle>
                    <div className="flex gap-2 pr-6">
                        <Button onClick={() => handlePrint()} disabled={isLoading || !printData}>
                            <Printer className="w-4 h-4 mr-2" /> Print Application
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="animate-pulse font-medium text-slate-500">Loading Application Data...</span>
                        </div>
                    ) : !printData ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-slate-500">No application data found.</span>
                        </div>
                    ) : (
                        <div 
                            ref={printRef} 
                            className="bg-white p-8 shadow-sm border mx-auto max-w-4xl min-h-[1056px] print:shadow-none print:border-none print:m-0 print:p-0"
                        >
                            {/* Generic Print Template mapped from printData */}
                            <div className="text-center mb-8 border-b pb-4">
                                <h1 className="text-2xl font-bold uppercase tracking-wide">Student Application Form</h1>
                                <p className="text-muted-foreground mt-1">Registration No: {printData.pasR_RegistrationNo}</p>
                            </div>

                            <div className="flex gap-8 mb-8">
                                <div className="w-32 h-40 border-2 border-slate-200 rounded overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    {printData.pasR_Student_Pic_Path ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={printData.pasR_Student_Pic_Path} alt="Student" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-slate-400">Photo</span>
                                    )}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <span className="font-semibold text-slate-600 block">First Name</span>
                                        <span className="text-slate-900 uppercase">{printData.pasR_FirstName || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Last Name</span>
                                        <span className="text-slate-900 uppercase">{printData.pasR_LastName || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Date of Birth</span>
                                        <span className="text-slate-900">{printData.pasR_DOB ? new Date(printData.pasR_DOB).toLocaleDateString() : '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Gender</span>
                                        <span className="text-slate-900 uppercase">{printData.pasR_Sex || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Blood Group</span>
                                        <span className="text-slate-900">{printData.pasR_BloodGroup || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Mother Tongue</span>
                                        <span className="text-slate-900">{printData.pasR_MotherTongue || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 bg-slate-50 px-2 rounded-t">Contact Information</h2>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm px-2">
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Mobile No</span>
                                        <span className="text-slate-900">{printData.pasR_MobileNo || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-600 block">Email ID</span>
                                        <span className="text-slate-900">{printData.pasR_emailId || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-semibold text-slate-600 block">Permanent Address</span>
                                        <span className="text-slate-900">
                                            {[printData.pasR_PerStreet, printData.pasR_PerArea, printData.pasR_PerCity, printData.pasR_PerPincode].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 bg-slate-50 px-2 rounded-t">Parents Information</h2>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm px-2">
                                    <div>
                                        <span className="font-semibold text-blue-800 block mb-2 border-b pb-1">Father Details</span>
                                        <div className="space-y-2">
                                            <div><span className="text-slate-500">Name:</span> {printData.pasR_FatherName || '-'}</div>
                                            <div><span className="text-slate-500">Education:</span> {printData.pasR_FatherEducation || '-'}</div>
                                            <div><span className="text-slate-500">Occupation:</span> {printData.pasR_FatherOccupation || '-'}</div>
                                            <div><span className="text-slate-500">Mobile:</span> {printData.pasR_FatherMobleNo || '-'}</div>
                                            <div><span className="text-slate-500">Email:</span> {printData.pasR_FatheremailId || '-'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-800 block mb-2 border-b pb-1">Mother Details</span>
                                        <div className="space-y-2">
                                            <div><span className="text-slate-500">Name:</span> {printData.pasR_MotherName || '-'}</div>
                                            <div><span className="text-slate-500">Education:</span> {printData.pasR_MotherEducation || '-'}</div>
                                            <div><span className="text-slate-500">Occupation:</span> {printData.pasR_MotherOccupation || '-'}</div>
                                            <div><span className="text-slate-500">Mobile:</span> {printData.pasR_MotherMobleNo || '-'}</div>
                                            <div><span className="text-slate-500">Email:</span> {printData.pasR_MotheremailId || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-16 pt-16 border-t border-slate-300 flex justify-between text-sm font-semibold">
                                <div className="text-center">
                                    <div className="w-48 border-b border-black mb-2 h-8"></div>
                                    Parent/Guardian Signature
                                </div>
                                <div className="text-center">
                                    <div className="w-48 border-b border-black mb-2 h-8"></div>
                                    Principal Signature
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
