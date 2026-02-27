"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { Printer, FileSpreadsheet, Info } from "lucide-react";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";

interface ReportListProps {
  data: any;
  info: any;
}

export const ReportList = ({ data, info }: ReportListProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  // Transformation logic removed as we are rendering a flat list directly.

  // Check if data exists
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (data.sectionlist && data.sectionlist.length === 0)
  ) {
    return null;
  }

  // For "display all dummy data", we will render a flat list of items
  // This ignores grouping by section and just lists every subject entry as a row.

  const handlePrint = () => {
    const printContent = tableRef.current?.outerHTML;
    if (printContent) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write("<html><head><title></title>");
        printWindow.document.write(
          "<style>table { width: 100%; border-collapse: collapse; text-align: center; } th, td { border: 1px solid black; padding: 8px; } th { background-color: #f2f2f2; }</style>",
        );
        printWindow.document.write("</head><body>");
        printWindow.document.write(
          `<div style="text-align: center; margin-bottom: 20px;">
             <h3>Marks Entered Report</h3>
             <p><strong>ACADEMIC YEAR:</strong> ${info.selected_Year} &nbsp;&nbsp; <strong>EXAM:</strong> ${info.selected_Exam}</p>
           </div>`,
          `<div style="text-align: center; margin-bottom: 20px;">
             <p><strong>CLASS:</strong> ${info.selected_Class} &nbsp;&nbsp; <strong>SECTION:</strong> ${info.selected_Section}</p>
           </div>`,
        );
        printWindow.document.write(printContent);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExport = () => {
    if (tableRef.current) {
      const wb = XLSX.utils.table_to_book(tableRef.current);
      XLSX.writeFile(wb, "Marks_Entry_Report.xlsx");
    }
  };

  // Use the raw array for the flat list
  const reportList = Array.isArray(data) ? data : [];

  const subjects = reportList.map(
    (item: any) => item.ismS_SubjectName || item.ISMS_SubjectName,
  );

  return (
    <>
      <CollapsibleSection
        title="Stella Marks Entry Report"
        defaultOpen={true}
        variant="outline"
        size="md"
        className="slide-in-from-top-4 animate-in shadow-lg duration-300"
      >
        <div className="space-y-4  bg-white border rounded-xl">
          <h3 className="font-bold text-xl pt-3 text-center">
            Marks Entered Report
          </h3>
          <div className=" flex justify-center gap-10">
            <div className="text-sm flex flex-col gap-4">
              <span>
                <strong>ACADEMIC YEAR:</strong>
                {info.selected_Year || "2023-2024"}
              </span>
              <span>
                <strong>EXAM:</strong> {info.selected_Exam || "-"}
              </span>
            </div>
            <div className="text-sm flex flex-col gap-4">
              <span>
                <strong>CLASS:</strong> {info.selected_Class || "-"}
              </span>
              <span>
                <strong>SECTION:</strong> {info.selected_Section || "-"}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-2">
            <Button
              onClick={handlePrint}
              className=" hover:bg-orange-800 text-white flex w-fit"
            >
              <Printer className="h-4 w-4" />
              <span>PRINT</span>
            </Button>

            <Button
              onClick={handleExport}
              className="hover:bg-orange-800 text-white w-fit"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>

          <div className=" rounded-md ">
            <Table ref={tableRef}>
              <TableHeader>
                <TableRow className="bg-gray-200 hover:bg-gray-200">
                  <TableHead className="w-[80px] text-center text-base font-bold text-black border border-gray-400">
                    Sl No
                  </TableHead>
                  <TableHead className="text-center text-base font-bold text-black border border-gray-400">
                    Class
                  </TableHead>
                  <TableHead className="text-center text-base font-bold text-black border border-gray-400">
                    Section
                  </TableHead>
                  {reportList.map((item: any, index: number) => {
                    const subject =
                      item.ismS_SubjectName || item.ISMS_SubjectName;
                    return (
                      <TableHead className="text-center text-base font-bold text-black border border-gray-400">
                        {subject}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportList.length > 0 && (
                  <TableRow>
                    <TableCell className="text-center border border-gray-400">
                      1
                    </TableCell>

                    <TableCell className="text-center border border-gray-400">
                      {info.selected_Class || reportList[0].asmcL_ClassName}
                    </TableCell>

                    <TableCell className="text-center border border-gray-400">
                      {info.selected_Section || reportList[0].asmC_SectionName}
                    </TableCell>

                    {subjects.map((subject: string, index: number) => {
                      const subjectData = reportList.find(
                        (item: any) => item.ismS_SubjectName === subject,
                      );

                      const status =
                        subjectData?.sourceMarksEntry ||
                        subjectData?.SourceMarksEntry;

                      const color =
                        subjectData?.sourceMarksColorFlag ||
                        subjectData?.SourceMarksColorFlag ||
                        "black";

                      return (
                        <TableCell
                          key={index}
                          className="text-center border border-gray-400"
                          style={{ color }}
                        >
                          {status || "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CollapsibleSection>
    </>
  );
};
