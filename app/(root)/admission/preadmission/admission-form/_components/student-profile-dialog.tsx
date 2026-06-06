'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentProfileView } from '@/hooks/admission/admissionForm';
import { Title } from '@radix-ui/react-dialog';
import { User, X } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentProfileDialog({ isOpen, onClose, amstId, asmclId, asmsId }: { isOpen: boolean; onClose: () => void; amstId: number; asmclId: number; asmsId: number }) {
    const { data: applicationFormDetails, isLoading, error } = useStudentProfileView(amstId, asmclId, asmsId);

    const data = applicationFormDetails?.data || {};
    
    // Fallback to array structures based on new JSON
    const viewStudentDetails = data.viewstudentdetails?.[0] || {};
    const viewStudentJoinedDetails = data.viewstudentjoineddetails?.[0] || {};
    const studentList = data.studentList?.[0] || {};
    const studentList1 = data.studentList1?.[0] || {};
    const guardians = data.viewstudentguardiandetails?.[0] || {};

    const profilePic = viewStudentDetails?.amsT_Photoname || viewStudentDetails?.photoUrl || '';
    const studentName = [viewStudentDetails?.amsT_FirstName, viewStudentDetails?.amsT_MiddleName, viewStudentDetails?.amsT_LastName].filter(Boolean).join(' ') || viewStudentDetails?.studentName || 'N/A';

    return (
        <AdaptiveDialog
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            showCloseButton={false}
            className="max-h-[95vh] w-[95vw] max-w-[1400px] overflow-hidden p-0 gap-0 border-0"
        >
            <Title className="sr-only">STUDENT DETAILS</Title>
            <div className="flex items-center justify-between bg-[#1f4e79] text-white px-6 py-3 rounded-t-lg">
                <h2 className="font-bold text-lg uppercase tracking-wide">STUDENT DETAILS</h2>
                <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <AdaptiveBody className="flex max-h-[85vh] overflow-hidden p-0 bg-slate-50 rounded-b-lg">
                {isLoading ? (
                    <div className="flex w-full items-center justify-center p-10 h-64">
                        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="flex w-full items-center justify-center p-10 text-red-500">
                        Failed to load student details
                    </div>
                ) : (
                    <div className="flex w-full flex-col md:flex-row h-full">
                        {/* Left Sidebar */}
                        <div className="w-full md:w-1/4 border-r bg-white p-6 shadow-sm overflow-y-auto">
                            <div className="flex flex-col items-center mb-6">
                                <div className="h-32 w-32 overflow-hidden rounded-md border-2 border-gray-200 bg-gray-100 shadow-sm">
                                    {profilePic ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profilePic} alt="Student" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <User className="h-16 w-16" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2 flex items-center gap-2">
                                STUDENT DETAILS : <User className="h-4 w-4 text-green-600" fill="currentColor" />
                            </h3>

                            <div className="space-y-3 text-sm">
                                <p className="font-bold text-gray-900">{studentName}</p>
                                <p><span className="font-semibold text-gray-900">Admission No. :</span> {viewStudentDetails?.amsT_AdmNo || 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Date Of Admission :</span> {viewStudentDetails?.amsT_Date ? format(new Date(viewStudentDetails?.amsT_Date), 'dd/MM/yyyy') : 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Date Of Birth :</span> {viewStudentDetails?.amsT_DOB ? format(new Date(viewStudentDetails?.amsT_DOB), 'dd/MM/yyyy') : 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Admitted Year :</span> {viewStudentJoinedDetails?.asmaY_Year || 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Admitted Class :</span> {viewStudentJoinedDetails?.asmcL_ClassName || 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Gender :</span> {viewStudentDetails?.amsT_Sex || 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Mobile :</span> {viewStudentDetails?.amsT_MobileNo || 'N/A'}</p>
                                <p><span className="font-semibold text-gray-900">Email :</span> {viewStudentDetails?.amsT_emailId || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="w-full md:w-3/4 p-6 overflow-y-auto bg-slate-50">
                            <Tabs defaultValue="academic" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent flex-wrap gap-1">
                                    <TabsTrigger value="academic" className="rounded-t-sm rounded-b-none border-b-0 data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white text-[#1f4e79] bg-white px-6 py-2.5 font-semibold transition-colors">
                                        Academic Details
                                    </TabsTrigger>
                                    <TabsTrigger value="address" className="rounded-t-sm rounded-b-none border-b-0 data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white text-[#1f4e79] bg-white px-6 py-2.5 font-semibold transition-colors">
                                        Address/Parents Details
                                    </TabsTrigger>
                                    <TabsTrigger value="attendance" className="rounded-t-sm rounded-b-none border-b-0 data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white text-[#1f4e79] bg-white px-6 py-2.5 font-semibold transition-colors">
                                        Attendance Details
                                    </TabsTrigger>
                                    <TabsTrigger value="subject" className="rounded-t-sm rounded-b-none border-b-0 data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white text-[#1f4e79] bg-white px-6 py-2.5 font-semibold transition-colors">
                                        Subject Details
                                    </TabsTrigger>
                                    <TabsTrigger value="library" className="rounded-t-sm rounded-b-none border-b-0 data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white text-[#1f4e79] bg-white px-6 py-2.5 font-semibold transition-colors">
                                        Library Details
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6 bg-white p-4 shadow-sm rounded-md border">
                                    <TabsContent value="academic" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="flex gap-8 items-start">
                                            <div className="flex items-center text-blue-600 font-medium">
                                                <span>{studentList?.ASMAY_Year || 'N/A'}</span>
                                                <div className="ml-4 h-4 w-4 rounded-full border-2 border-green-500 bg-white" />
                                            </div>
                                            <div className="border-l-2 border-gray-200 pl-4 space-y-2 text-sm text-gray-700">
                                                <p>Class / Section : {studentList?.ASMCL_ClassName || 'N/A'} / {studentList?.ASMC_SectionName || 'N/A'}</p>
                                                <p>Roll No. : {data.viewstudentacademicyeardetails?.[0]?.amaY_RollNo || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="address" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-900 border-b pb-1">FATHER DETAILS</h4>
                                                <div className="flex justify-between items-start text-sm">
                                                    <div className="space-y-2">
                                                        <p><span className="font-semibold">Name :</span> {[viewStudentDetails?.amsT_FatherName, viewStudentDetails?.amsT_FatherSurname].filter(Boolean).join(' ') || 'N/A'}</p>
                                                        <p><span className="font-semibold">Mobile :</span> {viewStudentDetails?.amsT_FatherMobleNo || 'N/A'}</p>
                                                        <p><span className="font-semibold">Email :</span> {viewStudentDetails?.amsT_FatheremailId || 'N/A'}</p>
                                                    </div>
                                                    <div className="h-20 w-16 border bg-gray-100 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                                        {viewStudentDetails?.ansT_FatherPhoto ? <img src={viewStudentDetails.ansT_FatherPhoto} alt="Father" className="h-full w-full object-cover" /> : 'Photo'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-900 border-b pb-1">MOTHER DETAILS</h4>
                                                <div className="flex justify-between items-start text-sm">
                                                    <div className="space-y-2">
                                                        <p><span className="font-semibold">Name :</span> {[viewStudentDetails?.amsT_MotherName, viewStudentDetails?.amsT_MotherSurname].filter(Boolean).join(' ') || 'N/A'}</p>
                                                        <p><span className="font-semibold">Mobile :</span> {viewStudentDetails?.amsT_MotherMobileNo || 'N/A'}</p>
                                                        <p><span className="font-semibold">Email :</span> {viewStudentDetails?.amsT_MotherEmailId || 'N/A'}</p>
                                                    </div>
                                                    <div className="h-20 w-16 border bg-gray-100 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                                        {viewStudentDetails?.ansT_MotherPhoto ? <img src={viewStudentDetails.ansT_MotherPhoto} alt="Mother" className="h-full w-full object-cover" /> : 'Photo'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t">
                                                <h4 className="font-bold text-gray-900 border-b pb-1">PERMANENT ADDRESS</h4>
                                                <div className="text-sm text-blue-800 space-y-1">
                                                    <p>{studentList1?.PermanentAddress || viewStudentDetails?.amsT_PerStreet || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t">
                                                <h4 className="font-bold text-gray-900 border-b pb-1">COMMUNICATION ADDRESS</h4>
                                                <div className="text-sm text-blue-800 space-y-1">
                                                    <p>{studentList1?.ContactAddress || viewStudentDetails?.amsT_ConStreet || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="attendance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="flex gap-8 items-start">
                                            <div className="flex items-center text-blue-600 font-medium">
                                                <span>{studentList?.ASMAY_Year || 'N/A'}</span>
                                                <div className="ml-4 h-4 w-4 rounded-full border-2 border-green-500 bg-white" />
                                            </div>
                                            <div className="border-l-2 border-gray-200 pl-4 space-y-2 text-sm text-gray-700">
                                                <p className="font-bold text-blue-700">CURRENT YEAR</p>
                                                <p>Class / Section : {studentList?.ASMCL_ClassName || 'N/A'} / {studentList?.ASMC_SectionName || 'N/A'}</p>
                                                <p>Present Days : {studentList?.PRESENTDAYS ?? 'N/A'}</p>
                                                <p>Working Days : {studentList?.WORKINGDAYS ?? 'N/A'}</p>
                                                <p>Percentage : {studentList?.PERCENTAGE ? `${studentList.PERCENTAGE}%` : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="subject" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <table className="w-full text-sm text-left border">
                                            <thead className="bg-blue-600 text-white">
                                                <tr>
                                                    <th className="px-4 py-2 border-r font-semibold text-center w-16">Sl.No</th>
                                                    <th className="px-4 py-2 border-r font-semibold text-center">Subject Name</th>
                                                    <th className="px-4 py-2 font-semibold text-center w-24">Elective</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.viewstudentsubjectdetails?.length > 0 ? (
                                                    data.viewstudentsubjectdetails.map((item: any, i: number) => (
                                                        <tr key={i} className="border-b hover:bg-gray-50">
                                                            <td className="px-4 py-2 border-r text-center text-blue-800 font-medium">{i + 1}</td>
                                                            <td className="px-4 py-2 border-r text-blue-800 font-medium uppercase">{item?.ismS_SubjectName || item?.name || 'N/A'}</td>
                                                            <td className="px-4 py-2 text-center text-red-500 font-bold">✖</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No subject details available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </TabsContent>

                                    <TabsContent value="library" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="flex flex-col min-h-[250px]">
                                            <div className="flex-1 pt-8 flex justify-center items-start">
                                                <div className="flex items-center gap-4">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Academic Year:<span className="text-red-500">*</span>
                                                    </label>
                                                    <select className="border border-purple-600 rounded px-3 py-1.5 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white">
                                                        <option value="">--Select--</option>
                                                        {data.viewstudentacademicyeardetails?.map((ay: any) => (
                                                            <option key={ay.asmaY_Id} value={ay.asmaY_Id}>{ay.asmaY_Year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="bg-[#e9ecef] p-3 flex justify-end border-t mt-auto">
                                                <button type="button" onClick={onClose} className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors shadow-sm">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                )}
            </AdaptiveBody>
        </AdaptiveDialog>
    );
}
