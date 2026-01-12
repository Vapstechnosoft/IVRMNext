'use client';

import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CirculationParameterForm } from './_components/circulation-parameter-form';
import { getCirculationParameterColumns } from './_components/columns';
import { useCirculationParameterGet, useCirculationParameterSave, useCirculationParameterDelete } from '@/hooks/library/transactions/useCirculationParameter';
import type { ICirculationParameterGridData } from '@/types/library/transactions/circulation-parameter';
import { CirculationParameterFormType } from '@/schemas/library/transactions/circulation-parameter.schema';


export default function CirculationParameterPage() {
    const [view, setView] = useState<'entry' | 'list'>('entry');
    const [bookFlag, setBookFlag] = useState<'BP' | 'NBP'>('BP');
    const [issuerType, setIssuerType] = useState<'STUDENT' | 'STAFF' | 'DEPARTMENT' | 'GUEST'>('STUDENT');
    const [selectedRow, setSelectedRow] = useState<ICirculationParameterGridData | null>(null);

    // Fetch Data
    const { data: response, isLoading: isFetching } = useCirculationParameterGet({
        BOOKFLAG: bookFlag,
        issuertype1: issuerType,
        LMC_CategoryName: bookFlag
    });

    const initialData = response?.success ? response.data : undefined;
    const gridData = initialData?.alldata || [];
    const schoolCollegeFlag = initialData?.mI_SchoolCollegeFlag || 'S';

    // Mutations
    const saveMutation = useCirculationParameterSave();
    const deleteMutation = useCirculationParameterDelete();

    const handleSave = (formData: CirculationParameterFormType) => {
        // Prepare Payload
        // We need to map form data to payload expected by API
        // Most fields match, but we need to ensure IDs are passed correctly

        const payload: any = { ...formData };
        payload.BOOKFLAG = bookFlag;
        // book_Flag is already in formData but checking to be safe with casing 
        payload.Catgname = formData.LMB_BookType;

        // Derive Circ_Flag based on issuer (legacy logic) - Server might need it or purely client side?
        // In legacy safe method it sets 'std', 'stf' etc. but let's send what we have.
        // The API payload interface has Circ_Flag optional. We can verify if needed.

        // Also if editing, we need to pass IDs.
        // Form `formData` should contain IDs if we set them in `reset`.

        saveMutation.mutate(payload, {
            onSuccess: (data) => {
                if (data.success) {
                    setView('list');
                    setSelectedRow(null);
                }
            }
        });
    };

    const handleEdit = (row: ICirculationParameterGridData) => {
        setSelectedRow(row);
        setView('entry');
    };

    const handleToggleStatus = (row: ICirculationParameterGridData) => {
        // Identify Parameter ID
        let paramId = 0;
        if (bookFlag === 'BP') {
            if (issuerType === 'STUDENT') paramId = row.LBCPAS_Id || 0; // or LBCPASC
            else if (issuerType === 'STAFF') paramId = row.LBCPAST_Id || 0;
            else paramId = row.LBCPAO_Id || 0;
        } else {
            if (issuerType === 'STUDENT') paramId = row.LNBCPAS_Id || 0;
            else if (issuerType === 'STAFF') paramId = row.LNBCPAST_Id || 0;
            else paramId = row.LNBCPAO_Id || 0;
        }

        deleteMutation.mutate({
            LBCPA_Id: row.LBCPA_Id,
            LNBCPA_Id: row.LNBCPA_Id,
            Parmeter_Id: paramId,
            BOOKFLAG: bookFlag,
            issuertype1: issuerType,
            MI_SchoolCollegeFlag: schoolCollegeFlag
        });
    };

    const handleCancel = () => {
        setSelectedRow(null);
        if (gridData.length > 0) {
            setView('list');
        }
    };

    const columns = getCirculationParameterColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        bookFlag,
        issuerType
    });

    return (
        <div className="space-y-4">
            <CollapsibleSection
                title="Circulation Parameter: Entry"
                isOpen={view === 'entry'}
                onToggle={() => setView(view === 'entry' ? 'list' : 'entry')}
                defaultOpen={true}
            >
                <CirculationParameterForm
                    initialData={initialData}
                    onSave={handleSave}
                    isLoading={isFetching}
                    isSaving={saveMutation.isPending}
                    bookFlag={bookFlag}
                    setBookFlag={setBookFlag}
                    issuerType={issuerType}
                    setIssuerType={setIssuerType}
                    selectedRow={selectedRow}
                    onCancel={handleCancel}
                />
            </CollapsibleSection>

            <CollapsibleSection
                title="Circulation Parameter: List"
                isOpen={view === 'list'}
                onToggle={() => setView(view === 'list' ? 'entry' : 'list')}
            >
                <GenericDataTable
                    columns={columns}
                    data={gridData}
                    isLoading={isFetching}
                    loadingMessage='Loading parameters...'
                    noDataTitle='No Parameters Found'
                />
            </CollapsibleSection>
        </div>
    );
}
