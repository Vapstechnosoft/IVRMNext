'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReportListProps {
    data: any;
    academicYearName: string;
    classNameVal: string;
    sectionNameVal: string;
    reOpenDate: Date | null;
}

export const ReportList = ({ data, academicYearName, classNameVal, sectionNameVal, reOpenDate }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `HHS01_Report_${academicYearName}_${classNameVal}_${sectionNameVal}`
    });

    const stuDetails = data?.studentDetails?.[0] || data?.stu_details?.[0] || {};
    const fillTerms = data?.terms || data?.fillterms || [];
    const fillSkills = data?.skills || data?.fillskills || [];
    const fillSkillArea = data?.skillAreas || data?.fillskillarea || [];
    const fillTermMarks = data?.skillMarks || data?.filltermmarks || [];

    // Pre-processing areas for skills
    const processedSkills = fillSkills.map((skill: any) => ({
        ...skill,
        areas: fillSkillArea.filter((area: any) => area.ecS_Id === skill.ecS_Id)
    }));

    return (
        <Card className='w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg'>
            <div className="flex justify-end mb-4">
                <Button onClick={handlePrint} className="bg-primary text-white">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>

            <CardContent>
                <div ref={reportRef} id="hhs01-print-area" className="print:p-8 p-4 bg-white text-black min-h-screen">
                    <style>{`
                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 10mm;
                            }
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            body * {
                                visibility: hidden !important;
                            }
                            #hhs01-print-area,
                            #hhs01-print-area * {
                                visibility: visible !important;
                            }
                            #hhs01-print-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                margin: 0;
                                padding: 0;
                                background: white;
                            }
                            .page-break { page-break-after: always; }
                        }
                    `}</style>

                    {/* First Page */}
                    <section className="page-break flex flex-col items-center">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-serif font-bold">Hutchings<br />High School & Junior College</h1>
                            <h4 className="text-sm mt-2">(Affiliated to the Council for the Indian School Certificate Examination, New Delhi)</h4>
                        </div>

                        <div className="my-6">
                            <img
                                src="/images/Clients/Hutchings/ProgressReports/hhlogo.png"
                                alt="Hutchings Logo"
                                className="h-[90px] w-auto object-contain mx-auto"
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/tunbridge_logo.png';
                                }}
                            />
                        </div>

                        <div className="text-center my-6">
                            <h3 className="font-bold text-lg">ACADEMIC YEAR</h3>
                            <div className="border-2 border-black py-2 px-8 mt-2 inline-block font-semibold">
                                {academicYearName}
                            </div>
                        </div>

                        <div className="mt-8 mb-12">
                            {stuDetails?.amsT_Photoname ? (
                                <img
                                    src={stuDetails.amsT_Photoname}
                                    alt="Student Photo"
                                    className="w-[120px] h-[130px] border border-gray-400 object-cover bg-white"
                                />
                            ) : (
                                <div className="w-[120px] h-[130px] border border-gray-400 flex items-center justify-center bg-gray-100 text-sm">
                                    No Photo
                                </div>
                            )}
                        </div>

                        <div className="w-full max-w-md mx-auto space-y-4">
                            <div className="flex text-lg">
                                <div className="w-32 flex-shrink-0">My Name is</div>
                                <div className="flex-grow border-b-2 border-black font-semibold text-center">{stuDetails.stuname || ''}</div>
                            </div>
                            <div className="flex text-lg">
                                <div className="w-32 flex-shrink-0">I Study in Class</div>
                                <div className="flex-grow border-b-2 border-black font-semibold text-center">{stuDetails.asmcL_ClassName || classNameVal}</div>
                            </div>
                            <div className="flex text-lg">
                                <div className="w-32 flex-shrink-0">I was born on</div>
                                <div className="flex-grow border-b-2 border-black font-semibold text-center">
                                    {stuDetails.amsT_DOB ? format(new Date(stuDetails.amsT_DOB), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-20 text-center text-sm font-semibold">
                            7, Phayre Road, Pune-411040. Tell.: 020-26352764 <br /> website: www.hutchingsschoolpune.in
                        </div>
                    </section>

                    {/* Second Page */}
                    <section className="bg-[#fff8c6] p-4 min-h-screen page-break">
                        <div className="flex justify-between items-end mb-8">
                            <div className="w-1/2">
                                {/* Placeholder for label image */}
                                <div className="h-8 bg-gray-200 mb-2"></div>
                            </div>
                            <div className="flex gap-8 px-8">
                                {fillTerms.map((term: any) => (
                                    <div key={term.ecT_Id} className="text-center">
                                        <div className="font-bold mb-2">{String(term.ecT_TermName).toUpperCase()}</div>
                                        <div className="w-16 h-8 bg-white border border-black mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {processedSkills.map((skill: any, idx: number) => (
                                <div key={skill.ecS_Id} className="w-full">
                                    <h4 className="font-bold text-lg mb-2">{skill.ecS_SkillName}</h4>

                                    <div className="flex gap-4">
                                        <div className="w-2/5">
                                            <table className="w-full">
                                                <tbody>
                                                    {skill.areas.map((area: any, index: number) => (
                                                        <tr key={area.ecsA_Id}>
                                                            <td className="py-1">
                                                                {index + 1}. &nbsp; {area.ecsA_SkillArea}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="w-3/5">
                                            <table className="w-full border-collapse border border-black bg-white">
                                                <thead>
                                                    <tr>
                                                        {fillTerms.map((term: any) => (
                                                            <th key={term.ecT_Id} className="border border-black p-2 text-center">
                                                                {term.ecT_TermName}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {skill.areas.map((area: any) => (
                                                        <tr key={area.ecsA_Id}>
                                                            {fillTerms.map((term: any) => {
                                                                const markObj = fillTermMarks.find((m: any) => m.ecT_Id === term.ecT_Id && m.ecS_Id === skill.ecS_Id && m.ecsA_Id === area.ecsA_Id);
                                                                return (
                                                                    <td key={term.ecT_Id} className="border border-black p-2 text-center h-8">
                                                                        {markObj ? markObj.ecsT_Score : ''}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 w-80">
                            <div className="flex font-bold">
                                <div className="w-40">SCHOOL REOPENS:</div>
                                <div className="border-b-2 border-black flex-grow text-center">
                                    {reOpenDate ? format(reOpenDate, 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 border-2 border-black p-4">
                            <div className="flex font-bold mb-16">
                                <div className="w-32">Promoted To</div>
                                <div className="border-b-2 border-black flex-grow max-w-[200px]"></div>
                            </div>

                            <div className="flex justify-between items-end px-4">
                                <div className="text-center w-40">
                                    <div className="border-b-2 border-black h-8 mb-2"></div>
                                    Teacher's signature
                                </div>
                                <div className="text-center w-40">
                                    <div className="border-b-2 border-black h-8 mb-2"></div>
                                    Principal's signature
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};
