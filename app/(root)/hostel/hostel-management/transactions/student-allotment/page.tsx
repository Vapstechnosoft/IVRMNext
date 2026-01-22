import { getStudentAllotmentLoadData } from '@/server/hostel/transactions/student-allotment';
import StudentAllotmentForm from './_components/add-form';
import StudentAllotmentList from './_components/list';

export default async function StudentAllotmentPage() {
    const data = await getStudentAllotmentLoadData();

    return (
        <div className="container mx-auto p-4 space-y-8">
            <StudentAllotmentForm
                dropdowns={{
                    yearlist: data.yearlist,
                    hostel_list: data.hostel_list,
                    roomcatgry_list: data.roomcatgry_list,
                    room_list: data.room_list,
                    // passing extra lists if needed for lookup
                    ...data // Spread to include classlist/sectionlist if strict typing allows or we cast in Form
                } as any}
            />
            <StudentAllotmentList data={data.student_allotlist || []} />
        </div>
    );
}
