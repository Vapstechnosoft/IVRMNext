import { getInitialData } from '@/server/admission/college/admission-form';
import { AdmissionFormWrapper } from './_components/admission-form-wrapper';

export default async function CollegeAdmissionFormPage() {
    const initialData = await getInitialData();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">College Student Admission Form</h1>
                <p className="text-muted-foreground">Fill in the details to enroll a new student.</p>
            </div>
            
            <AdmissionFormWrapper initialData={initialData?.data || {}} />
        </div>
    );
}
