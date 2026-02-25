'use client';

import { FormProvider } from '@/components/ui/form/form-provider';
import { useConsecutive } from '@/hooks/timetable/constraints/consecutive';
import { use } from 'react';
import type { IConsecutiveConstraintList } from './_components/columns';
import ConsecutiveConstraints from './_components/consecutive-constraints';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ConsecutiveConstraintsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useConsecutive(searchParams);

    return (
        <FormProvider<IConsecutiveConstraintList>>
            <ConsecutiveConstraints response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}
