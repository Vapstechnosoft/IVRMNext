'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MobilePageDTO, PageDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface PageMappingGridsProps {
    webPages: PageDTO[];
    mobilePages: MobilePageDTO[];
    savedGrid: PageDTO[];
}

export default function PageMappingGrids({ webPages, mobilePages, savedGrid }: PageMappingGridsProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWebPages = webPages.filter(
        (p) =>
            p.ivrmmP_PageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.ivrmM_ModuleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='space-y-4'>
            <Tabs defaultValue='web' className='w-full'>
                <TabsList className='grid w-full grid-cols-3 rounded-lg bg-gray-100 p-1'>
                    <TabsTrigger
                        value='web'
                        className='transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                        Web Page Mapping
                    </TabsTrigger>
                    <TabsTrigger
                        value='mobile'
                        className='transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                        Mobile Page Mapping
                    </TabsTrigger>
                    <TabsTrigger
                        value='saved'
                        className='transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm'>
                        Saved Mappings
                    </TabsTrigger>
                </TabsList>

                {/* Web Page Mapping */}
                <TabsContent value='web' className='fade-in-50 mt-4 animate-in duration-500'>
                    <div className='rounded-lg border bg-white shadow-sm'>
                        <div className='flex items-center justify-between border-b bg-gray-50/50 p-4'>
                            <h4 className='font-semibold text-gray-700'>Web Pages Permissions</h4>
                            <div className='relative w-64'>
                                <Search className='absolute top-2.5 left-2 h-4 w-4 text-gray-400' />
                                <Input
                                    placeholder='Search pages...'
                                    className='h-9 pl-8'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className='h-[400px]'>
                            <Table>
                                <TableHeader className='sticky top-0 z-10 bg-gray-100'>
                                    <TableRow>
                                        <TableHead className='w-[50px] text-center'>#</TableHead>
                                        <TableHead>Page Name</TableHead>
                                        <TableHead className='text-center'>Add</TableHead>
                                        <TableHead className='text-center'>Update</TableHead>
                                        <TableHead className='text-center'>Delete</TableHead>
                                        <TableHead className='text-center'>Process</TableHead>
                                        <TableHead className='text-center'>Report</TableHead>
                                        <TableHead className='text-center'>Select</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWebPages.map((page, idx) => (
                                        <TableRow key={page.ivrmP_Id} className='transition-colors hover:bg-blue-50/30'>
                                            <TableCell className='text-center font-medium text-gray-500 text-xs'>{idx + 1}</TableCell>
                                            <TableCell className='font-medium text-xs'>{page.ivrmmP_PageName}</TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmrP_AddFlag}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmrP_AddFlag = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmrP_UpdateFlag}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmrP_UpdateFlag = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmrP_DeleteFlag}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmrP_DeleteFlag = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmrP_ProcessFlag}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmrP_ProcessFlag = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmrP_ReportFlag}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmrP_ReportFlag = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.checked}
                                                    onCheckedChange={(val) => {
                                                        page.checked = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </TabsContent>

                {/* Mobile Page Mapping */}
                <TabsContent value='mobile' className='fade-in-50 mt-4 animate-in duration-500'>
                    <div className='rounded-lg border bg-white shadow-sm'>
                        <div className='border-b bg-gray-50/50 p-4'>
                            <h4 className='font-semibold text-gray-700'>Mobile App Pages Permissions</h4>
                        </div>
                        <ScrollArea className='h-[400px]'>
                            <Table>
                                <TableHeader className='sticky top-0 z-10 bg-gray-100'>
                                    <TableRow>
                                        <TableHead className='w-[50px] text-center'>#</TableHead>
                                        <TableHead>App Page Name</TableHead>
                                        <TableHead className='text-center'>Add</TableHead>
                                        <TableHead className='text-center'>Update</TableHead>
                                        <TableHead className='text-center'>Delete</TableHead>
                                        <TableHead className='text-center'>Select</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mobilePages.map((page, idx) => (
                                        <TableRow key={page.ivrmmaP_Id} className='transition-colors hover:bg-blue-50/30'>
                                            <TableCell className='text-center font-medium text-gray-500 text-xs'>{idx + 1}</TableCell>
                                            <TableCell className='font-medium text-xs'>{page.ivrmmaP_AppPageName}</TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmmaP_AddFlg}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmmaP_AddFlg = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmmaP_UpdateFlg}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmmaP_UpdateFlg = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.ivrmmaP_DeleteFlg}
                                                    onCheckedChange={(val) => {
                                                        page.ivrmmaP_DeleteFlg = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={page.checked}
                                                    onCheckedChange={(val) => {
                                                        page.checked = !!val;
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </TabsContent>

                {/* Saved Grid */}
                <TabsContent value='saved' className='fade-in-50 mt-4 animate-in duration-500'>
                    <div className='rounded-lg border bg-white shadow-sm'>
                        <div className='border-b bg-gray-50/50 p-4'>
                            <h4 className='font-semibold text-gray-700'>Existing Page Mappings</h4>
                        </div>
                        <ScrollArea className='h-[400px]'>
                            <Table>
                                <TableHeader className='sticky top-0 z-10 bg-gray-100'>
                                    <TableRow>
                                        <TableHead className='w-[50px] text-center'>#</TableHead>
                                        <TableHead>Page Name</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead className='text-center'>Permissions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {savedGrid.map((page, idx) => (
                                        <TableRow key={page.ivrmP_Id}>
                                            <TableCell className='text-center text-xs'>{idx + 1}</TableCell>
                                            <TableCell className='text-xs'>{page.ivrmmP_PageName}</TableCell>
                                            <TableCell className='text-xs'>{page.intname}</TableCell>
                                            <TableCell className='space-x-1 text-center text-[10px]'>
                                                {page.ivrmrP_AddFlag && <span className='rounded bg-green-100 px-1 text-green-700'>A</span>}
                                                {page.ivrmrP_UpdateFlag && (
                                                    <span className='rounded bg-blue-100 px-1 text-blue-700'>U</span>
                                                )}
                                                {page.ivrmrP_DeleteFlag && <span className='rounded bg-red-100 px-1 text-red-700'>D</span>}
                                                {page.ivrmrP_ProcessFlag && (
                                                    <span className='rounded bg-purple-100 px-1 text-purple-700'>P</span>
                                                )}
                                                {page.ivrmrP_ReportFlag && (
                                                    <span className='rounded bg-orange-100 px-1 text-orange-700'>R</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
