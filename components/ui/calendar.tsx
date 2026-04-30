'use client';

import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    // Get the initial month from the selected prop safely
    const getInitialMonth = (): Date | undefined => {
        // Cast to any: v9 DayPicker props are a discriminated union based on `mode`,
        // so `selected` doesn't exist on all branches at the type level.
        const { selected } = props as any;
        if (!selected) return undefined;

        if (selected instanceof Date) {
            return selected;
        }

        if (Array.isArray(selected) && selected.length > 0 && selected[0] instanceof Date) {
            return selected[0];
        }

        // Handle date ranges
        if (typeof selected === 'object' && 'from' in selected && selected.from instanceof Date) {
            return selected.from;
        }

        return undefined;
    };

    // Set the month to display
    const [month, setMonth] = React.useState<Date | undefined>(getInitialMonth());

    // Update month when selected date changes
    React.useEffect(() => {
        const newMonth = getInitialMonth();
        if (newMonth) {
            setMonth(newMonth);
        }
    }, [(props as any).selected]);

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            month={month}
            onMonthChange={setMonth}
            classNames={{
                // v9 classNames (renamed from v8)
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month_caption: 'flex justify-center pt-1 relative items-center',      // was: caption
                caption_label: 'text-sm font-medium',
                dropdowns: cn('flex justify-between gap-1', props.captionLayout === 'dropdown' && 'w-full'), // was: caption_dropdowns
                nav: 'space-x-1 flex items-center',
                button_previous: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'), // was: nav_button + nav_button_previous
                button_next: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'),    // was: nav_button + nav_button_next
                month_grid: 'w-full border-collapse space-y-1',  // was: table
                weekdays: 'flex',                                  // was: head_row
                weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]', // was: head_cell
                week: 'flex w-full mt-2 first:justify-end',       // was: row
                day: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20', // was: cell
                day_button: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100'), // was: day
                selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground', // was: day_selected
                today: 'bg-accent text-accent-foreground',        // was: day_today
                outside: 'text-muted-foreground opacity-50',      // was: day_outside
                disabled: 'text-muted-foreground opacity-50',     // was: day_disabled
                range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground', // was: day_range_middle
                hidden: 'invisible',                               // was: day_hidden
                ...classNames
            }}
            components={{
                // v9: single Chevron component replaces IconLeft + IconRight
                Chevron: ({ orientation, ...rest }) => {
                    if (orientation === 'left') return <ChevronLeft className='h-4 w-4' />;
                    return <ChevronRight className='h-4 w-4' />;
                },
                // v9: Dropdown component for captionLayout="dropdown"
                Dropdown: ({ value, onChange, options }) => {
                    const handleChange = (val: string) => {
                        const changeEvent = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
                        onChange?.(changeEvent);
                    };
                    const selectedOption = options?.find((opt) => opt.value === value);
                    return (
                        <Select value={value?.toString()} onValueChange={handleChange}>
                            <SelectTrigger className='pr-1.5 focus:ring-0'>
                                <SelectValue>{selectedOption?.label}</SelectValue>
                            </SelectTrigger>
                            <SelectContent position='popper'>
                                <ScrollArea className='h-80'>
                                    {options?.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value?.toString() ?? ''}
                                            disabled={option.disabled}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    );
                }
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
