import { type ClassValue, clsx } from 'clsx';
import { add, addDays, differenceInSeconds, format, parse } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function exportToExcel(data: any, name?: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${name === null ? 'data' : name}.xlsx`);
}

export function safeNumber(value: any) {
    return Number.isNaN(Number(value)) ? 0 : Number(value);
}

// Helper function to get month name and date range
export function getMonthInfo(monthsBack: number) {
    const now = new Date();

    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    const targetMonth = currentMonth - monthsBack;
    const targetDate = new Date(Date.UTC(currentYear, targetMonth, 1));

    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth();

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    return {
        key: monthNames[month].toLowerCase(),
        label: monthNames[month],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };
}

export function numberToWords(num: number) {
    let number = num;
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (number === 0) return 'Zero';

    const convertLessThanOneThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${units[n % 10]}` : '');
        return `${units[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` and ${convertLessThanOneThousand(n % 100)}` : ''}`;
    };

    const parts = [];
    if (Math.floor(number / 10000000) > 0) {
        parts.push(`${convertLessThanOneThousand(Math.floor(number / 10000000))} Crore`);
        number %= 10000000;
    }
    if (Math.floor(number / 100000) > 0) {
        parts.push(`${convertLessThanOneThousand(Math.floor(number / 100000))} Lakh`);
        number %= 100000;
    }
    if (Math.floor(number / 1000) > 0) {
        parts.push(`${convertLessThanOneThousand(Math.floor(number / 1000))} Thousand`);
        number %= 1000;
    }
    if (number > 0) {
        parts.push(convertLessThanOneThousand(number));
    }

    return `${parts.join(' ')} Rupees Only`;
}

export const formatDBDate = (dateString: Date | null | undefined) => {
    if (dateString === undefined || dateString === null) return 'N.A';
    try {
        const dateWithOffset = add(new Date(dateString), { hours: 5, minutes: 30 });
        return format(dateWithOffset, 'dd-MMM-yyyy hh:mm a');
    } catch (error) {
        return 'N.A';
    }
};

// Helper function to convert time string (HH:MM:SS or HH:MM) to minutes for comparison
export const timeToMinutes = (timeString: string | null | undefined): number => {
    if (!timeString || timeString.trim() === '') {
        return 0;
    }
    const timeParts = timeString.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    return hours * 60 + minutes;
};

// Helper function to format time for display
export const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString || timeString.trim() === '') {
        return '--:--:--';
    }
    return timeString; // Assuming it's already in HH:MM:SS format
};

export const getDuration = (start: string, end: string): string => {
    if (!start || !end) return '00:00:00';

    const startDate = parse(start, 'HH:mm:ss', new Date());
    let endDate = parse(end, 'HH:mm:ss', new Date());

    // If end time is before start time, add 1 day (overnight shift)
    if (endDate <= startDate) {
        endDate = addDays(endDate, 1);
    }

    const totalSeconds = differenceInSeconds(endDate, startDate);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
