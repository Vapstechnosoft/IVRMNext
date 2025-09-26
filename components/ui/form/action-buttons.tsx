'use client';

import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types for the component props
interface ActionButtonsProps {
    rowData: any;
    buttons: {
        edit?: boolean;
        delete?: boolean;
        toggle?: boolean;
    };
    onEdit?: (data: any) => void;
    onDelete?: (data: any) => void;
    onToggle?: (data: any, newState: boolean) => void;
    toggleConditionKey?: string;
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'ghost' | 'outline';
}

export function ActionButtons({
    rowData,
    buttons = { edit: true, delete: true, toggle: false },
    onEdit,
    onDelete,
    onToggle,
    toggleConditionKey = 'active_flag',
    className = '',
    size = 'sm',
    variant = 'ghost'
}: ActionButtonsProps) {
    const isActive = rowData?.[toggleConditionKey];

    const handleEdit = () => {
        if (onEdit) {
            onEdit(rowData);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(rowData);
        }
    };

    const handleToggle = (checked: boolean) => {
        if (onToggle) {
            onToggle(rowData, checked);
        }
    };

    return (
        <TooltipProvider>
            <div className={`flex items-center gap-1 ${className}`}>
                {/* Edit Button */}
                {buttons.edit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleEdit}
                                className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-110 group'>
                                <Edit className='h-4 w-4 transition-transform duration-200 group-hover:rotate-12' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Toggle Switch */}
                {buttons.toggle && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-50 transition-all duration-200'>
                                <div className='flex items-center gap-1 cursor-default'>
                                    {isActive ? (
                                        <Power className='h-3 w-3 text-green-600' />
                                    ) : (
                                        <PowerOff className='h-3 w-3 text-red-500' />
                                    )}
                                    <span className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-red-600'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={handleToggle}
                                    className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-400'
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isActive ? 'Deactivate' : 'Activate'}</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Delete Button */}
                {buttons.delete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleDelete}
                                className='h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-110 group'>
                                <Trash2 className='h-4 w-4 transition-transform duration-200 group-hover:rotate-12' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
