'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getSubjectWiseDetails, getSubjectWiseReport } from '@/server/timetable/reports/subjectwisett';
import { Download, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import SubjectWiseForm from './_components/subjectwise-form';

export default function SubjectWiseReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [periodList, setPeriodList] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getSubjectWiseDetails({});
                if (data) {
                    // Map API response to expected form props
                    setInitialData({
                        acaYear: data.year,
                        classDrp: data.clsdrp,
                        subjectDrp: data.subdrp
                    });
                } else {
                    setError('No data received from server.');
                }
            } catch (error: any) {
                //console.error('Error fetching initial details', error);
                setError(error.message || 'Failed to fetch report details.');
            }
        };
        fetchDetails();
    }, []);

    const handleFormSubmit = async (payload: any) => {
        setLoading(true);
        setError(null);
        try {
            // Temporary static data as requested by user
            const mockPeriodList = [
                { ttmP_Id: 1, ttmP_PeriodName: '1' },
                { ttmP_Id: 2, ttmP_PeriodName: '2' },
                { ttmP_Id: 3, ttmP_PeriodName: '3' },
                { ttmP_Id: 4, ttmP_PeriodName: '4' },
                { ttmP_Id: 5, ttmP_PeriodName: '5' },
                { ttmP_Id: 6, ttmP_PeriodName: '6' },
                { ttmP_Id: 7, ttmP_PeriodName: '7' },
                { ttmP_Id: 8, ttmP_PeriodName: '8' },
                { ttmP_Id: 9, ttmP_PeriodName: '9' },
            ];

            const sampleContent = [
                '6th :DIVISION D :SudhaL :Kannada',
                '9th :DIVISION A :NishaSouz :Kannada && 9th :DIVISION B :NishaSouz && 7th :DIVISION D :RoseMary',
                '10th :DIVISION A :NishaSouz :Kannada && 10th :DIVISION B :NishaSouz && 10th :DIVISION C :NishaSouz && 10th :DIVISION D :NishaSouz',
                '7th :DIVISION A :RoseMary :Kannada && 7th :DIVISION B :NishaSouz && 6th :DIVISION A :SudhaL',
                '7th :DIVISION C :RoseMary :Kannada && 6th :DIVISION C :SudhaL && 5th :DIVISION B :RoseMary',
                '9th :DIVISION C :NishaSouz :Kannada && 9th :DIVISION D :NishaSouz && 5th :DIVISION C :RoseMary',
                '5th :DIVISION A :SudhaL :Kannada',
                '8th :DIVISION C :NishaSouz :Kannada && 6th :DIVISION B :RoseMary && 5th :DIVISION D :SudhaL',
                '8th :DIVISION D :NishaSouz :Kannada && 5th :DIVISION A :SudhaL',
                '8th :DIVISION C :NishaSouz :Kannada && 5th :DIVISION C :RoseMary && 5th :DIVISION D :SudhaL'
            ];

            const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
            const mockRows = days.map((day) => {
                const cells = mockPeriodList.map((_) => {
                    // Randomly decide if a cell should be empty (30% chance) or filled
                    const shouldBeEmpty = Math.random() < 0.3;
                    const content = shouldBeEmpty ? '' : sampleContent[Math.floor(Math.random() * sampleContent.length)];
                    return { content, color: 'black' };
                });
                return { dayName: day, cells };
            });

            const processedList: any[] = [];
            setPeriodList(mockPeriodList);

            payload.subarray.forEach((sub: any) => {
                processedList.push({
                    header: sub.ismS_SubjectName,
                    periodList: mockPeriodList.map((p) => ({
                        ped_name: p.ttmP_PeriodName,
                        is_break: false
                    })),
                    rows: mockRows
                });
            });

            setReportData(processedList);
            /*
            const response = await getSubjectWiseReport(payload);
            processReportData(response, payload.subarray);
            */
        } catch (error: any) {
            setError(error.message || 'Failed to generate report.');
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setReportData([]);
        setError(null);
    };

    const processReportData = (data: any, selectedSubjects: any[]) => {
        if (!data.tt || data.tt.length === 0) {
            setError('No TimeTable generated for the selected details.');
            setReportData([]);
            return;
        }

        const processedList: any[] = [];
        const periodList = data.periodslst || [];
        setPeriodList(periodList);
        const gridWeeks = data.gridweeks || [];
        const timetable = data.tt || [];

        // Iterate through each selected subject
        selectedSubjects.forEach((sub: any) => {
            const tableRows: any[] = [];

            gridWeeks.forEach((day: any) => {
                const rowCells: any[] = [];
                periodList.forEach((period: any) => {
                    // Find timetable entry
                    let cellContent = '';
                    const cellColor = 'black';

                    const entries = timetable.filter(
                        (t: any) => t.ttmP_Id === period.ttmP_Id && t.ttmD_Id === day.ttmD_Id && t.ismS_Id === sub.ismS_Id
                    );

                    if (entries.length > 0) {
                        cellContent = entries
                            .map((t: any) => `${t.asmcL_ClassName} : ${t.asmC_SectionName} : ${t.staffName} : ${t.ismS_SubjectName}`)
                            .join(' && ');
                    }

                    rowCells.push({
                        ped_id: period.ttmP_Id,
                        ped_name: period.ttmP_PeriodName,
                        content: cellContent,
                        color: cellColor
                    });
                });
                tableRows.push({ dayName: day.ttmD_DayName, cells: rowCells });
            });

            processedList.push({
                header: sub.ismS_SubjectName,
                periodList: periodList.map((p: any) => ({
                    ped_name: p.ttmP_PeriodName,
                    is_break: false // Default false for subject wise unless break data is available
                })),
                rows: tableRows
            });
        });

        setReportData(processedList);
    };

    const handlePrint = () => {
        if (!componentRef.current) return;

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) return;

        const content = componentRef.current.innerHTML;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Subject Wise TimeTable Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #7e22ce; }
                        th, td { border: 1px solid #9ca3af; padding: 8px; text-align: center; font-size: 12px; }
                        th { background-color: #7e22ce; color: white; font-weight: bold; }
                        td.day-cell { color: #9333ea; font-weight: 500; }
                        h3 { text-align: center; color: #15803d; margin-bottom: 10px; font-size: 20px; }
                        .no-print { display: none; }
                        .page-break-after-always { page-break-after: always; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleExport = () => {
        if (componentRef.current) {
            const wb = XLSX.utils.book_new();

            reportData.forEach((table, idx) => {
                const headerRow = ['Day / Period', ...table.periodList.map((p: any) => (p.is_break ? 'Break' : `Period ${p.ped_name}`))];

                const sheetData = [headerRow];

                table.rows.forEach((row: any) => {
                    const rowData = [row.dayName, ...row.cells.map((c: any) => c.content)];
                    sheetData.push(rowData);
                });

                const ws = XLSX.utils.aoa_to_sheet(sheetData);
                let sheetName = table.header.substring(0, 31).replace(/[:\/\\?*\[\]]/g, '');
                if (sheetName.length === 0) sheetName = `Sheet ${idx + 1}`;

                let suffix = 1;
                const originalName = sheetName;
                while (wb.SheetNames.includes(sheetName)) {
                    sheetName = `${originalName.substring(0, 28)}_${suffix}`;
                    suffix++;
                }

                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });

            XLSX.writeFile(wb, 'SubjectWiseTimeTable.xlsx');
        }
    };

    return (
        <div className='container space-y-4 p-1'>
            <CollapsibleSection title='Subject Wise TimeTable Report' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <SubjectWiseForm initialData={initialData} onSubmit={handleFormSubmit} onCancel={handleCancel} />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='no-print flex items-center justify-between bg-gray-50 px-4 py-2 text-sm'>
                        <span style={{ fontSize: '15px', fontWeight: '300' }}></span>
                        <div className='flex items-center gap-3'>
                            <Button onClick={handlePrint} size='sm' className='bg-purple-600 hover:bg-blue-700'>
                                <Printer className='mr-2 h-4 w-4' /> Print
                            </Button>

                            <Button
                                onClick={handleExport}
                                size='sm'
                                variant='outline'
                                className='gap-2 border-green-600 text-green-700 hover:bg-green-50'>
                                <Download className='h-4 w-4' />
                                Export Excel
                            </Button>
                        </div>
                    </div>

                    <div className='mt-6 space-y-12 bg-white p-4' ref={componentRef}>
                        {reportData.map((table, idx) => (
                            <div key={idx} className='page-break-after-always overflow-x-auto'>
                                <h3 className='mb-4 text-center font-bold text-green-700 text-xl'>{table.header}</h3>
                                <table className='w-full border-collapse border-2 border-purple-700'>
                                    <thead>
                                        <tr className='bg-purple-700 text-white'>
                                            <th className='border border-purple-700 px-2 py-3'>Day / Period</th>
                                            {table.periodList?.map((p: any, pIdx: number) => (
                                                <th key={pIdx} className='border border-purple-700 px-2 py-3'>
                                                    {p.is_break ? 'Break' : `Period ${p.ped_name}`}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.rows?.map((row: any, rIdx: number) => (
                                            <tr key={rIdx} className='hover:bg-gray-50'>
                                                <td
                                                    className='day-cell border border-gray-400 px-2 py-2 text-center font-medium text-purple-600'
                                                    style={{ minWidth: '120px' }}>
                                                    {row.dayName}
                                                </td>
                                                {row.cells?.map((cell: any, cIdx: number) => (
                                                    <td
                                                        key={cIdx}
                                                        className='border border-gray-400 p-2 text-center text-sm'
                                                        style={{ color: cell.color, minWidth: '120px' }}>
                                                        {cell.content}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
