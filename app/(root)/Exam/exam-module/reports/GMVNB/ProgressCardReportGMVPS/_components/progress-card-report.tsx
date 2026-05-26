'use client';

import { Button } from '@/components/ui/button';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface Props {
    reportData: IExamReportCard[];
    subjects: ISubject[];
    headerInfo: {
        mI_name?: string;
        yr?: string;
        cla?: string;
        sec?: string;
        exmmid?: string;
    };
    examName: string;
    examCode: string;
    year: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
}

export default function ProgressCardReport({ reportData, institution, subjects, headerInfo, examName, examCode, year, onPrint }: Props) {
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
        } catch {
            return 'N/A';
        }
    };

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #progress-card-print-area,
                    #progress-card-print-area * {
                        visibility: visible !important;
                    }
                    #progress-card-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break-after {
                        page-break-after: always !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    .table-bordered {
                        border: 1px solid black !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                    }
                    .bg-gray {
                        background-color: #BABABA !important;
                        -webkit-print-color-adjust: exact;
                    }
                }

                .report-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                .margin-top-10 { margin-top: 10px; }
                .margin-top-15 { margin-top: 15px; }
                .margin-top-100 { margin-top: 100px; }
                .padding-8 { padding: 8px; }
            `}</style>

            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='progress-card-print-area' className='report-container'>
                {reportData.map((report, index) => (
                    <div key={report.amsT_Id + index} className='report-page mb-8 bg-white p-4'>
                        {/* Header Image */}
                        <div className='mb-4 w-full text-center'>
                            <Image
                                src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg'
                                alt='School Header'
                                width={800}
                                height={150}
                                className='mx-auto h-auto w-full'
                                unoptimized
                            />
                        </div>

                        {/* Student Details Section */}
                        <div className='mb-6 grid grid-cols-12 gap-4'>
                            <div className='col-span-9 space-y-1'>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Name</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>{report.amsT_FirstName}</div>
                                </div>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Admission No</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>{report.amsT_AdmNo}</div>
                                </div>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Class & Section</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>
                                        {report.asmcL_ClassName} - {report.asmC_SectionName}
                                    </div>
                                </div>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Date of Birth</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>{formatDate(report.amsT_DOB)}</div>
                                </div>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Mother's Name</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>{report.amsT_MotherName}</div>
                                </div>
                                <div className='grid grid-cols-12'>
                                    <div className='col-span-4 font-bold'>Father's Name</div>
                                    <div className='col-span-1'>:</div>
                                    <div className='col-span-7 font-bold'>{report.amsT_FatherName}</div>
                                </div>
                            </div>
                            <div className='col-span-3 text-right'>
                                {report.amsT_Photoname ? (
                                    <img
                                        src={report.amsT_Photoname}
                                        alt='Student'
                                        style={{ width: '120px', height: '120px', border: '1px solid black', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            border: '1px solid black',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                        Photo
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Exam Title */}
                        <div className='mb-4 text-center'>
                            <h3 className='font-bold text-xl uppercase'>
                                {examName} - {year}
                            </h3>
                        </div>

                        {/* Marks Table */}
                        <table className='table-custom mb-6'>
                            <thead>
                                <tr>
                                    <th rowSpan={2} style={{ width: '50px' }}>
                                        SL No
                                    </th>
                                    <th colSpan={2} rowSpan={2}>
                                        SUBJECT
                                    </th>
                                    <th colSpan={4}>{examName}</th>
                                </tr>
                                <tr>
                                    <th>MAXIMUM MARK</th>
                                    <th>MINIMUM MARKS</th>
                                    <th>MARKS OBTAINED</th>
                                    <th>GRADE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.sub_list.map((mark, i) => {
                                    const subject = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                    if (!subject) return null;

                                    const isAbsent = mark.estmpS_PassFailFlg === 'AB';

                                    return (
                                        <tr key={mark.ismS_Id}>
                                            <td>{i + 1}</td>
                                            <td colSpan={2} className='pl-4 text-left font-bold'>
                                                {subject.ismS_SubjectName}
                                            </td>
                                            <td>{mark.estmpS_MaxMarks}</td>
                                            <td>{mark.estmpS_MinMarks}</td>
                                            <td>{isAbsent ? 'AB' : mark.estmpS_ObtainedMarks}</td>
                                            <td>{mark.estmpS_ObtainedGrade}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Scholastic Grading Scale */}
                        {/* <div className="mb-6">
                            <h4 className="text-center font-bold underline mb-2">SCHOLASTIC GRADING SCALE</h4>
                            <table className="table-custom">
                                <thead>
                                    <tr className="font-bold">
                                        <td>Grade</td>
                                        <td>A1</td><td>A2</td><td>B1</td><td>B2</td><td>C1</td><td>C2</td><td>D</td><td>E</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-bold">Mark</td>
                                        <td>91-100</td><td>81-90</td><td>71-80</td><td>61-70</td><td>51-60</td><td>41-50</td><td>33-40</td><td>0-32</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}

                        {/* Student Performance Index (Graph Placeholder) */}
                        {/* <div className="mb-6 text-center">
                            <h4 className="font-bold underline mb-4">STUDENT PERFORMANCE INDEX</h4>
                            <div className="flex justify-center">
                                {report.studentdetailsgraph && report.studentdetailsgraph[0]?.ImagePath ? (
                                    <img src={report.studentdetailsgraph[0].ImagePath} alt="Performance Graph" style={{ maxWidth: '500px', height: 'auto' }} />
                                ) : (
                                    <div className="h-40 w-80 border border-dashed border-gray-400 flex items-center justify-center text-gray-500">
                                        Performance Index Graph
                                    </div>
                                )}
                            </div>
                        </div> */}

                        {/* Page Break for longer reports */}
                        {/* <div className="page-break-after"></div> */}

                        {/* Co-Scholastic Activities */}
                        {/* <div className="mb-6 mt-8">
                            <h4 className="text-center font-bold underline mb-4">CO-SCHOLASTIC ACTIVITIES</h4>
                            {report.activity_main_list_area?.map((acti, i) => (
                                <div key={i} className="mb-4">
                                    <h5 className="text-center font-bold mb-2">{acti.ECACT_SkillName}</h5>
                                    <table className="table-custom">
                                        <thead>
                                            <tr className="bg-gray font-bold">
                                                <th className="text-left pl-4">Particulars</th>
                                                <th>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.getstudentwiseactiviteslist
                                                ?.filter((grade: any) => grade.ECACT_Id === acti.ECACT_Id)
                                                .map((grade: any, j: number) => (
                                                    <tr key={j}>
                                                        <td className="text-left pl-4 font-bold">{grade.ECACTA_SkillArea}</td>
                                                        <td>{grade.EMGD_Name}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div> */}

                        {/* Health Status */}
                        {/* <div className="mb-6">
                            <h4 className="text-center font-bold underline mb-2">Health Status</h4>
                            <table className="table-custom">
                                <thead>
                                    <tr className="font-bold">
                                        <th>Height (in cm)</th>
                                        <th>Weight (in Kg)</th>
                                        <th>Blood Group</th>
                                        <th>Dental Hygiene</th>
                                        <th>Vision (Right & Left)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.strudentwisedentalandvision?.map((hv: any, i: number) => (
                                        <tr key={i}>
                                            <td>{hv.SPCCSHW_Height}</td>
                                            <td>{hv.SPCCSHW_Weight}</td>
                                            <td>{hv.AMST_BloodGroup}</td>
                                            <td>{hv.HMDNHY_DentalHygiene}</td>
                                            <td>{hv.HMVSN_VisionHygiene}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> */}

                        {/* Attendance Details */}
                        {/* <div className="mb-8">
                            <h4 className="text-center font-bold underline mb-2 uppercase">Attendance Details</h4>
                            <table className="table-custom">
                                <tbody>
                                    <tr>
                                        <th className="bg-gray text-center font-bold">Total number of <br /> working days</th>
                                        <td style={{ width: '100px' }} className="font-bold">
                                            {report.stud_work_attendence?.[0]?.TotalSchoolDays || ''}
                                        </td>
                                        <th className="bg-gray text-center font-bold">Number of days <br /> attended</th>
                                        <td style={{ width: '100px' }} className="font-bold">
                                            {report.stud_present_attendence?.[0]?.TotalPresentDays || ''}
                                        </td>
                                        <th className="bg-gray text-center font-bold">Attendance <br /> Percentage</th>
                                        <td style={{ width: '100px' }} className="font-bold">
                                            {report.stud_present_attendence?.[0]?.Total_Percentage || ''}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}

                        {/* Signatures Section */}
                        <div className='mt-20'>
                            <div className='mb-4 grid grid-cols-3 gap-4'>
                                <div className='text-left'>
                                    <img
                                        src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg'
                                        alt='Principal Signature'
                                        style={{ width: '150px' }}
                                    />
                                </div>
                                <div />
                                <div />
                            </div>
                            <div className='grid grid-cols-3 gap-4 text-sm'>
                                <div className='pl-4 text-left font-bold'>Principal’s Signature</div>
                                <div className='text-center font-bold'>Institution Seal</div>
                                <div className='pr-4 text-right'>
                                    <span className='font-bold'>Class Teacher’s Signature</span>
                                    <br />
                                    <span className='font-bold'>Date: {new Date().toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Final Page Break */}
                        {index < reportData.length - 1 && <div className='page-break-after' />}
                    </div>
                ))}
            </div>
        </>
    );
}
