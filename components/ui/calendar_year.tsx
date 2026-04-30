'use client';

import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarYear({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    // Cast to any: v9 DayPicker props are a discriminated union based on `mode`,
    // so `selected` doesn't exist on all branches at the type level.
    const selected = (props as any).selected;

    // Helper to derive an initial month from `selected` (Date | Date[] | Range)
    const getInitialMonthFromSelected = (): Date => {
        const sel = selected;
        if (!sel) return props.month || new Date();

        if (sel instanceof Date) return sel;

        if (Array.isArray(sel) && sel.length > 0 && sel[0] instanceof Date) return sel[0];

        if (typeof sel === 'object' && 'from' in sel && sel.from instanceof Date) return sel.from;

        return props.month || new Date();
    };

    // Reference to track the current displayed month
    const [currentMonth, setCurrentMonth] = React.useState<Date>(getInitialMonthFromSelected());

    // Update the internal month state when the `month` prop or `selected` prop changes
    React.useEffect(() => {
        if (props.month) {
            setCurrentMonth(props.month);
            return;
        }

        const next = getInitialMonthFromSelected();
        if (next) setCurrentMonth(next);
    }, [props.month, selected]);

    // Range of years to show in the year dropdown
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        // v9: endMonth replaces toDate
        const endYear = props.endMonth ? props.endMonth.getFullYear() : currentYear;
        const startYear = endYear - 50;

        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }, [props.endMonth]);

    // Handle year change
    const handleYearChange = (year: string) => {
        const newYear = Number.parseInt(year);
        const newDate = new Date(currentMonth);
        newDate.setFullYear(newYear);

        setCurrentMonth(newDate);
        props.onMonthChange?.(newDate);
    };

    // Custom month change handler to update our internal state
    const handleMonthChange = (month: Date) => {
        setCurrentMonth(month);
        props.onMonthChange?.(month);
    };

    return (
        <div className='relative'>
            {/* Calendar Container */}
            <div className={cn('overflow-hidden rounded-md border bg-popover shadow-md', 'flex w-auto flex-col', className)}>
                {/* Year Selector */}
                <div className='flex justify-end px-2 pt-1 pb-0'>
                    <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className='h-6 w-20 px-2 text-xs focus:ring-0'>
                            <SelectValue>{currentMonth.getFullYear()}</SelectValue>
                        </SelectTrigger>
                        <SelectContent position='popper' sideOffset={4} className='max-h-40'>
                            <ScrollArea className='h-40'>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()} className='py-1 text-xs'>
                                        {year}
                                    </SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>

                {/* Main Calendar */}
                <DayPicker
                    showOutsideDays={showOutsideDays}
                    className={cn('p-1 py-2', className)}
                    classNames={{
                        // v9 classNames
                        months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
                        month_caption: 'flex justify-center pt-0 relative items-center',  // was: caption
                        caption_label: 'text-xs font-medium',
                        dropdowns: cn('flex justify-between gap-1', props.captionLayout === 'dropdown' && 'w-full'), // was: caption_dropdowns
                        nav: 'space-x-1 flex items-center',
                        button_previous: cn(buttonVariants({ variant: 'outline' }), 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'), // was: nav_button + nav_button_previous
                        button_next: cn(buttonVariants({ variant: 'outline' }), 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'),    // was: nav_button + nav_button_next
                        month_grid: 'w-full border-collapse space-y-1', // was: table
                        weekdays: 'flex',                               // was: head_row
                        weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]', // was: head_cell
                        week: 'flex w-full mt-1',                      // was: row
                        day: 'text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20', // was: cell
                        day_button: cn(buttonVariants({ variant: 'ghost' }), 'h-7 w-8 p-0 font-normal aria-selected:opacity-100'), // was: day
                        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground', // was: day_selected
                        today: 'bg-accent text-accent-foreground',     // was: day_today
                        outside: 'text-muted-foreground opacity-50',   // was: day_outside
                        disabled: 'text-muted-foreground opacity-50',  // was: day_disabled
                        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground', // was: day_range_middle
                        hidden: 'invisible',                           // was: day_hidden
                        ...classNames
                    }}
                    components={{
                        // v9: single Chevron replaces IconLeft + IconRight
                        Chevron: ({ orientation }) => {
                            if (orientation === 'left') return <ChevronLeft className='h-3 w-3' />;
                            return <ChevronRight className='h-3 w-3' />;
                        },
                        // v9: Dropdown with options array (not children)
                        Dropdown: ({ value, onChange, options }) => {
                            const handleChange = (val: string) => {
                                const changeEvent = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>;
                                onChange?.(changeEvent);
                            };
                            const selectedOption = options?.find((opt) => opt.value === value);
                            return (
                                <Select value={value?.toString()} onValueChange={handleChange}>
                                    <SelectTrigger className='h-6 pr-1.5 text-xs focus:ring-0'>
                                        <SelectValue>{selectedOption?.label}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent position='popper' sideOffset={4} className='max-h-40'>
                                        <ScrollArea className='h-40'>
                                            {options?.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value?.toString() ?? ''}
                                                    disabled={option.disabled}
                                                    className='py-1 text-xs'>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </ScrollArea>
                                    </SelectContent>
                                </Select>
                            );
                        }
                    }}
                    month={currentMonth}
                    onMonthChange={handleMonthChange}
                    {...props}
                />
            </div>
        </div>
    );
}
CalendarYear.displayName = 'Calendar Year';

export { CalendarYear };
