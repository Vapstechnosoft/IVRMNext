'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { getConsolidatedReport, getConsolidatedReportDetails } from '@/server/timetable/reports/consolidated';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import ConsolidatedForm from './_components/consolidated-form';
import ConsolidatedReportGrid from './_components/consolidated-report-grid';

export default function ConsolidatedReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [fullReportResponse, setFullReportResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');
    const [institution, setInstitution] = useState<any>(null);
    const [admfigLogo, setAdmfigLogo] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getConsolidatedReportDetails({});
                console.log('Consolidated Report Details Response:', response);
                if (response?.success && response.data) {
                    console.log('Consolidated Report Details Data Keys:', Object.keys(response.data));
                    setInitialData(response.data);
                }
            } catch (error) {
                console.error('Error fetching consolidated report details:', error);
            }
        };

        const fetchInstitutionData = async () => {
            try {
                const instRes = await getMasterInstitution();
                if (instRes?.success && instRes.data) {
                    setInstitution(instRes.data);
                }
            } catch (error) {
                console.error('Error fetching master institution details:', error);
            }
        };

        // Load logo from localStorage if available (admfigsettings)
        if (typeof window !== 'undefined') {
            try {
                const admfigsettingsStr = localStorage.getItem('admfigsettings');
                if (admfigsettingsStr) {
                    const parsed = JSON.parse(admfigsettingsStr);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].asC_Logo_Path) {
                        setAdmfigLogo(parsed[0].asC_Logo_Path);
                    }
                }
            } catch (err) {
                console.error('Error loading logo from admfigsettings:', err);
            }
        }

        fetchDetails();
        fetchInstitutionData();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Consolidated_Report_${reportType || 'Report'}`,
        pageStyle: `
            @page {
                size: landscape;
                margin: 8mm;
            }
            @media print {
                html, body {
                    visibility: visible !important;
                    background: #fff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .printable-content,
                .printable-content * {
                    visibility: visible !important;
                }
                .no-print {
                    display: none !important;
                }
                .overflow-x-auto {
                    overflow: visible !important;
                }
                .sticky {
                    position: static !important;
                }
                .school-header-section {
                    display: block !important;
                    margin-bottom: 12px !important;
                    page-break-inside: avoid !important;
                }
                .school-header-section img {
                    max-height: 70px !important;
                    width: auto !important;
                    display: inline-block !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    page-break-inside: auto;
                }
                thead {
                    display: table-header-group !important;
                }
                tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                }
                th, td {
                    border: 1px solid #666 !important;
                    padding: 4px 6px !important;
                    font-size: 8pt !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                th {
                    background-color: #6b21a8 !important;
                    color: #fff !important;
                }
                .school-header-section table,
                .school-header-section th,
                .school-header-section td {
                    border: none !important;
                    background: transparent !important;
                    color: inherit !important;
                    padding: 0 !important;
                }
            }
        `
    });

    const handleFormSubmit = async (payload: any) => {
        console.log('Report Payload:', payload);

        if (payload.CLEAR) {
            setReportData([]);
            setFullReportResponse(null);
            setAcademicYear('');
            return;
        }

        setLoading(true);
        setReportType(payload.TYPE);

        // Resolve academic year label from initialData
        const yearsList = initialData?.acayear || initialData?.academiclist || [];
        const matchedYear = yearsList.find(
            (y: any) => String(y.asmaY_Id || y.ASMAY_Id) === String(payload.ASMAY_Id)
        );
        if (matchedYear) {
            setAcademicYear(matchedYear.asmaY_Year || matchedYear.ASMAY_Year || '');
        }

        try {
            const response: any = await getConsolidatedReport(payload);

            console.log('Consolidated Report Response:', response);

            if (response?.success) {
                const actualData = response.data || response;

                setFullReportResponse(actualData);

                const data =
                    actualData.finaltable || actualData.griddata || actualData.reportdata || (Array.isArray(actualData) ? actualData : []);

                setReportData(data);

                if (!data || data.length === 0) {
                    toast.info(actualData?.message);
                }
            } else {
                toast.error(response?.message);
            }
        } catch (error: any) {
            console.error(error?.message);
            toast.error(error?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Consolidated Report' defaultOpen={true}>
                <ConsolidatedForm initialData={initialData} onSubmit={handleFormSubmit} />
            </CollapsibleSection>

            {loading && (
                <div className='flex items-center justify-center p-12'>
                    <RefreshCw className='h-8 w-8 animate-spin text-purple-600' />
                    <span className='ml-3 font-medium text-lg text-purple-800'>Processing Report Data...</span>
                </div>
            )}

            {reportData.length > 0 && !loading && (
                <CollapsibleSection title={`${reportType.replace('_', ' ')} Consolidated Report`} defaultOpen={true}>
                    <div className='printable-content p-2 print:p-4' ref={componentRef}>
                        <ConsolidatedReportGrid
                            reportData={reportData}
                            fullResponse={fullReportResponse}
                            onPrint={handlePrint}
                            reportType={reportType}
                            initialData={initialData}
                            institution={institution}
                            admfigLogo={admfigLogo}
                            academicYear={academicYear}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
