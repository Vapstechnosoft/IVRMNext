import type { FeeUserWiseDailyCollectionData } from '@/types/fees/reports/reports';

export const mockStudentWiseData: FeeUserWiseDailyCollectionData = {
    totalRecords: 5,
    totalAmount: 18750,
    studentWise: [
        {
            Student_Name: 'Aarav Singh',
            Admission_No: 'ADM-1001',
            ClassName: '10th',
            SectionName: 'A',
            Date: '2026-04-20',
            ModeOfPayment: 'Cash',
            BankName: 'N/A',
            DD_OR_CHeque_No: 'N/A',
            FMH_FeeName: 'Tuition Fee',
            Amount: 3500,
            Receipt_No: 'RCPT-5001',
            GeneratedBy: 'Admin'
        },
        {
            Student_Name: 'Meera Patel',
            Admission_No: 'ADM-1002',
            ClassName: '9th',
            SectionName: 'B',
            Date: '2026-04-21',
            ModeOfPayment: 'Card',
            BankName: 'HDFC',
            DD_OR_CHeque_No: 'N/A',
            FMH_FeeName: 'Development Fee',
            Amount: 4200,
            Receipt_No: 'RCPT-5002',
            GeneratedBy: 'Cashier'
        },
        {
            Student_Name: 'Riya Sharma',
            Admission_No: 'ADM-1003',
            ClassName: '8th',
            SectionName: 'C',
            Date: '2026-04-21',
            ModeOfPayment: 'Cheque',
            BankName: 'ICICI',
            DD_OR_CHeque_No: 'CHQ-12345',
            FMH_FeeName: 'Admission Fee',
            Amount: 3000,
            Receipt_No: 'RCPT-5003',
            GeneratedBy: 'Admin'
        },
        {
            Student_Name: 'Karan Jain',
            Admission_No: 'ADM-1004',
            ClassName: '11th',
            SectionName: 'A',
            Date: '2026-04-22',
            ModeOfPayment: 'Online',
            BankName: 'SBI',
            DD_OR_CHeque_No: 'N/A',
            FMH_FeeName: 'Exam Fee',
            Amount: 3500,
            Receipt_No: 'RCPT-5004',
            GeneratedBy: 'Cashier'
        },
        {
            Student_Name: 'Isha Verma',
            Admission_No: 'ADM-1005',
            ClassName: '12th',
            SectionName: 'B',
            Date: '2026-04-22',
            ModeOfPayment: 'UPI',
            BankName: 'PhonePe',
            DD_OR_CHeque_No: 'N/A',
            FMH_FeeName: 'Library Fee',
            Amount: 2550,
            Receipt_No: 'RCPT-5005',
            GeneratedBy: 'Admin'
        }
    ]
};

export const mockTotalCollectionData: FeeUserWiseDailyCollectionData = {
    totalRecords: 5,
    totalAmount: 18750,
    totalReceipts: 5,
    totalCollection: [
        {
            Date: '2026-04-20',
            ModeOfPayment: 'Cash',
            totalAmount: 3500,
            Receipt_No: 'RCPT-5001',
            GeneratedBy: 'Admin'
        },
        {
            Date: '2026-04-21',
            ModeOfPayment: 'Card',
            totalAmount: 4200,
            Receipt_No: 'RCPT-5002',
            GeneratedBy: 'Cashier'
        },
        {
            Date: '2026-04-21',
            ModeOfPayment: 'Cheque',
            totalAmount: 3000,
            Receipt_No: 'RCPT-5003',
            GeneratedBy: 'Admin'
        },
        {
            Date: '2026-04-22',
            ModeOfPayment: 'Online',
            totalAmount: 3500,
            Receipt_No: 'RCPT-5004',
            GeneratedBy: 'Cashier'
        },
        {
            Date: '2026-04-22',
            ModeOfPayment: 'UPI',
            totalAmount: 2550,
            Receipt_No: 'RCPT-5005',
            GeneratedBy: 'Admin'
        }
    ]
};
