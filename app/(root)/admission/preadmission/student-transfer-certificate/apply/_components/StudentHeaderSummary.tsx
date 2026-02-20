'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface StudentHeaderSummaryProps {
    student: any;
}

export const StudentHeaderSummary = ({ student }: StudentHeaderSummaryProps) => {
    if (!student) return null;

    // Helper to get value or dash
    const val = (v: any) => v || '-';

    const InfoRow = ({ label, value }: { label: string; value: any }) => (
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <Label className="w-40 text-muted-foreground text-xs md:text-sm font-semibold">{label}</Label>
            <span className="font-semibold text-sm md:text-base text-indigo-900"> : {val(value)}</span>
        </div>
    );

    return (
        <Card className="bg-white border-none shadow-sm mb-4">
            <div className="bg-indigo-50/50 p-2 border-b border-indigo-100 mb-2">
                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Student Details</h3>
            </div>
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <InfoRow label="Registration No." value={student.amst_registrationno || student.amsT_RegistrationNo} />
                        <InfoRow label="Admission No." value={student.admno || student.amsT_AdmNo} />
                        <InfoRow label="Class/Section" value={`${val(student.asmcl_classname || student.asmcL_ClassName)} / ${val(student.asmc_sectionname || student.asmC_SectionName)}`} />
                        <InfoRow label="Joined Year / Class" value={`${val(student.asmay_year || student.asmaY_Year)} / ${val(student.classstudying || student.classStudying)}`} />
                        <InfoRow label="Father Name" value={student.father || student.amsT_FatherName} />
                        <InfoRow label="Category" value={student.imc_castename || student.casteName} />
                        <InfoRow label="DOB" value={student.amst_dob ? new Date(student.amst_dob).toLocaleDateString() : (student.amsT_Dob ? new Date(student.amsT_Dob).toLocaleDateString() : '-')} />
                        <InfoRow label="DOB Words" value={student.amst_dob_words || student.amsT_DOB_Words} />
                    </div>

                    {/* Right Photo */}
                    <div className="flex-shrink-0 flex justify-center lg:justify-end">
                        <div className="w-24 h-32 border bg-gray-100 flex items-center justify-center overflow-hidden rounded-md shadow-sm">
                            {student.amst_photoname ? (
                                <img
                                    src={student.amst_photoname}
                                    alt="Student"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-gray-400">No Photo</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
