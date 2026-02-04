'use client';

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { AlumniReportFilterForm } from "./_components/alumni-report-filter-form";
import { AlumniReportResultsTable } from "./_components/alumni-report-results-table";
import { AlumniReportPrint } from "./_components/alumni-report-print";
import { AddressBookPrint } from "./_components/address-book-print";
import { AlumniReportFormValues } from "./_components/schema";
import {
    getInitialData,
    getReportData
} from "@/server/alumni/alumni-report";
import { IAlumniReportInitialData, IAlumniReportResultItem } from "@/types/alumni/alumni-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function AlumniReportPage() {
    const [initialData, setInitialData] = useState<IAlumniReportInitialData | null>(null);
    const [reportData, setReportData] = useState<IAlumniReportResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isReportView, setIsReportView] = useState(true);
    const [showEmail, setShowEmail] = useState(true);
    const [showPhone, setShowPhone] = useState(true);

    // Printing refs
    const printRef = useRef<HTMLDivElement>(null);
    const addressBookRef = useRef<HTMLDivElement>(null);
    const [selectedForPrint, setSelectedForPrint] = useState<IAlumniReportResultItem[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await getInitialData();
            if (response.success && response.data) {
                setInitialData(response.data);
            } else {
                toast.error("Failed to load initial data");
            }
        };
        fetchInitialData();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Alumni_Report",
    });

    const handlePrintAddress = useReactToPrint({
        contentRef: addressBookRef,
        documentTitle: "Alumni_Address_Book",
    });

    const handleSubmit = async (values: AlumniReportFormValues) => {
        setLoading(true);
        setIsReportView(values.sall === 1);
        setShowEmail(values.showEmail);
        setShowPhone(values.showPhone);

        const payload = {
            occupation: values.occupation || "",
            city: values.city || "",
            statelistarray: values.stateIds?.map(id => ({ IVRMMS_Id: id })) || [],
            classlistnew: values.classIds?.map(id => ({ ASMCL_Id: id })) || [],
            countrylistarray: values.countryIds?.map(id => ({ IVRMMC_Id: id })) || [],
            districtlistarray: values.districtIds?.map(id => ({ IVRMMD_Id: id })) || [],
            multipleBatchs: values.batchIds.map(id => ({ ASMAY_Id: id }))
        };

        try {
            const response = await getReportData(payload);
            if (response.success && response.data) {
                setReportData(response.data.searchstudentDetails || []);
                if (response.data.searchstudentDetails?.length === 0) {
                    toast.info("No records found for the selected filters");
                }
            } else {
                toast.error(response.message || "Failed to fetch report data");
            }
        } catch (error) {
            toast.error("An error occurred while fetching report data");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setReportData([]);
    };

    const initiatePrint = (selected: IAlumniReportResultItem[]) => {
        setSelectedForPrint(selected);
        setTimeout(() => handlePrint(), 100);
    };

    const initiatePrintAddress = (selected: IAlumniReportResultItem[]) => {
        setSelectedForPrint(selected);
        setTimeout(() => handlePrintAddress(), 100);
    };

    if (!initialData) {
        return <div className="p-8 text-center">Loading initial data...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Alumni Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <AlumniReportFilterForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                        loading={loading}
                    />
                </CardContent>
            </Card>

            {reportData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AlumniReportResultsTable
                            data={reportData}
                            showEmail={showEmail}
                            showPhone={showPhone}
                            onPrint={initiatePrint}
                            onPrintAddressBook={initiatePrintAddress}
                            isReportView={isReportView}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Hidden Print Templates */}
            <div className="hidden">
                <AlumniReportPrint
                    ref={printRef}
                    data={selectedForPrint}
                    institutionName="VAPS TECHNOSOFT"
                />
                <AddressBookPrint
                    ref={addressBookRef}
                    data={selectedForPrint}
                />
            </div>
        </div>
    );
}

