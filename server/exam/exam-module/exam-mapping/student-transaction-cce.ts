'use server';

import { api } from '@/lib/apiService';
import type { GetStudentDetailsParams, ICoScholasticActivityAreaMapping, IExamSubjectWizard, IStudentTransaction } from '@/types/exam/exam-module/exam-mapping';
import type { ILifeSkillArea } from '@/types/exam/exam-module/masters';
import { IStudentDetails } from '@/types/fees/transactions/transactions';

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

export async function getStudentTransactionCCEDetails(params: GetStudentDetailsParams) {
  console.log('params', params);
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  const url = `/student_transaction/get_student_details${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log(url);
  return await api.get<any>('exam', url);
}