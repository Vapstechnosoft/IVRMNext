'use client';

import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type DatePickerYearProps = React.ComponentProps<typeof DayPicker> & {
    onSelect?: (date: Date | undefined) => void;
};

/**
 * Date Picker Component with Direct Year Selection
 * This component displays a calendar with a clickable year selector in the header
 * allowing users to directly select the year without navigating month by month.
 */
function DatePickerWithYear({ className, classNames, showOutsideDays = true, ...props }: DatePickerYearProps) {
    const selected = (props as any).selected;
    // State to track the current displayed month
    const [currentMonth, setCurrentMonth] = React.useState<Date>(props.month || new Date());

    // Update the internal month state when the prop changes
    React.useEffect(() => {
        if (props.month) {
            setCurrentMonth(props.month);
        }
    }, [props.month]);

    // Update the currentMonth state when the selected date changes
    React.useEffect(() => {
        if (selected) {
            if (selected instanceof Date) {
                setCurrentMonth(selected);
            } else if (Array.isArray(selected) && selected.length > 0 && selected[0] instanceof Date) {
                setCurrentMonth(selected[0]);
            } else if (typeof selected === 'object' && 'from' in selected && (selected as any).from instanceof Date) {
                setCurrentMonth((selected as any).from);
            }
        }
    }, [selected]);

    // Range of years to show in the year dropdown (1950 to 50 years in the future)
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        // v9: endMonth replaces toDate
        const endYear = props.endMonth ? props.endMonth.getFullYear() : currentYear + 50;
        const startYear = Math.max(1950, currentYear - 100);

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
                {/* Main Calendar */}
                <DayPicker
                    showOutsideDays={showOutsideDays}
                    className={cn('p-1 py-2', className)}
                    classNames={{
                        // v9 classNames
                        months: 'flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0',
                        month_caption: 'flex justify-center pt-2 pb-1 relative items-center gap-2', // was: caption
                        caption_label: 'text-sm font-medium',
                        dropdowns: 'flex justify-between gap-1',       // was: caption_dropdowns
                        nav: 'space-x-1 flex items-center',
                        button_previous: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'), // was: nav_button + nav_button_previous
                        button_next: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'),    // was: nav_button + nav_button_next
                        month_grid: 'w-full border-collapse space-y-1', // was: table
                        weekdays: 'flex',                               // was: head_row
                        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]', // was: head_cell
                        week: 'flex w-full mt-2',                      // was: row
                        day: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20', // was: cell
                        day_button: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100'), // was: day
                        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground', // was: day_selected
                        today: 'bg-accent text-accent-foreground',     // was: day_today
                        outside: 'text-muted-foreground opacity-50',   // was: day_outside
                        disabled: 'text-muted-foreground opacity-50',  // was: day_disabled
                        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground', // was: day_range_middle
                        hidden: 'invisible',                           // was: day_hidden
                        ...classNames
                    }}
                    components={{
                        // v9: single Chevron component replaces IconLeft + IconRight
                        Chevron: ({ orientation }) => {
                            if (orientation === 'left') return <ChevronLeft className='h-4 w-4' />;
                            return <ChevronRight className='h-4 w-4' />;
                        },
                        // v9: CaptionLabel → MonthCaption (custom year selector in header)
                        MonthCaption: ({ calendarMonth }) => {
                            return (
                                <div className='flex items-center justify-center gap-2'>
                                    <span className='text-sm font-medium'>{format(calendarMonth.date, 'MMMM')}</span>
                                    {/* Inline year selector */}
                                    <Select
                                        value={currentMonth.getFullYear().toString()}
                                        onValueChange={handleYearChange}>
                                        <SelectTrigger className='h-auto w-auto px-2 py-1 text-sm font-medium cursor-pointer border-0 bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20'>
                                            <SelectValue className='font-medium'>{currentMonth.getFullYear()}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent position='popper' sideOffset={4} className='max-h-60 w-28'>
                                            <ScrollArea className='h-60'>
                                                {[...years].reverse().map((year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year.toString()}
                                                        className='py-2 text-sm cursor-pointer'>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        }
                    }}
                    month={currentMonth}
                    onMonthChange={handleMonthChange}
                    {...props}
                    onDayClick={(day, modifiers, e) => {
                        // Call the original onDayClick if provided
                        if (props.onDayClick) {
                            props.onDayClick(day, modifiers, e);
                        } else if (props.onSelect) {
                            props.onSelect(day as any);
                        }
                    }}
                />
            </div>
        </div>
    );
}

DatePickerWithYear.displayName = 'DatePickerWithYear';

export { DatePickerWithYear };
