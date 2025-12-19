// components/ui/data-table/data-table-toolbar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { blobToFile, enhanceAndConvertToWav } from '@/lib/audio-utils';
import { tableSearchVariables } from '@/lib/data-table.config';
import { exportToExcel } from '@/lib/utils';
import type { ColumnDef, Table } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DownloadIcon, FileSpreadsheet, FileText, Mic, MicOff, Settings2, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';

interface DataTableToolbarProps<TData, TValue> {
    table: Table<TData>;
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    showSearchColumns?: boolean;
}

export function DataTableToolbar<TData, TValue>({
    table,
    data,
    columns,
    showExportOptions = true,
    showViewOptions = true,
    showSearchColumns = false
}: DataTableToolbarProps<TData, TValue>) {
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 800);

    const isUserInputRef = useRef(false);

    // Sync URL → local input
    useEffect(() => {
        if (!isUserInputRef.current) {
            setLocalSearchQuery(searchQuery || '');
        }
        isUserInputRef.current = false;
    }, [searchQuery]);

    // Apply search to URL + table
    useEffect(() => {
        if (debouncedSearchQuery !== searchQuery) {
            isUserInputRef.current = true;
            setSearchQuery(debouncedSearchQuery || null);
            table.setGlobalFilter(debouncedSearchQuery);
            table.setPageIndex(0);
        }
    }, [debouncedSearchQuery, searchQuery, table, setSearchQuery]);

    const handleSearch = (term: string) => {
        isUserInputRef.current = true;
        setLocalSearchQuery(term);
    };

    const handleReset = () => {
        isUserInputRef.current = true;
        setLocalSearchQuery('');
        setSearchQuery(null);
        table.setGlobalFilter('');
        table.setPageIndex(0);
        table.resetColumnFilters();
        table.resetColumnVisibility();
        table.resetSorting();

        // Reset search columns to all columns
        const allCols = table
            .getAllColumns()
            .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide())
            .map((c) => c.id)
            .join(',');
        setSearchColumns(allCols || null);
    };

    // Column settings
    const hideableColumns = table.getAllColumns().filter((col) => col.getCanHide());
    const allCols = hideableColumns.map((c) => c.id).join(',');

    const [searchColumns, setSearchColumns] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault(allCols)
    );

    const selectedSearchColumns = searchColumns ? searchColumns.split(',') : [];

    const toggleSearchColumn = (colId: string, checked: boolean) => {
        const updated = checked ? [...new Set([...selectedSearchColumns, colId])] : selectedSearchColumns.filter((id) => id !== colId);
        setSearchColumns(updated.length ? updated.join(',') : null);
    };

    // Voice Search
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach((t) => t.stop());

                if (blob.size < 1000) {
                    alert('No audio detected. Please speak louder.');
                    setIsTranscribing(false);
                    return;
                }

                setIsTranscribing(true);
                try {
                    const wavBlob = await enhanceAndConvertToWav(blob);
                    const file = blobToFile(wavBlob, 'voice-search.wav');

                    const formData = new FormData(); // Fixed: was 'form'
                    formData.append('audio', file); // Fixed: was 'form.append'

                    const res = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await res.json();

                    if (res.ok && result.text?.trim()) {
                        const text = result.text.trim();
                        setLocalSearchQuery(text);
                        isUserInputRef.current = true;
                        table.setGlobalFilter(text);
                        table.setPageIndex(0);
                    } else {
                        alert('Speech not recognized. Try again.');
                    }
                } catch (err: any) {
                    console.error(err);
                    alert(`Transcription failed: ${err.message}`);
                } finally {
                    setIsTranscribing(false);
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            timeoutRef.current = setTimeout(() => stopRecording(), 2000);
        } catch (err: any) {
            alert(`Microphone access denied: ${err.message}`);
        }
    };

    const stopRecording = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Export
    const handleExportToExcel = () => exportToExcel(data);

    const handleExportToPDF = () => {
        const doc = new jsPDF();
        const visibleCols = table.getVisibleLeafColumns().map((col) => ({
            header: (col.columnDef.meta as any)?.title || col.id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            dataKey: col.id
        }));

        const rows = data.map((row: any) => {
            const obj: Record<string, string> = {};
            visibleCols.forEach((c) => {
                obj[c.dataKey] = row[c.dataKey]?.toString() || '';
            });
            return obj;
        });

        autoTable(doc, {
            head: [visibleCols.map((c) => c.header)],
            body: rows.map((r) => Object.values(r)),
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save('table-data.pdf');
    };

    return (
        <div className='flex w-full items-center justify-between gap-3 overflow-auto py-1'>
            <div className='flex items-center gap-2'>
                <div className='relative'>
                    <Input
                        placeholder='Search...'
                        value={localSearchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='h-9 w-64 pr-12'
                    />

                    {/* Mic button - hold to speak */}
                    <button
                        type='button'
                        onClick={isRecording ? stopRecording : startRecording} // ← toggle behavior
                        disabled={isTranscribing}
                        className={`-translate-y-1/2 absolute top-1/2 right-1 rounded-md p-2 transition ${isRecording ? 'animate-pulse text-red-600' : 'text-muted-foreground hover:text-foreground'}
              ${isTranscribing ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        aria-label='Hold to speak'>
                        {isTranscribing ? (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
                        ) : isRecording ? (
                            <MicOff className='h-4 w-4' />
                        ) : (
                            <Mic className='h-4 w-4' />
                        )}
                    </button>
                </div>

                {/* Reset Button */}
                {localSearchQuery && (
                    <Button onClick={handleReset} variant='ghost' className='h-8 w-fit'>
                        <X className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                )}

                {isTranscribing && <span className='text-blue-600 text-sm'>Transcribing...</span>}
            </div>

            <div className='flex items-center gap-2'>
                {/* Export */}
                {showExportOptions && table.getFilteredRowModel().rows.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='outline' size='sm'>
                                <DownloadIcon className='mr-2 h-4 w-4' />
                                Export
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-48 p-1' align='end'>
                            <Button variant='ghost' size='sm' className='w-full justify-start' onClick={handleExportToExcel}>
                                <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                                Excel
                            </Button>
                            <Button variant='ghost' size='sm' className='w-full justify-start' onClick={handleExportToPDF}>
                                <FileText className='mr-2 h-4 w-4 text-orange-600' />
                                PDF
                            </Button>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Search In Columns */}
                {hideableColumns.length > 0 && showSearchColumns && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='sm'>
                                <Settings2 className='mr-2 h-4 w-4' />
                                Search In
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <span onClick={() => setSearchColumns(allCols || null)}>
                                    {selectedSearchColumns.length === hideableColumns.length ? 'Deselect All' : 'Select All'}
                                </span>
                            </DropdownMenuItem>
                            <div className='my-1 border-t' />
                            {hideableColumns.map((column) => {
                                const title =
                                    (column.columnDef.meta as any)?.title ||
                                    column.id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={selectedSearchColumns.includes(column.id)}
                                        onCheckedChange={(checked) => toggleSearchColumn(column.id, checked)}>
                                        {title}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* View Columns */}
                {showViewOptions && hideableColumns.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='sm'>
                                <Settings2 className='mr-2 h-4 w-4' />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            {hideableColumns.map((column) => {
                                const title =
                                    (column.columnDef.meta as any)?.title ||
                                    column.id.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(v) => column.toggleVisibility(!!v)}>
                                        {title}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
