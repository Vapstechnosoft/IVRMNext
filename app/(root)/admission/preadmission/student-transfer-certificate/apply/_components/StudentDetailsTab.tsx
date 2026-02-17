'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StudentDetailsTabProps {
    data: any;
}

export const StudentDetailsTab = ({ data }: StudentDetailsTabProps) => {
    const student = data?.student_name_list?.[0] || {};

    const InfoField = ({ label, value }: { label: string; value: string | number }) => (
        <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">{label}</Label>
            <div className="font-medium text-sm">{value || '-'}</div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-full bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoField label="Student Name" value={student.studentName} />
                        <InfoField label="Admission No." value={student.amsT_AdmNo} />
                        <InfoField label="Roll No." value={student.amaY_RollNo} />
                    </CardContent>
                </Card>

                <div className="col-span-full">
                     <h3 className="text-sm font-semibold mb-3 text-indigo-900 border-b pb-1">Academic Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                        <InfoField label="Class" value={student.asmcL_ClassName} />
                        <InfoField label="Section" value={student.asmC_SectionName} />
                        <InfoField label="Academic Year" value={student.asmaY_Year} />
                        <InfoField label="Join Year" value={student.joinedYear || student.asmaY_Year} />
                     </div>
                </div>

                <div className="col-span-full">
                     <h3 className="text-sm font-semibold mb-3 text-indigo-900 border-b pb-1">Personal Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                        <InfoField label="Date of Birth" value={student.amsT_Dob ? new Date(student.amsT_Dob).toLocaleDateString() : '-'} />
                        <InfoField label="Gender" value={student.amsT_Sex} />
                        <InfoField label="Blood Group" value={student.amsT_BloodGroup} />
                        <InfoField label="Religion" value={student.religionName} />
                        <InfoField label="Caste" value={student.casteName} />
                     </div>
                </div>
                
                 <div className="col-span-full">
                     <h3 className="text-sm font-semibold mb-3 text-indigo-900 border-b pb-1">Parent Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
                        <InfoField label="Father Name" value={student.amsT_FatherName} />
                        <InfoField label="Mother Name" value={student.amsT_MotherName} />
                         <InfoField label="Mobile No." value={student.amsT_MobileNo} />
                        <InfoField label="Email ID" value={student.amsT_emailId} />
                     </div>
                </div>
            </div>
        </div>
    );
};
