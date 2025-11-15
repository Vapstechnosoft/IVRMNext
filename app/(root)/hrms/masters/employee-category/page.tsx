'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApiSearchparams } from '@/types';
import { Award, Building2, Layers, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

import DepartmentTab from './_components/department-tab';
import DesignationTab from './_components/designation-tab';
// Import the tab components
import EmployeeTypeTab from './_components/employee-type-tab';
import GradeTab from './_components/grade-tab';
import GroupTypeTab from './_components/group-type-tab';

type TabType = 'employee-type' | 'group-type' | 'department' | 'designation' | 'grade';

interface Tab {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    component: React.ComponentType;
}

const tabs: Tab[] = [
    {
        id: 'employee-type',
        label: 'Master Employee Type',
        icon: <Users className='h-4 w-4' />,
        component: EmployeeTypeTab
    },
    {
        id: 'group-type',
        label: 'Master Group Type',
        icon: <Layers className='h-4 w-4' />,
        component: GroupTypeTab
    },
    {
        id: 'department',
        label: 'Master Department',
        icon: <Building2 className='h-4 w-4' />,
        component: DepartmentTab
    },
    {
        id: 'designation',
        label: 'Master Designation',
        icon: <Award className='h-4 w-4' />,
        component: DesignationTab
    },
    {
        id: 'grade',
        label: 'Master Grade',
        icon: <Trophy className='h-4 w-4' />,
        component: GradeTab
    }
];

export default function EmployeeCategoryManagementPage() {
    const [activeTab, setActiveTab] = useState<TabType>('employee-type');

    const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || EmployeeTypeTab;

    return (
        <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
            <div className='container space-y-6 p-6'>
                {/* Tab Navigation */}
                <div className='rounded-t-lg border-border/40 border-b bg-card/50 backdrop-blur-sm'>
                    <div className='flex space-x-1 overflow-x-auto p-2'>
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'default' : 'ghost'}
                                size='sm'
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap transition-all duration-200',
                                    activeTab === tab.id ? 'shadow-md' : 'hover:bg-muted/50'
                                )}>
                                {tab.icon}
                                <span className='hidden sm:inline'>{tab.label}</span>
                                <span className='sm:hidden'>{tab.label.replace('Master ', '')}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className='rounded-lg border border-border/40 bg-card/50 p-4 shadow-lg backdrop-blur-sm'>
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
}
