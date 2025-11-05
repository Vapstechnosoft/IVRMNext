'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Power, PowerOff, Trash2 } from 'lucide-react';

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
    buttons = { edit: true, delete: false, toggle: false },
    onEdit,
    onDelete,
    onToggle,
    toggleConditionKey = 'active_flag',
    className = '',
    size = 'sm',
    variant = 'ghost'
}: ActionButtonsProps) {
    const activeValues = new Set([1, true]);

    const isActive = activeValues.has(rowData?.[toggleConditionKey]);

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
                                className='group h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-blue-50 hover:text-blue-600'>
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
                            <div className='flex items-center gap-2 rounded-md px-2 py-1 transition-all duration-200 hover:bg-gray-50'>
                                <div className='flex cursor-default items-center gap-1'>
                                    {isActive ? (
                                        <Power className='h-3 w-3 text-green-600' />
                                    ) : (
                                        <PowerOff className='h-3 w-3 text-red-500' />
                                    )}
                                    <span className={`font-medium text-xs ${isActive ? 'text-green-700' : 'text-red-600'}`}>
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
                                className='group h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-600'>
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
