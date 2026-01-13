import { getBifurcationConstraintsDetails } from '@/server/timetable/constraints/bifurcationconstraints';
import BifurcationConstraints from './_components/bifurcation-constraints';

export default async function BifurcationConstraintsPage() {
    let initialData = null;
    try {
        initialData = await getBifurcationConstraintsDetails(10);
    } catch (error: any) {
        console.error('Failed to load bifurcation constraints:', error);
        initialData = {
            success: false,
            message: error?.message || 'Failed to load bifurcation constraints',
            detailslist: []
        };
    }

    return <BifurcationConstraints initialData={initialData} />;
}
