'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { blobToFile, enhanceAndConvertToWav } from '@/lib/audio-utils';
import { tableSearchVariables } from '@/lib/data-table.config';
import { exportToExcel } from '@/lib/utils';
import type { Table } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DownloadIcon, FileSpreadsheet, FileText, Mic, MicOff, Settings2, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    data: TData[];
    showExportOptions?: boolean;
    showViewOptions?: boolean;
}

export function DataTableToolbar<TData>({ table, data, showExportOptions = true, showViewOptions = true }: DataTableToolbarProps<TData>) {
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);
    const isUserInputRef = useRef(false);

    // Clear on hard refresh
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const hasSearch = urlParams.has(tableSearchVariables.search);
        if (!hasSearch) {
            setLocalSearchQuery('');
            setSearchQuery(null);
            table.setGlobalFilter('');
            table.setPageIndex(0);
        }
    }, [table, setSearchQuery]);

    // Sync URL → local input
    useEffect(() => {
        if (!isUserInputRef.current) {
            setLocalSearchQuery(searchQuery || '');
            if (!searchQuery) {
                table.setGlobalFilter('');
                table.setPageIndex(0);
            }
        }
        isUserInputRef.current = false;
    }, [searchQuery, table]);

    // Debounced local → URL + filter
    useEffect(() => {
        if (debouncedSearchQuery !== searchQuery) {
            isUserInputRef.current = true;
            setSearchQuery(debouncedSearchQuery || null);
            table.setPageIndex(0);
            table.setGlobalFilter(debouncedSearchQuery);
        }
    }, [debouncedSearchQuery, searchQuery, table, setSearchQuery]);

    const handleSearch = (term: string) => {
        isUserInputRef.current = true;
        setLocalSearchQuery(term);
    };

    const handleClearSearch = () => {
        isUserInputRef.current = true;
        setLocalSearchQuery('');
        setSearchQuery(null);
        table.setGlobalFilter('');
        table.setPageIndex(0);
    };

    // Column settings
    const anyColumnHiding = table.getAllColumns().filter((c) => typeof c.accessorFn !== 'undefined' && c.getCanHide());
    const allCols = anyColumnHiding.map((c) => c.id).join(',');
    const [searchColumns, setSearchColumns] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault(allCols)
    );
    const allSearchableColumns = anyColumnHiding.map((c) => c.id);
    const selectedSearchColumns = searchColumns ? searchColumns.split(',') : allSearchableColumns;

    const toggleSearchColumn = (colId: string, checked: boolean) => {
        const updated = checked ? [...new Set([...selectedSearchColumns, colId])] : selectedSearchColumns.filter((id) => id !== colId);
        setSearchColumns(updated.join(',') || null);
    };

    const toggleSelectAllSearchColumns = () => {
        const newCols = selectedSearchColumns.length === allSearchableColumns.length ? '' : allSearchableColumns.join(',');
        setSearchColumns(newCols || null);
    };

    // Voice Search
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                if (webmBlob.size < 1000) {
                    alert('No audio detected. Speak louder or longer.');
                    stream.getTracks().forEach((t) => t.stop());
                    setIsTranscribing(false);
                    return;
                }

                setIsTranscribing(true);
                try {
                    const wavBlob = await enhanceAndConvertToWav(webmBlob);
                    const wavFile = blobToFile(wavBlob, `voice-${Date.now()}.wav`);
                    await transcribeAudio(wavFile);
                } catch (err: unknown) {
                    console.error('Processing error:', err);
                    // Fixed: Use template literal
                    alert(`Audio processing failed: ${(err as Error).message}`);
                } finally {
                    setIsTranscribing(false);
                    stream.getTracks().forEach((t) => t.stop());
                }
            };

            recorder.start(100);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            autoStopTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            }, 5000);
        } catch (err: unknown) {
            // Fixed: Use template literal
            alert(`Microphone access denied: ${(err as Error).message}`);
        }
    };

    const stopRecording = () => {
        if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (audioFile: File) => {
        const formData = new FormData();
        formData.append('audio', audioFile);

        try {
            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Transcription failed');

            if (result.success && result.text) {
                const text = result.text.trim();
                if (text) {
                    setLocalSearchQuery(text);
                    isUserInputRef.current = true;
                    table.setGlobalFilter(text);
                    table.setPageIndex(0);
                } else {
                    alert('No speech detected.');
                }
            } else {
                throw new Error('Invalid response');
            }
        } catch (err: unknown) {
            console.error('Transcription error:', err);
            // Fixed: Use template literal
            alert(`Speech recognition failed: ${(err as Error).message}`);
        }
    };

    useEffect(() => {
        return () => {
            if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
        };
    }, []);

    // Export
    const handleExportToExcel = () => exportToExcel(data);

    const handleExportToPDF = () => {
        const doc = new jsPDF();
        const visibleColumns = table
            .getAllColumns()
            .filter((col) => col.getIsVisible())
            .map((col) => ({
                header: col.id.charAt(0).toUpperCase() + col.id.slice(1),
                dataKey: col.id
            }));

        const tableData = data.map((item: unknown) => {
            const row: Record<string, string> = {};
            visibleColumns.forEach((col) => {
                row[col.dataKey] = (item as Record<string, unknown>)[col.dataKey]?.toString() || '';
            });
            return row;
        });

        autoTable(doc, {
            columns: visibleColumns,
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { top: 20 }
        });
        doc.save('table-data.pdf');
    };

    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <div className='flex w-full items-center justify-between gap-2 overflow-auto p-0.5'>
            <div className='flex items-center gap-2'>
                <div className='relative flex items-center'>
                    <Input
                        id='table-search-input'
                        onChange={(e) => handleSearch(e.target.value)}
                        className='h-8 w-40 pr-10 lg:w-64'
                        placeholder='Search or speak...'
                        value={localSearchQuery}
                    />
                    {localSearchQuery && (
                        // Fixed: Added explicit type="button"
                        <button
                            type='button'
                            onClick={handleClearSearch}
                            className='-translate-y-1/2 absolute top-1/2 right-8 rounded-md p-1 text-gray-500 transition-colors hover:text-gray-700'
                            title='Clear search'>
                            <X className='h-4 w-4' />
                        </button>
                    )}
                    {/* Fixed: Added explicit type="button" */}
                    <button
                        type='button'
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing}
                        className={`-translate-y-1/2 absolute top-1/2 right-1 rounded-md p-1.5 transition-all duration-200 ${isRecording ? 'animate-pulse text-red-500' : 'text-gray-500 hover:text-gray-700'}
              ${isTranscribing ? 'cursor-not-allowed opacity-50' : ''}
            `}
                        title={isRecording ? 'Recording... (5s)' : 'Hold to speak'}>
                        {isTranscribing ? (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
                        ) : isRecording ? (
                            <MicOff className='h-4 w-4' />
                        ) : (
                            <Mic className='h-4 w-4' />
                        )}
                    </button>
                </div>
                {isTranscribing && <span className='animate-pulse text-blue-500 text-xs'>Transcribing...</span>}
            </div>
            <div className='flex items-center gap-2'>
                {selectedRows.length > 0 && (
                    <Button onClick={() => table.toggleAllPageRowsSelected(false)} variant='ghost' className='h-8 w-fit'>
                        <X className='h-4 w-4' />
                    </Button>
                )}
                {showExportOptions && table.getFilteredRowModel().rows.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='outline' size='sm' className='h-8 w-fit'>
                                <DownloadIcon className='mr-1 h-4 w-4' />
                                Export
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-[200px] p-2' align='end'>
                            <Button variant='ghost' className='w-full justify-start' onClick={handleExportToExcel}>
                                <FileSpreadsheet className='mr-2 h-4 w-4 text-green-500' />
                                Excel
                            </Button>
                            <Button variant='ghost' className='w-full justify-start' onClick={handleExportToPDF}>
                                <FileText className='mr-2 h-4 w-4 text-orange-500' />
                                PDF
                            </Button>
                        </PopoverContent>
                    </Popover>
                )}
                {anyColumnHiding.length > 0 && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='sm' className='hidden h-8 w-fit sm:flex'>
                                    <Settings2 className='mr-1 h-4 w-4' />
                                    Search Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-[180px]'>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        toggleSelectAllSearchColumns();
                                    }}>
                                    {selectedSearchColumns.length === allSearchableColumns.length ? 'Deselect All' : 'Select All'}
                                </DropdownMenuItem>
                                <div className='my-1 border-t' />
                                {anyColumnHiding.map((column) => {
                                    const displayName =
                                        (column.columnDef.meta as any)?.title ||
                                        column.id
                                            .split('_')
                                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                            .join(' ');
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={selectedSearchColumns.includes(column.id)}
                                            onCheckedChange={(v) => toggleSearchColumn(column.id, !!v)}>
                                            {displayName}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {showViewOptions && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' size='sm' className='hidden h-8 w-fit sm:flex'>
                                        <Settings2 className='mr-1 h-4 w-4' />
                                        View
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-[150px]'>
                                    {anyColumnHiding.map((column) => {
                                        const displayName =
                                            (column.columnDef.meta as any)?.title ||
                                            column.id
                                                .split('_')
                                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                                .join(' ');
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(v) => column.toggleVisibility(!!v)}>
                                                {displayName}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
