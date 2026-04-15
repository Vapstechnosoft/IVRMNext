import { useLabConstraintsDetails } from '@/hooks/timetable/constraints/labconstraints';
import LabConstraints from './_components/lab-constraints';

export const dynamic = 'force-dynamic';

export default async function LabConstraintsPage() {
    let initialData = null;
    try {
        initialData = await useLabConstraintsDetails();
    } catch (error: any) {
        initialData = {
            success: false,
            message: error?.message || 'Failed to load details',
            labconstraintslist: []
        };
    }

    return <LabConstraints initialData={initialData} />;
}
