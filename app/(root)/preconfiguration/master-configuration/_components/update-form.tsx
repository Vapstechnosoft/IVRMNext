'use client';

import { Spinner } from '@/components/ui/spinner';
import { useMasterConfigurationEdit } from '@/hooks/preconfiguration/useMasterConfiguration';
import type { IMasterConfiguration, IMasterConfigurationResponse } from '@/types/preconfiguration/master-configuration';
import MasterConfigurationForm from './add-form';
import { useEffect, useState } from 'react';

export default function UpdateMasterConfigurationForm({
    selectedRow,
    response,
    onSuccess
}: {
    selectedRow: IMasterConfiguration;
    response: IMasterConfigurationResponse | undefined;
    onSuccess: () => void;
}) {
    const { data: editData, isLoading, error } = useMasterConfigurationEdit(selectedRow.ispaC_Id);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (editData?.mstConfigList?.[0]) {
            const config = editData.mstConfigList[0];
            
            // Map the selected category back for the UI
            let amC_Id;
            let amcoC_Id;

            if (editData.mI_SchoolCollegeFlag === 'S') {
                const selectedCat = editData.studentlicategorylist?.find(c => c.amC_Id === config.amC_Id);
                amC_Id = selectedCat?.amC_Id;
            } else {
                const selectedCat = editData.studentlicategorylist?.find(c => c.amcoC_Id === config.amcoC_Id);
                amcoC_Id = selectedCat?.amcoC_Id;
            }

            setInitialData({
                ...config,
                amC_Id,
                amcoC_Id,
                // Ensure flags are mapped correctly to camelCase expected by form if backend returns PascalCase or different case
                ispaC_EnquiryApplFlag: config.ispaC_EnquiryApplFlag || 0,
                ispaC_EnqSMSFlag: config.ispaC_EnqSMSFlag || 0,
                ispaC_EnqMailFlag: config.ispaC_EnqMailFlag || 0,
                ispaC_ProsptFeeApp: config.ispaC_ProsptFeeApp || 0,
                ispaC_ProspectusFlag: config.ispaC_ProspectusFlag || 0,
                ispaC_ApplCutOffDateFlag: config.ispaC_ApplCutOffDateFlag || 0,
                ispaC_DOBMaxAgeFlag: config.ispaC_DOBMaxAgeFlag || 0,
                ispaC_DOBMinAgeFlag: config.ispaC_DOBMinAgeFlag || 0,
                ispaC_HostelFlag: config.ispaC_HostelFlag || 0,
                ispaC_TransaportFlag: config.ispaC_TransaportFlag || 0,
                ispaC_SibblingConcessionFlag: config.ispaC_SibblingConcessionFlag || 0,
                ispaC_ParentConcessionFlag: config.ispaC_ParentConcessionFlag || 0,
                ispaC_ECSFlag: config.ispaC_ECSFlag || 0,
                ispaC_GymFlag: config.ispaC_GymFlag || 0,
                ispaC_FatherAliveFlag: config.ispaC_FatherAliveFlag || 0,
                ispaC_MotherAliveFlag: config.ispaC_MotherAliveFlag || 0,
                ispaC_MaritalStatusFlag: config.ispaC_MaritalStatusFlag || 0,
                ispaC_RegFeeFlag: config.ispaC_RegFeeFlag || 0,
                ispaC_RegSMSFlag: config.ispaC_RegSMSFlag || 0,
                ispaC_RegMailFlag: config.ispaC_RegMailFlag || 0,
                ispaC_ApplFeeFlag: config.ispaC_ApplFeeFlag || 0,
                ispaC_ApplSMSFlag: config.ispaC_ApplSMSFlag || 0,
                ispaC_ApplMailFlag: config.ispaC_ApplMailFlag || 0,
                ispaC_Healthapp: config.ispaC_Healthapp || 0,
                ispaC_NoofApplications: config.ispaC_NoofApplications || 1,
                ispaC_ApplNoIncrementBy: config.ispaC_ApplNoIncrementBy || 0,
                ispaC_OralTestSchApplFlag: config.ispaC_OralTestSchApplFlag || 0,
                ispaC_OralTestBy: config.ispaC_OralTestBy || 0,
                ispaC_OralMarksFlag: config.ispaC_OralMarksFlag || 0,
                ispaC_OralByMax_Marks: config.ispaC_OralByMax_Marks || 0,
                ispaC_WrittenTestSchApplFlag: config.ispaC_WrittenTestSchApplFlag || 0,
                ispaC_CommonScheduleFlag: config.ispaC_CommonScheduleFlag || 0,
                ispaC_Transfer_Settings_after_payment_Flag: config.ispaC_Transfer_Settings_after_payment_Flag || 0,
                ispaC_AdmissionTransfer: config.ispaC_AdmissionTransfer || 0,
                ispaC_FeePaymentFlag: config.ispaC_FeePaymentFlag || 0,
                ispaC_Transfer_Settings_Flag: config.ispaC_Transfer_Settings_Flag || 0,
                ispaC_OfflineFee_Flag: config.ispaC_OfflineFee_Flag || 0
            });
        }
    }, [editData]);

    if (isLoading || !initialData) {
        return (
            <div className="flex justify-center p-8">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">Failed to load configuration data.</div>;
    }

    // Merge response with edit data specifically for lists if necessary
    const mergedResponse = {
        ...response,
        academicList: editData?.academicList || response?.academicList,
        studentlicategorylist: editData?.studentlicategorylist || response?.studentlicategorylist,
        mI_SchoolCollegeFlag: editData?.mI_SchoolCollegeFlag || response?.mI_SchoolCollegeFlag
    } as IMasterConfigurationResponse;

    return (
        <MasterConfigurationForm
            response={mergedResponse}
            onSuccess={onSuccess}
            initialData={initialData}
        />
    );
}
