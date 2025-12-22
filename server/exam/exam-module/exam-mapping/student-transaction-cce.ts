'use server';

import { api } from '@/lib/apiService';
import type { ICoScholasticActivityAreaMapping, IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';
import type { ILifeSkillArea } from '@/types/exam/exam-module/masters';

export async function getLifeSkillAreasBasedOnLifeSkill(asmaY_Id: number, ecact_Id: number) {
    if (!ecact_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `student_transaction/onchange_skills/30/${asmaY_Id}/${ecact_Id}`;
    return await api.get<ILifeSkillArea>('exam', url);
}

export async function getCoScholasticAreasBasedOnCoScholasticActivity(asmaY_Id: number, ecact_Id: number) {
    if (!ecact_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `student_transaction/onchange_activities/30/${asmaY_Id}/${ecact_Id}`;
    return await api.get<ICoScholasticActivityAreaMapping>('exam', url);
}

export async function getStudentTransactionCCEDetails(asmaY_Id: number, ecact_Id: number) {
    if (!ecact_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `student_transaction/30/${asmaY_Id}/${ecact_Id}`; // Add the student ID to the URL as a parameter
    return await api.get<IExamSubjectWizard>('exam', url);
}
