// Force TS Server re-analysis
import { getInitialInteractions } from '@/server/staff-portal/interactions';
import { InteractionContainer } from './_components/interaction-container';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
    title: 'Interactions | Staff Portal',
    description: 'Manage and view interactions between staff and students.',
};

export default async function IVRMInteractionsPage() {
    const response = await getInitialInteractions();

    if (!response.success || !response.data) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-center text-red-600">
                        <p className="font-semibold">Failed to load interactions.</p>
                        <p className="text-sm">{response.message || 'Please check your connection and try again.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Interactions</h1>
                <p className="text-muted-foreground">Stay connected with students, teachers, and administration.</p>
            </div>
            
            <InteractionContainer initialData={response.data} />
        </div>
    );
}
