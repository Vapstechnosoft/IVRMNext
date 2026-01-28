'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterCompetitionLevelSchema } from '@/schemas/sports/masters/competition-level';
import { saveMasterCompetitionLevel } from '@/server/sports/masters/competition-level';
import { useMasterCompetitionLevels } from '@/hooks/sports/useMasterCompetitionLevels';
import type { IMasterCompetitionLevel } from '@/types/sports/masters/competition-level';

interface AddMasterCompetitionLevelFormProps {
    selectedRow?: IMasterCompetitionLevel;
    onSuccess?: () => void;
}

export default function AddMasterCompetitionLevelForm({
    selectedRow,
    onSuccess
}: AddMasterCompetitionLevelFormProps) {
    const { refetchAll } = useMasterCompetitionLevels();

    return (
        <GenericForm<IMasterCompetitionLevel, (typeof masterCompetitionLevelSchema)['addOrUpdate']>
            schema={masterCompetitionLevelSchema.addOrUpdate}
            initialValues={{
                spccmcL_Id: selectedRow?.spccmcL_Id ?? 0,
                spccmcL_CompitionLevel: selectedRow?.spccmcL_CompitionLevel ?? '',
                spccmcL_CLDesc: selectedRow?.spccmcL_CLDesc ?? '',
                spccmcL_ActiveFlag: selectedRow?.spccmcL_ActiveFlag ?? true
            }}
            onSubmit={async (values) => {
                const response = await saveMasterCompetitionLevel(values);

                if (response?.success) {
                    await refetchAll();
                    onSuccess?.();
                }
            }}
            mode={selectedRow ? 'edit' : 'create'}
            successMessage={`Level ${selectedRow ? 'updated' : 'added'} successfully`}
            errorMessage={`Failed to ${selectedRow ? 'update' : 'add'} level`}
            onSuccess={onSuccess}
            className='space-y-4'
        >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField
                    name='spccmcL_CompitionLevel'
                    label='Competition Level Name'
                    placeholder='Enter Competition Level Name...'
                    required
                />

                <GenericTextAreaField
                    name='spccmcL_CLDesc'
                    label='Competition Description'
                    placeholder='Enter Competition Description...'
                    required
                />
            </div>
        </GenericForm>
    );
}
