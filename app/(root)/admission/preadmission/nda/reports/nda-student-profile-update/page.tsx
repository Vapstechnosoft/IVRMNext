import React from 'react';
import { StudentProfileUpdateForm } from './_components/StudentProfileUpdateForm';

export const metadata = {
    title: 'NDA Student Profile Update | Admission Portal',
    description: 'Update and manage your student profile details securely. Request updates for photos, contact information, and addresses.',
};

export default function NdaStudentProfileUpdatePage() {
    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <StudentProfileUpdateForm />
            </div>
        </div>
    );
}
