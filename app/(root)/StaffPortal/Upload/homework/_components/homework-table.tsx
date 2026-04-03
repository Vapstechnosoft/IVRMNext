'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Homework {
  ihW_Id: number;
  ismS_SubjectName: string;
  asmcL_ClassName: string;
  asmC_SectionName: string;
  ihW_Topic: string;
  createdDate: string;
  createdTime: string;
  ihW_Assignment: string;
  ihW_Date: string;
  FilesCount: number;
  ihW_ActiveFlag: boolean;
}

interface HomeworkTableProps {
  homeworkList: Homework[];
}

export function HomeworkTable({ homeworkList }: HomeworkTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredHomework = homeworkList.filter(homework =>
    homework.ismS_SubjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homework.asmcL_ClassName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homework.asmC_SectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homework.ihW_Topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHomework.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHomework = filteredHomework.slice(startIndex, endIndex);

  const handleToggleStatus = (homework: Homework) => {
    // Mock toggle - replace with actual API call
    console.log('Toggle status for homework:', homework.ihW_Id);
  };

  const handleViewFiles = (homework: Homework) => {
    // Mock view files - replace with actual implementation
    console.log('View files for homework:', homework.ihW_Id);
  };

  const handleEdit = (homework: Homework) => {
    // Mock edit - replace with actual implementation
    console.log('Edit homework:', homework.ihW_Id);
  };

  if (homeworkList.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Homework Details</CardTitle>
            <CardDescription>View and manage uploaded homework</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              Total Records: {homeworkList.length}
            </Badge>
            {searchTerm && (
              <Badge variant="outline">
                Searched: {filteredHomework.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#1e59a8]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] text-center border text-white font-bold">SLNO</TableHead>
                <TableHead className="border text-white font-bold">Subject</TableHead>
                <TableHead className="text-center border text-white font-bold">Class</TableHead>
                <TableHead className="text-center border text-white font-bold">Section</TableHead>
                <TableHead className="border text-white font-bold">Topic</TableHead>
                <TableHead className="text-center border text-white font-bold whitespace-nowrap">Update Date / Time</TableHead>
                <TableHead className="border text-white font-bold">Assignment</TableHead>
                <TableHead className="text-center border text-white font-bold whitespace-nowrap">Homework Date</TableHead>
                <TableHead className="text-center border text-white font-bold">Attachment</TableHead>
                <TableHead className="text-center border text-white font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentHomework.map((homework, index) => (
                <TableRow key={homework.ihW_Id}>
                  <TableCell className="text-center border">{startIndex + index + 1}</TableCell>
                  <TableCell className="border">{homework.ismS_SubjectName}</TableCell>
                  <TableCell className="text-center border">{homework.asmcL_ClassName}</TableCell>
                  <TableCell className="text-center border">{homework.asmC_SectionName}</TableCell>
                  <TableCell className="text-left border max-w-xs">{homework.ihW_Topic}</TableCell>
                  <TableCell className="border text-center">
                    <div className="flex flex-col">
                      <span className="text-sm">{homework.createdDate || '--'}</span>
                      <span className="text-xs text-gray-500">{homework.createdTime || ''}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left border max-w-xs">{homework.ihW_Assignment}</TableCell>
                  <TableCell className="text-center border">{homework.ihW_Date ? format(new Date(homework.ihW_Date), 'dd-MM-yyyy') : '--'}</TableCell>
                  <TableCell className="text-center border">
                    {homework.FilesCount === 0 ? (
                      <span className="text-gray-400">---</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFiles(homework)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="border">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(homework)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(homework)}
                        className={homework.ihW_ActiveFlag ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}
                      >
                        {homework.ihW_ActiveFlag ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredHomework.length)} of {filteredHomework.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
