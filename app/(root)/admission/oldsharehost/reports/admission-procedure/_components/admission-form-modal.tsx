'use client';

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface AdmissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    logo: string;
}

export default function AdmissionFormModal({ isOpen, onClose, data, logo }: AdmissionFormModalProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (!data) return null;

    const { viewadmission } = data;
    const student = viewadmission?.[0] || {};

    const infoRows = [
        { label: 'APPLICATION NO', value: student.PASR_RegistrationNo },
        { label: 'ADMISSION NO', value: student.AMST_AdmNo },
        { label: 'FULL NAME OF PUPIL', value: student.StudentName },
        { label: 'GENDER', value: student.AMST_Sex },
        { label: 'RELIGION', value: student.IVRMMR_Name },
        { 
            label: 'COMMUNITY: SC / ST / OBC / GENERAL / OTHERS (CERTIFICATE MUST BE ENCLOSED)', 
            value: student.IMC_CasteName 
        },
        { label: 'NATIONALITY', value: student.IVRMMC_CountryName },
        { label: 'MOTHER TONGUE', value: student.AMST_MotherTongue },
        { label: 'DATE OF BIRTH', value: student.AMST_DOB ? format(new Date(student.AMST_DOB), 'dd/MM/yyyy') : '' },
        { label: 'CLASS TO WHICH ADMISSION IS SOUGHT', value: student.ASMCL_ClassName },
        { label: "FATHER'S NAME", value: student.FatherName },
        { label: "MOTHER'S NAME", value: student.MotherName },
        { 
            label: 'PERMANENT ADDRESS', 
            value: `${student.PermanentAddress || ''}, ${student.IVRMMS_Name || ''}, ${student.IVRMMC_CountryName || ''}, ${student.AMST_PerPincode || ''}` 
        },
        { label: "FATHER'S MOBILE NUMBER", value: student.AMST_FatherMobleNo },
        { label: "MOTHER'S MOBILE NUMBER", value: student.AMST_MotherMobileNo },
        { label: "FATHER'S EMAIL", value: student.AMST_FatheremailId },
        { label: "MOTHER'S EMAIL", value: student.AMST_MotherEmailId },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <DialogTitle>Admission Form</DialogTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={componentRef} className="p-8 font-serif text-[14px] print:p-0 print:text-[12px] leading-relaxed">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center">
                            {logo && <img src={logo} alt="Logo" className="h-24 mx-auto mb-4 object-contain" />}
                        </div>

                        <h1 className="text-center text-2xl font-bold uppercase tracking-widest border-b-2 border-black pb-2 inline-block mx-auto w-full">
                            ADMISSION FORM
                        </h1>

                        <div className="space-y-3 pt-4">
                            {infoRows.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-[300px_1fr] items-start gap-2">
                                    <div className="font-bold uppercase text-[12px]">{row.label}</div>
                                    <div className="flex gap-2">
                                        <span>:</span>
                                        <span className="font-medium">{row.value || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 pt-6">
                            <h4 className="font-bold text-center underline italic text-lg">Declaration</h4>
                            
                            <p className="text-justify indent-8">
                                I <strong>{student.FatherName}</strong> (F/O) <strong>{student.StudentName}</strong> hereby certify that the above details furnished by me is complete and true.
                            </p>

                            <p className="text-justify indent-8">
                                I shall be responsible for my ward’s behaviour and academic progress in the school. I have read and understood the rules and regulations of the school and am aware of the disciplinary practices existing in the school (which may change from time to time) in all matters. I hereby state that I shall cooperate with the school management in all matters and support its efforts to run the school efficiently.
                            </p>

                            <div className="grid grid-cols-3 gap-8 pt-12 text-center">
                                <div className="space-y-2">
                                    <div className="border-b border-dotted border-black h-4 mx-4"></div>
                                    <div className="text-[12px] font-bold">Father's Signature</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="border-b border-dotted border-black h-4 mx-4"></div>
                                    <div className="text-[12px] font-bold">Mother's Signature</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="border-b border-dotted border-black h-4 mx-4"></div>
                                    <div className="text-[12px] font-bold">Guardian's Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="print:hidden">
                    <Button variant="destructive" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
