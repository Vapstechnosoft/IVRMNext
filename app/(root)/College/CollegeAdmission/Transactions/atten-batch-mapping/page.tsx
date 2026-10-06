import React from 'react';
import { AttenBatchMappingWrapper } from './_components/atten-batch-mapping-wrapper';

export default function AttenBatchMappingPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Batch Mapping</h1>
                <p className="text-muted-foreground">Manage attendance batches and map students to batches.</p>
            </div>
            <AttenBatchMappingWrapper />
        </div>
    );
}
