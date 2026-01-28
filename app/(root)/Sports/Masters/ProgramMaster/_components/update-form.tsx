'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterProgramSchema } from '@/schemas/sports/masters/program';
import { saveMasterProgram } from '@/server/sports/masters/program';
import type { IMasterProgram } from '@/types/sports/masters/program';

interface UpdateMasterProgramFormProps {
    selectedRow: IMasterProgram;
    onSuccess?: () => void;
}

export default function UpdateMasterProgramForm({ selectedRow, onSuccess }: UpdateMasterProgramFormProps) {
    return (
        <GenericForm<IMasterProgram, (typeof masterProgramSchema)['addOrUpdate']>
            schema={masterProgramSchema.addOrUpdate}
            initialValues={selectedRow}
            onSubmit={async (values) => {
                await saveMasterProgram(values);
            }}
            mode='edit'
            successMessage='Record Updated Successfully'
            errorMessage='Failed to update record'
            onSuccess={onSuccess}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField name='spccpM_Name' label='Program Name' placeholder='Enter Program Name' required />
                <GenericTextAreaField
                    name='spccpM_Description'
                    label='Program Description'
                    placeholder='Enter Program Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
