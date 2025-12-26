'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExamCategoryReportFormValues, examCategoryReportSchema } from '@/schemas/exam/exam-module/reports';
import { getInitialData, getReportData } from '@/server/exam/exam-module/reports/exam-category-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveAs } from 'file-saver';
import { Check, FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ExamCategoryReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [yearDropdown, setYearDropdown] = useState<any[]>([]);
    const [classDropdown, setClassDropdown] = useState<any[]>([]);

    // Grid flags and data
    const [gridFlag, setGridFlag] = useState(false);
    const [finalDetailsList, setFinalDetailsList] = useState<any[]>([]);
    const [institutionDetails, setInstitutionDetails] = useState<any>(null);
    const [searchValue, setSearchValue] = useState('');

    const [reportHeader, setReportHeader] = useState('');

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ExamCategoryReportFormValues>({
        resolver: zodResolver(examCategoryReportSchema),
        defaultValues: {
            type: '1',
            asmaY_Id: '',
            emcA_Id: ''
        }
    });

    const typeValue = watch('type');
    const selectedYearId = watch('asmaY_Id');
    const selectedCategoryId = watch('emcA_Id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getInitialData();
                setYearDropdown(data.yearlist);
                setClassDropdown(data.grlist);

                const defaultYear = data.yearlist.find((y: any) => y.Selected)?.asmaY_Id;
                if (defaultYear) setValue('asmaY_Id', String(defaultYear));
            } catch (error) {
                console.error('Error fetching initial data', error);
                toast.error('Failed to load initial data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [setValue]);

    // Handle Type Change logic
    useEffect(() => {
        setGridFlag(false);
        setFinalDetailsList([]);
        if (typeValue === '1') {
            setValue('emcA_Id', '');
        }
    }, [typeValue, setValue]);

    // Handle Dropdown Change logic
    useEffect(() => {
        setGridFlag(false);
    }, [selectedYearId, selectedCategoryId]);

    const onSubmit = async (data: ExamCategoryReportFormValues) => {
        try {
            setGridFlag(false);
            const response = await getReportData({
                type: data.type,
                ASMAY_Id: data.asmaY_Id,
                EMCA_Id: data.emcA_Id
            });

            if (response.studentAttendanceList && response.studentAttendanceList.length > 0) {
                const students = response.studentAttendanceList;
                const masterinst = response.masterinstitution ? response.masterinstitution[0] : {};
                setInstitutionDetails(masterinst);

                // Processing logic matching the Angular controller
                const recivedamtarray1: any[] = [];
                const recivedamtarray2: any[] = [];
                // const recivedamtarray3: any[] = []; // Not mainly used in loop logic but present in original

                // Get Unique Categories
                students.forEach((t3: any) => {
                    if (!recivedamtarray1.some((rt) => rt.emcA_Id === t3.emcA_Id)) {
                        recivedamtarray1.push({ emcA_Id: t3.emcA_Id, emcA_CategoryName: t3.emcA_CategoryName });
                    }
                });

                // Get Unique Groups
                students.forEach((t3: any) => {
                    if (!recivedamtarray2.some((rt) => rt.emG_Id === t3.emG_Id)) {
                        recivedamtarray2.push({ emG_Id: t3.emG_Id, emG_GroupName: t3.emG_GroupName });
                    }
                });

                // Construct hierarchical list
                const details_list: any[] = [];

                recivedamtarray1.forEach((cat) => {
                    const temp_cat_grp_list = students.filter((t1: any) => t1.emcA_Id === cat.emcA_Id);

                    const cat_grp_list: any[] = [];
                    recivedamtarray2.forEach((grp) => {
                        const grp_subjs = temp_cat_grp_list.filter((t2: any) => t2.emG_Id === grp.emG_Id);

                        if (grp_subjs.length > 0) {
                            cat_grp_list.push({
                                emG_Id: grp.emG_Id,
                                emG_GroupName: grp.emG_GroupName,
                                grp_subjs: grp_subjs
                            });
                        }
                    });

                    // Rowspan is simpler here: total number of group rows + 1 (for header or spacing?)
                    // In HTML: rowspan="{{rt.cat_grp_list.length+1}}"
                    // Wait, in HTML it renders a TR for the Category initially?
                    // Tbody ng-repeat="rt in final_details_list"
                    //   Tr 1: Category Name (rowspan)
                    //   Tr ng-repeat for groups
                    // So category cell needs rowspan = cat_grp_list.length + 1? No, usually length.
                    // Let's check HTML:
                    // <td rowspan="{{rt.cat_grp_list.length+1}}">{{$index+1}}</td>
                    // <td rowspan="{{rt.cat_grp_list.length+1}}">{{rt.emcA_CategoryName}}</td>
                    // <tr ng-repeat="rt1 in rt.cat_grp_list">...</tr>
                    // Ah, the first TR is inside the tbody but the `ng-repeat` for groups is on `tr`.
                    // But inside tbody, the first `tr` contains the rowspan cells AND the first group?
                    // No, the HTML structure in the reference is:
                    // <tbody ng-repeat="rt ...">
                    //   <tr> <td rowspan>...</td> <td rowspan>...</td> </tr>   <-- This creates an empty row if not careful, OR it expects the first group to be here?
                    //   Wait, the HTML code provided:
                    //   <tbody ng-repeat="rt ...">
                    //      <tr> <td rowspan...> </td> <td rowspan...> </td> </tr>
                    //      <tr ng-repeat="rt1 in rt.cat_grp_list"> <td>GroupName</td> <td>Subjects</td> </tr>
                    //   </tbody>
                    // This means the first TR has ONLY the Category/SL columns (spanning down), and then subsequent rows have the data?
                    // That would mean the first row is empty of data? That looks odd.
                    // Usually rowspan starts on the first data row.
                    // Let's look closely at the HTML again.
                    // <tr> <td rowspan>...</td> <td rowspan>...</td> </tr>
                    // <tr ng-repeat="rt1 in rt.cat_grp_list"> ... </tr>
                    // Yes, it seems they have a "Header" row for the category that spans, but it doesn't contain the first group.
                    // The groups start on the *next* rows.
                    // So effective rows = 1 (category row) + N (group rows).
                    // That explains `rt.cat_grp_list.length+1`.

                    details_list.push({
                        emcA_Id: cat.emcA_Id,
                        emcA_CategoryName: cat.emcA_CategoryName,
                        cat_grp_list: cat_grp_list
                    });
                });

                setFinalDetailsList(details_list);
                setGridFlag(true);

                // Set Report Header
                const yearName = yearDropdown.find((y: any) => String(y.asmaY_Id) === data.asmaY_Id)?.asmaY_Year || '';
                let header = `Academic Year: ${yearName}`;
                if (data.type === '2') {
                    const catName = classDropdown.find((c: any) => String(c.emcA_Id) === data.emcA_Id)?.emcA_CategoryName || '';
                    header += ` Category: ${catName}`;
                }
                setReportHeader(header);
            } else {
                toast.warning('No record Found!');
                setGridFlag(false);
                setFinalDetailsList([]);
            }
        } catch (error) {
            console.error('Error fetching report', error);
            toast.error('Failed to generate report');
        }
    };

    const handleCancel = () => {
        reset({
            type: '1',
            asmaY_Id: '',
            emcA_Id: ''
        });
        setGridFlag(false);
        setFinalDetailsList([]);
    };

    const handlePrint = () => {
        const tableContent = document.getElementById('reportTable');
        const printHeader = `
            <div class="header-container">
                <div class="logo-container">
                    <img src="/assets/tunbridge_logo.png" alt="Logo" class="logo">
                </div>
                <div class="school-details">
                    <h1 class="school-name">Tunbridge High School</h1>
                    <p class="address">86/2 Infantry Road, Bangalore, Karnataka, India 560001</p>
                    <p class="email">Mail Id: tunbridgehs@gmail.com</p>
                </div>
            </div>
            <div class="report-title">Exam Category Group Wise Subject Wise Report</div>
            <div class="sub-title">${reportHeader}</div>
        `;

        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>Exam Category Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header-container { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border-bottom: 2px solid #ccc; padding-bottom: 15px; position: relative; }
                                .logo-container { position: absolute; left: 0; top: 0; }
                                .logo { height: 100px; width: auto; }
                                .school-details { text-align: center; width: 100%; }
                                .school-name { font-size: 32px; font-weight: bold; color: #2e57a0; margin: 0; text-transform: capitalize; font-family: sans-serif;}
                                .address, .email { margin: 5px 0; font-size: 14px; }
                                .report-title { text-align: center; font-weight: bold; font-size: 16px; margin-top: 10px; text-decoration: underline; }
                                .sub-title { text-align: center; font-weight: bold; font-size: 14px; margin: 5px 0 20px 0; }
                                
                                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                                th { border: 1px solid black; padding: 8px; text-align: center; font-weight: bold; background-color: #f2f2f2; }
                                td { border: 1px solid black; padding: 8px; vertical-align: top; }
                                .text-center { text-align: center; }
                                .font-medium { font-weight: 500; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            ${printHeader}
                            ${tableContent.outerHTML}
                            <div style="margin-top: 20px; font-size: 10px;">Date: ${new Date().toLocaleDateString('en-GB')} UserName: ${'Administrator'}</div>
                        </body>
                    </html>
                `);
                popupWindow.document.close();
            }
        }
    };

    const handleExcel = () => {
        const table = document.getElementById('reportTable');
        if (table) {
            const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, 'Exam_Category_Report.xlsx');
        }
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <Card className='w-full shadow-md'>
                <CardHeader className='border-b bg-primary/5'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='font-bold text-primary text-xl'>Exam Category Report</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className='pt-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='mb-6 flex justify-center'>
                            <div className='rounded-lg bg-muted/50 p-4'>
                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id='r1' />
                                                <Label htmlFor='r1' className='cursor-pointer font-medium'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='2' id='r2' />
                                                <Label htmlFor='r2' className='cursor-pointer font-medium'>
                                                    Individual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='asmaY_Id'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={errors.asmaY_Id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearDropdown.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <p className='text-destructive text-sm'>{errors.asmaY_Id.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='emcA_Id'>
                                    Category <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='emcA_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={typeValue === '1'}>
                                            <SelectTrigger className={errors.emcA_Id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classDropdown.map((item: any) => (
                                                    <SelectItem key={item.emcA_Id} value={String(item.emcA_Id)}>
                                                        {item.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.emcA_Id && <p className='text-destructive text-sm'>{errors.emcA_Id.message}</p>}
                            </div>
                        </div>

                        <div className='flex justify-center gap-4 border-t pt-4'>
                            <Button type='submit' disabled={isSubmitting} className='w-32 bg-primary hover:bg-primary/90'>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Check className='mr-2 h-4 w-4' />}
                                Report
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleCancel} className='w-32'>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleExcel}
                                className='w-32 border-primary text-primary hover:bg-primary/10'>
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                                Excel
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handlePrint}
                                className='w-32 border-primary text-primary hover:bg-primary/10'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {gridFlag && (
                <Card className='fade-in-50 slide-in-from-bottom-5 w-full animate-in shadow-lg'>
                    <CardHeader className='border-b bg-primary/5'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='font-bold text-primary text-xl'>EXAM CATEGORY REPORT</CardTitle>
                            <div className='relative w-64'>
                                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    type='search'
                                    placeholder='Search...'
                                    className='bg-background pl-8'
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <div className='overflow-hidden rounded-md border'>
                            <Table id='reportTable'>
                                <TableHeader className='bg-primary/10'>
                                    <TableRow>
                                        <TableHead className='w-[80px] border-r text-center font-bold'>SL.No.</TableHead>
                                        <TableHead className='border-r font-bold'>CATEGORY</TableHead>
                                        <TableHead className='border-r font-bold'>GROUPS</TableHead>
                                        <TableHead className='font-bold'>SUBJECTS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                {finalDetailsList
                                    .filter(
                                        (rt: any) =>
                                            rt.emcA_CategoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
                                            rt.cat_grp_list.some((g: any) =>
                                                g.emG_GroupName.toLowerCase().includes(searchValue.toLowerCase())
                                            )
                                    )
                                    .map((rt: any, index: number) => {
                                        // To replicate the angular nested logic with table constraints
                                        // Angular:
                                        // TBody for each RT
                                        //   TR (rowspan cells)
                                        //   TR-repeat (group cells)
                                        return (
                                            <tbody key={index} className='border-b last:border-0 hover:bg-muted/5'>
                                                {/* Row 1: Category Header / Spanner */}
                                                <TableRow>
                                                    <TableCell
                                                        rowSpan={rt.cat_grp_list.length + 1}
                                                        className='border-r text-center align-middle font-medium'>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell
                                                        rowSpan={rt.cat_grp_list.length + 1}
                                                        className='border-r align-middle font-medium'>
                                                        {rt.emcA_CategoryName}
                                                    </TableCell>
                                                    {/* Empty cells for group/subject in this structural row or we could merge? 
                                                             The HTML had specific TRs.
                                                             If I put nothing here, the row is effectively just the two visible cells?
                                                             We need to render at least empty cells or not? 
                                                             Wait, if I have 4 columns, and I define 2 cells, the other 2 are empty?
                                                             Correct HTML table behavior: if I have a row with 2 cells, and they don't span across the other columns, it might look broken.
                                                             However, the other columns are for Groups/Subjects.
                                                             The HTML Example:
                                                             <tr> 
                                                               <td rowspan>1</td> <td rowspan>Cat</td> 
                                                             </tr>
                                                             <tr ng-repeat>
                                                                <td>Group</td> <td>Subjects</td>
                                                             </tr>
                                                             This means the first row has only 2 TDs. 
                                                             Since the table has 4 columns (thead), 
                                                             the first row effectively has 2 missing cells. 
                                                             This visually creates an empty space in the last 2 columns for that first row line.
                                                             If `cat_grp_list` has items, they appear below.
                                                             This mimics the provided HTML structure.
                                                         */}
                                                </TableRow>
                                                {/* Group Rows */}
                                                {rt.cat_grp_list.map((group: any, gIndex: number) => (
                                                    <TableRow key={gIndex}>
                                                        <TableCell className='border-r'>{group.emG_GroupName}</TableCell>
                                                        <TableCell>
                                                            {group.grp_subjs.map((subj: any, sIndex: number) => (
                                                                <div key={sIndex}>{subj.ismS_SubjectName}</div>
                                                            ))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </tbody>
                                        );
                                    })}
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
