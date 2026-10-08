'use client';

import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useActivePreadmissionDetails } from '@/hooks/admission/preadmission/useTransactions';
import { useParentDashboard } from '@/hooks/admission/preadmission/useReports';

export default function PreadmissionDashboard() {
    const { data: activePreadmission, isLoading: isPreadmissionLoading } = useActivePreadmissionDetails();
    const asmayId = activePreadmission?.data?.asmaY_Id ?? 0;
    
    const { data: dashboardResponse, isLoading: isDashboardLoading } = useParentDashboard(asmayId);
    // Based on the API response, data contains the array of students
    const students = dashboardResponse?.data || [];

    return (
        <div className="w-full min-h-[calc(100vh-100px)] p-6 bg-gray-50 flex flex-col items-center mt-4 border border-gray-200 shadow-sm">
            <Link href="/admission/preadmission/transactions/application-form" className="w-full mb-8">
                <Button className="w-full bg-[#2c5282] hover:bg-[#1a365d] text-white font-semibold rounded-md py-6 flex items-center justify-center shadow-md text-lg">
                    Fill AdmissionForm-SCHOOL <Edit className="w-4 h-4 ml-2" />
                </Button>
            </Link>

            {isPreadmissionLoading || (asmayId > 0 && isDashboardLoading) ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2c5282]" />
                </div>
            ) : students.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {students.map((student: any) => (
                        <div key={student.pasr_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                                    {student.student_photo ? (
                                        <img src={student.student_photo} alt={student.student_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-bold text-lg text-gray-900 truncate" title={student.student_name}>
                                        {student.student_name}
                                    </h3>
                                    <p className="text-sm font-medium text-[#2c5282]">Reg No: {student.registration_number}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                                <div className="text-gray-500 font-medium">Class</div>
                                <div className="font-semibold text-right truncate" title={student.applied_class_name}>{student.applied_class_name}</div>
                                
                                <div className="text-gray-500 font-medium">DOB</div>
                                <div className="font-semibold text-right">{student.date_of_birth}</div>
                                
                                <div className="text-gray-500 font-medium">Mobile</div>
                                <div className="font-semibold text-right">{student.mobile_no}</div>
                                
                                <div className="text-gray-500 font-medium">Email</div>
                                <div className="font-semibold text-right truncate" title={student.email_id}>{student.email_id}</div>
                            </div>
                            
                            <div className="pt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Application Status</p>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                        student.application_status === 'APP ACCEPTED' ? 'bg-green-100 text-green-800' :
                                        student.application_status === 'APP REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {student.application_status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Admission Status</p>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                        student.admission_status === 'CONFIRM' ? 'bg-green-100 text-green-800' :
                                        student.admission_status === 'INPROGRESS' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {student.admission_status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
