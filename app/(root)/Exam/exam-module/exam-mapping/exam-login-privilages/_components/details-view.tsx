// 'use client';

// import { Heading } from '@/components/layout/heading';
// import { Button } from '@/components/ui/button';
// import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
// import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
// import { useExamLoginPrivileges } from '@/hooks/exam/exammodule/exam-login'; // hook to fetch login privileges
// import type { IExamLoginPrivilege } from '@/types/exam/exam-module/exam-login';
// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import ToggleExamLoginPrivilegeForm from './details-toggle-form'; // toggle form component
// import { ExamLoginPrivilegesColumns } from './exam-login-privileges-columns'; // table columns

// interface ExamLoginPrivilegesPageProps {
//     rowData: { classId: number; className: string }; // parent row info
//     onClose: () => void;
// }

// export default function ExamLoginPrivilegesPage({ rowData, onClose }: ExamLoginPrivilegesPageProps) {
//     return (
//         <FormProvider<IExamLoginPrivilege>>
//             <ExamLoginPrivilegesPageContent rowData={rowData} onClose={onClose} />
//         </FormProvider>
//     );
// }

// function ExamLoginPrivilegesPageContent({
//     rowData,
//     onClose
// }: {
//     rowData: { classId: number; className: string };
//     onClose: () => void;
// }) {
//     const [details, setDetails] = useState<IExamLoginPrivilege[]>([]);
//     const [loading, setLoading] = useState(false);

//     const { data: response, isLoading, error, refetch } = useExamLoginPrivileges(rowData?.classId);

//     // -------------------------
//     // Set Details When API Responds
//     // -------------------------
//     useEffect(() => {
//         if (!rowData?.classId) return;
//         if (!response) return;

//         try {
//             const apiResponse = response as unknown as {
//                 success: boolean;
//                 message: string;
//                 data: IExamLoginPrivilege[];
//             };

//             const data = apiResponse?.data || [];
//             setDetails(data);
//         } catch (err: any) {
//             toast.error(err?.message || 'Failed to parse Exam Login Privileges');
//         }
//     }, [rowData?.classId, response]);

//     // -------------------------
//     // Data table setup
//     // -------------------------
//     const tableProps = useDataTableProps({
//         data: details,
//         total: details.length,
//         pageIndex: 0,
//         pageSize: 10
//     });

//     // -------------------------
//     // Render
//     // -------------------------
//     return (
//         <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
//             <div className='relative mx-auto w-[80%] rounded-2xl bg-white p-6 shadow-xl'>
//                 {/* Header */}
//                 <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
//                     <div className='space-y-1'>
//                         <Heading
//                             title={`Exam Login Privileges ${rowData.className ? `- ${rowData.className}` : ''}`}
//                             description={`View all login privileges for class "${rowData.className}"`}
//                         />
//                     </div>
//                     <div className='flex gap-2'>
//                         <Button
//                             type='button'
//                             variant='secondary'
//                             onClick={onClose}
//                             className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
//                             Close
//                         </Button>
//                     </div>
//                 </div>

//                 <GenericDataTable<IExamLoginPrivilege>
//                     {...tableProps}
//                     columns={ExamLoginPrivilegesColumns}
//                     isLoading={loading || isLoading}
//                     noDataTitle='No Privileges Found'
//                     noDataDescription='No login privileges are set for this class.'
//                     errorTitle='Error Loading Details'
//                     showViewOptions={false}
//                     columnPinning={{ right: ['actions'] }}
//                 />

//                 <FormSections />
//             </div>
//         </div>
//     );
// }

// // -------------------------
// // Form Sections (Toggle)
// // -------------------------
// export function FormSections() {
//     const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<IExamLoginPrivilege>();

//     return (
//         <>
//             {/* Toggle Form */}
//             {isToggleFormOpen && selectedRow && <ToggleExamLoginPrivilegeForm rowData={selectedRow} onClose={closeToggleForm} />}
//         </>
//     );
// }
