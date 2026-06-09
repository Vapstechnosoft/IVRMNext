'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { IGeneralConfiguration } from '@/types/preconfiguration/general-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GenConfigDataTableProps {
    data: IGeneralConfiguration[];
    isLoading: boolean;
}

export function GenConfigDataTable({ data, isLoading }: GenConfigDataTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings Grid View</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable<IGeneralConfiguration, any>
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    totalItems={data.length}
                />
            </CardContent>
        </Card>
    );
}
