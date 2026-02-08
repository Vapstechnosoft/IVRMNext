'use client';

import BMICalculationForm from './add-form';
import { IBMICalculation } from '@/types/sports/transactions/bmi-calculation';

interface UpdateBMICalculationFormProps {
    onSuccess?: () => void;
    selectedRow: IBMICalculation;
}

export default function UpdateBMICalculationForm({ onSuccess, selectedRow }: UpdateBMICalculationFormProps) {
    return <BMICalculationForm onSuccess={onSuccess} selectedRow={selectedRow} />;
}
