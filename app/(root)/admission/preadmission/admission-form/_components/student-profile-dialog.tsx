'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmissionFormDetails, useStudentAdmissionFormById, useStudentProfileView } from '@/hooks/admission/admissionForm';
import { Title } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { User, X } from 'lucide-react';

function getField(obj: any, ...keys: string[]): any {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
        const lowerKey = key.toLowerCase();
        for (const objKey of Object.keys(obj)) {
            if (objKey.toLowerCase() === lowerKey && obj[objKey] !== undefined && obj[objKey] !== null && obj[objKey] !== '') {
                return obj[objKey];
            }
        }
    }
    return undefined;
}

function getArray(src: any, ...keys: string[]): any[] {
    if (!src || typeof src !== 'object') return [];
    for (const key of keys) {
        if (Array.isArray(src[key])) return src[key];
        const lower = key.toLowerCase();
        for (const k of Object.keys(src)) {
            if (k.toLowerCase() === lower && Array.isArray(src[k])) return src[k];
        }
    }
    return [];
}

function formatDateSafe(dateVal: any): string {
    if (!dateVal) return 'N/A';
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return String(dateVal);
        return format(d, 'dd/MM/yyyy');
    } catch {
        return String(dateVal);
    }
}

export default function StudentProfileDialog({
    isOpen,
    onClose,
    amstId,
    asmclId = 0,
    asmsId = 0,
    studentData
}: {
    isOpen: boolean;
    onClose: () => void;
    amstId: number;
    asmclId?: number;
    asmsId?: number;
    studentData?: any;
}) {
    const { data: applicationFormDetails, isLoading: isProfileLoading, error: profileError } = useStudentProfileView(amstId, asmclId, asmsId);
    const { data: tabsDetails, isLoading: isTabsLoading } = useStudentAdmissionFormById(amstId);
    const { data: admissionFormConfig } = useAdmissionFormDetails();

    const rawProfile = (applicationFormDetails as any)?.data?.data || (applicationFormDetails as any)?.data || applicationFormDetails || {};
    const tabsData = (tabsDetails as any)?.data?.data || (tabsDetails as any)?.data || tabsDetails || {};

    const firstTab = tabsData.firstTab || tabsData.FirstTab || {};
    const secondTab = tabsData.secondTab || tabsData.SecondTab || {};
    const thirdTab = tabsData.thirdTab || tabsData.ThirdTab || {};
    const fourthTab = tabsData.fourthTab || tabsData.FourthTab || {};
    const fifthTab = tabsData.fifthTab || tabsData.FifthTab || {};
    const lastTab = tabsData.lastTab || tabsData.LastTab || {};
    const guardians = getArray(tabsData, 'guardians', 'Guardians');

    // Config reference data (Academic Years, Classes, etc.)
    const configData = (admissionFormConfig as any)?.data || admissionFormConfig || {};
    const allYears: any[] = configData.allAcademicYear || configData.academicYearOnLoad || [];
    const allClasses: any[] = configData.allClass || [];

    // Arrays from profile view
    const viewStudentDetailsList = getArray(rawProfile, 'viewstudentdetails', 'viewStudentDetails');
    const viewStudentJoinedDetailsList = getArray(rawProfile, 'viewstudentjoineddetails', 'viewStudentJoinedDetails');
    const studentListArray = getArray(rawProfile, 'studentList', 'studentlist');
    const studentList1Array = getArray(rawProfile, 'studentList1', 'studentlist1');
    const academicYearList = getArray(rawProfile, 'viewstudentacademicyeardetails', 'viewStudentAcademicYearDetails');
    const subjectsList = getArray(rawProfile, 'viewstudentsubjectdetails', 'viewStudentSubjectDetails');

    const viewStudentDetails = viewStudentDetailsList[0] || {};
    const viewStudentJoinedDetails = viewStudentJoinedDetailsList[0] || {};
    const studentList = studentListArray[0] || {};
    const studentList1 = studentList1Array[0] || {};
    const academicYearDetails = academicYearList[0] || {};

    // Match Academic Year
    const targetAsmayId =
        getField(firstTab, 'ASMAY_Id', 'asmaY_Id', 'asmay_id') ||
        getField(studentData, 'ASMAY_Id', 'asmaY_Id', 'asmay_id') ||
        getField(academicYearDetails, 'ASMAY_Id', 'asmaY_Id') ||
        getField(rawProfile, 'ASMAY_Id', 'asmaY_Id');

    const resolvedYearObj = allYears.find(
        (y: any) => String(y.asmaY_Id) === String(targetAsmayId) || String(y.ASMAY_Id) === String(targetAsmayId)
    );
    const resolvedYear = resolvedYearObj?.asmaY_Year || resolvedYearObj?.ASMAY_Year || '';

    // Match Class
    const targetAsmclId =
        getField(firstTab, 'ASMCL_Id', 'asmcL_Id', 'classId') ||
        getField(studentData, 'ASMCL_Id', 'asmcL_Id', 'classId') ||
        asmclId;

    const matchedClassObj = allClasses.find(
        (c: any) => String(c.asmcL_Id) === String(targetAsmclId) || String(c.ASMCL_Id) === String(targetAsmclId)
    );
    const matchedClassName = matchedClassObj?.asmcL_ClassName || matchedClassObj?.ASMCL_ClassName;

    // Student Basic Info
    const firstName =
        getField(viewStudentDetails, 'AMST_FirstName', 'amsT_FirstName', 'firstName') ||
        getField(firstTab, 'AMST_FirstName', 'amsT_FirstName');
    const middleName =
        getField(viewStudentDetails, 'AMST_MiddleName', 'amsT_MiddleName', 'middleName') ||
        getField(firstTab, 'AMST_MiddleName', 'amsT_MiddleName');
    const lastName =
        getField(viewStudentDetails, 'AMST_LastName', 'amsT_LastName', 'lastName') ||
        getField(firstTab, 'AMST_LastName', 'amsT_LastName');
    const combinedName = [firstName, middleName, lastName].filter(Boolean).join(' ');

    const studentName =
        combinedName ||
        getField(viewStudentJoinedDetails, 'studentname', 'studentName') ||
        getField(viewStudentDetails, 'studentname', 'studentName') ||
        getField(firstTab, 'studentname', 'studentName') ||
        studentData?.studentName ||
        'N/A';

    const admissionNo =
        getField(viewStudentDetails, 'AMST_AdmNo', 'amsT_AdmNo', 'admissionNo', 'AMST_AdmissionNo') ||
        getField(viewStudentJoinedDetails, 'AMST_AdmNo', 'amsT_AdmNo', 'admissionNo') ||
        getField(firstTab, 'AMST_AdmNo', 'amsT_AdmNo', 'admissionNo', 'AMST_AdmissionNo', 'amsT_AdmissionNo') ||
        studentData?.admissionNo ||
        'N/A';

    const rawAdmDate =
        getField(viewStudentDetails, 'AMST_Date', 'amsT_Date', 'admissionDate', 'AMST_DateOfAdmission') ||
        getField(viewStudentJoinedDetails, 'AMST_Date', 'amsT_Date', 'admissionDate') ||
        getField(firstTab, 'AMST_Date', 'amsT_Date', 'admissionDate', 'AMST_DateOfAdmission', 'amsT_DateOfAdmission') ||
        studentData?.admissionDate;
    const admissionDate = formatDateSafe(rawAdmDate);

    const rawDob =
        getField(viewStudentDetails, 'AMST_DOB', 'amsT_DOB', 'dob', 'dateOfBirth') ||
        getField(viewStudentJoinedDetails, 'AMST_DOB', 'amsT_DOB', 'dob', 'dateOfBirth') ||
        getField(firstTab, 'AMST_DOB', 'amsT_DOB', 'dob', 'dateOfBirth');
    const dateOfBirth = formatDateSafe(rawDob);

    const admittedYear =
        getField(viewStudentJoinedDetails, 'ASMAY_Year', 'asmaY_Year', 'admittedYear') ||
        getField(academicYearDetails, 'ASMAY_Year', 'asmaY_Year') ||
        getField(studentList, 'ASMAY_Year', 'asmaY_Year') ||
        resolvedYear ||
        getField(firstTab, 'ASMAY_Year', 'asmaY_Year') ||
        studentData?.year ||
        (allYears[0]?.asmaY_Year || allYears[0]?.ASMAY_Year) ||
        'N/A';

    const admittedClass =
        getField(viewStudentJoinedDetails, 'ASMCL_ClassName', 'asmcL_ClassName', 'className') ||
        getField(academicYearDetails, 'ASMCL_ClassName', 'asmcL_ClassName', 'className') ||
        getField(studentList, 'ASMCL_ClassName', 'asmcL_ClassName', 'className') ||
        studentData?.className ||
        matchedClassName ||
        getField(firstTab, 'ASMCL_ClassName', 'asmcL_ClassName', 'className') ||
        'N/A';

    const gender =
        getField(viewStudentDetails, 'AMST_Sex', 'amsT_Sex', 'gender', 'sex') ||
        getField(viewStudentJoinedDetails, 'AMST_Sex', 'amsT_Sex', 'gender', 'sex') ||
        getField(firstTab, 'AMST_Sex', 'amsT_Sex', 'gender', 'sex') ||
        studentData?.gender ||
        'N/A';

    const mobileNo =
        getField(firstTab, 'mobileNumber', 'MobileNumber') ||
        getField(viewStudentDetails, 'AMST_MobileNo', 'amsT_MobileNo', 'mobileNo') ||
        getField(viewStudentJoinedDetails, 'AMST_MobileNo', 'amsT_MobileNo', 'mobileNo') ||
        getField(firstTab, 'AMST_MobileNo', 'amsT_MobileNo') ||
        studentData?.mobileNo ||
        'N/A';

    const email =
        getField(firstTab, 'emailId', 'EmailId') ||
        getField(viewStudentDetails, 'AMST_emailId', 'amsT_emailId', 'emailId') ||
        getField(viewStudentJoinedDetails, 'AMST_emailId', 'amsT_emailId', 'emailId') ||
        getField(firstTab, 'AMST_emailId', 'amsT_emailId') ||
        studentData?.emailId ||
        'N/A';

    const profilePic =
        getField(firstTab, 'studentPhotoUrl', 'StudentPhotoUrl') ||
        getField(viewStudentDetails, 'AMST_Photoname', 'amsT_Photoname', 'photoUrl', 'studentPhotoUrl') ||
        getField(viewStudentJoinedDetails, 'AMST_Photoname', 'amsT_Photoname', 'photoUrl') ||
        getField(firstTab, 'AMST_Photoname', 'amsT_Photoname', 'photoUrl') ||
        studentData?.studentPhotoUrl ||
        studentData?.photoUrl ||
        '';

    // Academic Details
    const currentAcademicYear =
        getField(studentList, 'ASMAY_Year', 'asmaY_Year') ||
        getField(academicYearDetails, 'ASMAY_Year', 'asmaY_Year') ||
        resolvedYear ||
        admittedYear;

    const currentClass =
        getField(studentList, 'ASMCL_ClassName', 'asmcL_ClassName') ||
        getField(academicYearDetails, 'ASMCL_ClassName', 'asmcL_ClassName') ||
        studentData?.className ||
        matchedClassName ||
        admittedClass;

    const currentSection =
        getField(studentList, 'ASMC_SectionName', 'asmC_SectionName', 'sectionName') ||
        getField(academicYearDetails, 'ASMC_SectionName', 'asmC_SectionName', 'sectionName') ||
        studentData?.sectionName ||
        studentData?.section ||
        getField(firstTab, 'sectionName', 'ASMC_SectionName') ||
        'A';

    const rollNo =
        getField(academicYearDetails, 'AMAY_RollNo', 'amaY_RollNo', 'rollNo') ??
        getField(studentList, 'AMAY_RollNo', 'amaY_RollNo', 'rollNo') ??
        getField(firstTab, 'AMST_RollNo', 'amsT_RollNo', 'rollNo') ??
        getField(studentData, 'rollNo', 'roll_no') ??
        'N/A';

    // Parents / Address Details
    const fatherFirstName =
        getField(thirdTab, 'fatherName', 'FatherName', 'AMST_FatherName', 'amsT_FatherName') ||
        getField(viewStudentDetails, 'AMST_FatherName', 'amsT_FatherName', 'fatherName') ||
        getField(firstTab, 'AMST_FatherName', 'amsT_FatherName', 'fatherName') ||
        getField(secondTab, 'AMST_FatherName', 'amsT_FatherName', 'fatherName') ||
        getField(studentData, 'fatherName', 'AMST_FatherName');
    const fatherLastName =
        getField(thirdTab, 'fatherSurname', 'FatherSurname', 'AMST_FatherSurname', 'amsT_FatherSurname') ||
        getField(viewStudentDetails, 'AMST_FatherSurname', 'amsT_FatherSurname') ||
        getField(firstTab, 'AMST_FatherSurname', 'amsT_FatherSurname') ||
        getField(secondTab, 'AMST_FatherSurname', 'amsT_FatherSurname');
    const fatherName = [fatherFirstName, fatherLastName].filter(Boolean).join(' ') || 'N/A';

    const fatherMobileList = getArray(thirdTab, 'fatherMobileNumbers', 'FatherMobileNumbers');
    const fatherMobile =
        fatherMobileList?.[0]?.mobileNo ||
        fatherMobileList?.[0]?.MobileNo ||
        getField(thirdTab, 'fatherMobileNo', 'FatherMobileNo', 'fatherMobile', 'AMST_FatherMobleNo', 'amsT_FatherMobleNo') ||
        getField(viewStudentDetails, 'AMST_FatherMobleNo', 'amsT_FatherMobleNo', 'AMST_FatherMobileNo', 'amsT_FatherMobileNo') ||
        getField(firstTab, 'AMST_FatherMobleNo', 'AMST_FatherMobileNo', 'amsT_FatherMobileNo') ||
        getField(secondTab, 'AMST_FatherMobleNo', 'AMST_FatherMobileNo', 'amsT_FatherMobileNo') ||
        getField(studentData, 'fatherMobileNo', 'fatherMobile', 'AMST_FatherMobleNo') ||
        'N/A';

    const fatherEmailList = getArray(thirdTab, 'fatherEmailIds', 'FatherEmailIds');
    const fatherEmail =
        fatherEmailList?.[0]?.emailId ||
        fatherEmailList?.[0]?.EmailId ||
        getField(thirdTab, 'fatherEmailId', 'FatherEmailId', 'fatherEmail', 'AMST_FatheremailId', 'amsT_FatheremailId') ||
        getField(viewStudentDetails, 'AMST_FatheremailId', 'amsT_FatheremailId', 'AMST_FatherEmailId') ||
        getField(firstTab, 'AMST_FatheremailId', 'AMST_FatherEmailId') ||
        getField(secondTab, 'AMST_FatheremailId', 'AMST_FatherEmailId') ||
        getField(studentData, 'fatherEmailId', 'fatherEmail', 'AMST_FatheremailId') ||
        'N/A';

    const fatherPhoto =
        getField(lastTab, 'fatherPhotoUrl', 'FatherPhotoUrl', 'fatherPhoto') ||
        getField(thirdTab, 'fatherPhotoUrl', 'FatherPhotoUrl', 'fatherPhoto') ||
        getField(viewStudentDetails, 'ANST_FatherPhoto', 'ansT_FatherPhoto', 'fatherPhoto') ||
        getField(secondTab, 'ANST_FatherPhoto', 'ansT_FatherPhoto', 'fatherPhoto') ||
        getField(firstTab, 'ANST_FatherPhoto', 'ansT_FatherPhoto', 'fatherPhoto');

    const motherFirstName =
        getField(thirdTab, 'motherName', 'MotherName', 'AMST_MotherName', 'amsT_MotherName') ||
        getField(viewStudentDetails, 'AMST_MotherName', 'amsT_MotherName', 'motherName') ||
        getField(firstTab, 'AMST_MotherName', 'amsT_MotherName', 'motherName') ||
        getField(secondTab, 'AMST_MotherName', 'amsT_MotherName', 'motherName') ||
        getField(studentData, 'motherName', 'AMST_MotherName');
    const motherLastName =
        getField(thirdTab, 'motherSurname', 'MotherSurname', 'AMST_MotherSurname', 'amsT_MotherSurname') ||
        getField(viewStudentDetails, 'AMST_MotherSurname', 'amsT_MotherSurname') ||
        getField(firstTab, 'AMST_MotherSurname', 'amsT_MotherSurname') ||
        getField(secondTab, 'AMST_MotherSurname', 'amsT_MotherSurname');
    const motherName = [motherFirstName, motherLastName].filter(Boolean).join(' ') || 'N/A';

    const motherMobileList = getArray(thirdTab, 'motherMobileNumbers', 'MotherMobileNumbers');
    const motherMobile =
        motherMobileList?.[0]?.mobileNo ||
        motherMobileList?.[0]?.MobileNo ||
        getField(thirdTab, 'motherMobileNo', 'MotherMobileNo', 'motherMobile', 'AMST_MotherMobileNo', 'amsT_MotherMobileNo') ||
        getField(viewStudentDetails, 'AMST_MotherMobileNo', 'amsT_MotherMobileNo') ||
        getField(firstTab, 'AMST_MotherMobileNo', 'amsT_MotherMobileNo') ||
        getField(secondTab, 'AMST_MotherMobileNo', 'amsT_MotherMobileNo') ||
        getField(studentData, 'motherMobileNo', 'motherMobile', 'AMST_MotherMobileNo') ||
        'N/A';

    const motherEmailList = getArray(thirdTab, 'motherEmailIds', 'MotherEmailIds');
    const motherEmail =
        motherEmailList?.[0]?.emailId ||
        motherEmailList?.[0]?.EmailId ||
        getField(thirdTab, 'motherEmailId', 'MotherEmailId', 'motherEmail', 'AMST_MotherEmailId', 'amsT_MotherEmailId') ||
        getField(viewStudentDetails, 'AMST_MotherEmailId', 'amsT_MotherEmailId', 'AMST_MotheremailId') ||
        getField(firstTab, 'AMST_MotherEmailId', 'amsT_MotheremailId') ||
        getField(secondTab, 'AMST_MotherEmailId', 'AMST_MotheremailId') ||
        getField(studentData, 'motherEmailId', 'motherEmail', 'AMST_MotherEmailId') ||
        'N/A';

    const motherPhoto =
        getField(lastTab, 'motherPhotoUrl', 'MotherPhotoUrl', 'motherPhoto') ||
        getField(thirdTab, 'motherPhotoUrl', 'MotherPhotoUrl', 'motherPhoto') ||
        getField(viewStudentDetails, 'ANST_MotherPhoto', 'ansT_MotherPhoto', 'motherPhoto') ||
        getField(secondTab, 'ANST_MotherPhoto', 'ansT_MotherPhoto', 'motherPhoto') ||
        getField(firstTab, 'ANST_MotherPhoto', 'ansT_MotherPhoto', 'motherPhoto');

    // Addresses
    const fatherPerm = thirdTab.fatherPermanentAddress || thirdTab.FatherPermanentAddress;
    const motherPerm = thirdTab.motherPermanentAddress || thirdTab.MotherPermanentAddress;
    const fatherPres = thirdTab.fatherPresentAddress || thirdTab.FatherPresentAddress;
    const motherPres = thirdTab.motherPresentAddress || thirdTab.MotherPresentAddress;

    const permAddrThird = fatherPerm
        ? [
            fatherPerm.address || fatherPerm.Address,
            fatherPerm.city || fatherPerm.City,
            fatherPerm.pincode || fatherPerm.Pincode ? `PIN: ${fatherPerm.pincode || fatherPerm.Pincode}` : ''
          ].filter(Boolean).join(', ')
        : motherPerm
        ? [
            motherPerm.address || motherPerm.Address,
            motherPerm.city || motherPerm.City,
            motherPerm.pincode || motherPerm.Pincode ? `PIN: ${motherPerm.pincode || motherPerm.Pincode}` : ''
          ].filter(Boolean).join(', ')
        : '';

    const presAddrThird = fatherPres
        ? [
            fatherPres.address || fatherPres.Address,
            fatherPres.city || fatherPres.City,
            fatherPres.pincode || fatherPres.Pincode ? `PIN: ${fatherPres.pincode || fatherPres.Pincode}` : ''
          ].filter(Boolean).join(', ')
        : motherPres
        ? [
            motherPres.address || motherPres.Address,
            motherPres.city || motherPres.City,
            motherPres.pincode || motherPres.Pincode ? `PIN: ${motherPres.pincode || motherPres.Pincode}` : ''
          ].filter(Boolean).join(', ')
        : '';

    const permAddrSecond = [
        getField(secondTab, 'AMST_PerStreet', 'amsT_PerStreet'),
        getField(secondTab, 'AMST_PerArea', 'amsT_PerArea'),
        getField(secondTab, 'AMST_PerCity', 'amsT_PerCity'),
        getField(secondTab, 'AMST_PerPincode', 'amsT_PerPincode') ? `PIN: ${getField(secondTab, 'AMST_PerPincode', 'amsT_PerPincode')}` : ''
    ].filter(Boolean).join(', ');

    const presAddrSecond = [
        getField(secondTab, 'AMST_ConStreet', 'amsT_ConStreet'),
        getField(secondTab, 'AMST_ConArea', 'amsT_ConArea'),
        getField(secondTab, 'AMST_ConCity', 'amsT_ConCity'),
        getField(secondTab, 'AMST_ConPincode', 'amsT_ConPincode') ? `PIN: ${getField(secondTab, 'AMST_ConPincode', 'amsT_ConPincode')}` : ''
    ].filter(Boolean).join(', ');

    const permAddrDetails = [
        getField(viewStudentDetails, 'AMST_PerStreet', 'amsT_PerStreet'),
        getField(viewStudentDetails, 'AMST_PerArea', 'amsT_PerArea'),
        getField(viewStudentDetails, 'AMST_PerCity', 'amsT_PerCity'),
        getField(viewStudentDetails, 'AMST_PerPincode', 'amsT_PerPincode') ? `PIN: ${getField(viewStudentDetails, 'AMST_PerPincode', 'amsT_PerPincode')}` : ''
    ].filter(Boolean).join(', ');

    const presAddrDetails = [
        getField(viewStudentDetails, 'AMST_ConStreet', 'amsT_ConStreet'),
        getField(viewStudentDetails, 'AMST_ConArea', 'amsT_ConArea'),
        getField(viewStudentDetails, 'AMST_ConCity', 'amsT_ConCity'),
        getField(viewStudentDetails, 'AMST_ConPincode', 'amsT_ConPincode') ? `PIN: ${getField(viewStudentDetails, 'AMST_ConPincode', 'amsT_ConPincode')}` : ''
    ].filter(Boolean).join(', ');

    const permanentAddress =
        getField(studentList1, 'PermanentAddress', 'permanentAddress') ||
        permAddrThird ||
        permAddrSecond ||
        permAddrDetails ||
        'N/A';

    const communicationAddress =
        getField(studentList1, 'ContactAddress', 'contactAddress') ||
        presAddrThird ||
        presAddrSecond ||
        presAddrDetails ||
        permanentAddress ||
        'N/A';

    // Attendance Details
    const attendanceYear = getField(studentList, 'ASMAY_Year', 'asmaY_Year') || currentAcademicYear;
    const presentDays = getField(studentList, 'PRESENTDAYS', 'presentDays', 'presentdays') ?? 'N/A';
    const workingDays = getField(studentList, 'WORKINGDAYS', 'workingDays', 'workingdays') ?? 'N/A';
    const rawPercentage = getField(studentList, 'PERCENTAGE', 'percentage');
    const percentage = rawPercentage !== undefined && rawPercentage !== null && rawPercentage !== '' ? `${rawPercentage}%` : 'N/A';

    // Subjects List resolution
    let effectiveSubjectsList = subjectsList;
    if (!effectiveSubjectsList || effectiveSubjectsList.length === 0) {
        const compSubjects = getArray(configData, 'allCompSubject', 'compSubjectList');
        if (compSubjects && compSubjects.length > 0) {
            effectiveSubjectsList = compSubjects.map((cs: any) => ({
                ISMS_SubjectName: getField(cs, 'ismS_SubjectName', 'subjectName', 'name', 'ISMS_SubjectCode'),
                ESTSU_ElecetiveFlag: false
            }));
        } else {
            const languages = [
                { name: getField(fifthTab, 'AMST_FirstLanguage', 'amsT_FirstLanguage'), type: 'First Language' },
                { name: getField(fifthTab, 'AMST_SecondLanguage', 'amsT_SecondLanguage'), type: 'Second Language' },
                { name: getField(fifthTab, 'AMST_Thirdlanguage', 'amsT_Thirdlanguage'), type: 'Third Language' }
            ].filter((l) => Boolean(l.name));
            if (languages.length > 0) {
                effectiveSubjectsList = languages.map((l) => ({
                    ISMS_SubjectName: `${l.name} (${l.type})`,
                    ESTSU_ElecetiveFlag: false
                }));
            }
        }
    }

    const yearsForDropdown = allYears.length > 0 ? allYears : academicYearList;

    const isLoading = (isProfileLoading || isTabsLoading) && !studentData && !viewStudentDetails?.AMST_Id && !firstTab?.AMST_Id;

    return (
        <AdaptiveDialog
            isOpen={isOpen}
            onClose={onClose}
            size='full'
            showCloseButton={false}
            className='max-h-[95vh] w-[95vw] max-w-[1400px] gap-0 overflow-hidden border-0 p-0'>
            <Title className='sr-only'>STUDENT DETAILS</Title>
            <div className='flex items-center justify-between rounded-t-lg bg-[#1f4e79] px-6 py-3 text-white'>
                <h2 className='font-bold text-lg uppercase tracking-wide'>STUDENT DETAILS</h2>
                <button onClick={onClose} className='text-white hover:text-gray-200 focus:outline-none'>
                    <X className='h-5 w-5' />
                </button>
            </div>
            <AdaptiveBody className='flex max-h-[85vh] overflow-hidden rounded-b-lg bg-slate-50 p-0'>
                {isLoading ? (
                    <div className='flex h-64 w-full items-center justify-center p-10'>
                        <span className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent' />
                    </div>
                ) : (
                    <div className='flex h-full w-full flex-col md:flex-row'>
                        {/* Left Sidebar */}
                        <div className='w-full overflow-y-auto border-r bg-white p-6 shadow-sm md:w-1/4'>
                            <div className='mb-6 flex flex-col items-center'>
                                <div className='h-32 w-32 overflow-hidden rounded-md border-2 border-gray-200 bg-gray-100 shadow-sm'>
                                    {profilePic ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profilePic} alt='Student' className='h-full w-full object-cover' />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center text-gray-400'>
                                            <User className='h-16 w-16' />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className='mb-4 flex items-center gap-2 border-b pb-2 font-bold text-blue-900 text-lg'>
                                STUDENT DETAILS : <User className='h-4 w-4 text-green-600' fill='currentColor' />
                            </h3>

                            <div className='space-y-3 text-sm'>
                                <p className='font-bold text-gray-900'>{studentName}</p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Admission No. :</span>{' '}
                                    {admissionNo}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Date Of Admission :</span>{' '}
                                    {admissionDate}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Date Of Birth :</span>{' '}
                                    {dateOfBirth}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Admitted Year :</span>{' '}
                                    {admittedYear}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Admitted Class :</span>{' '}
                                    {admittedClass}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Gender :</span> {gender}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Mobile :</span>{' '}
                                    {mobileNo}
                                </p>
                                <p>
                                    <span className='font-semibold text-gray-900'>Email :</span> {email}
                                </p>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className='w-full overflow-y-auto bg-slate-50 p-6 md:w-3/4'>
                            <Tabs defaultValue='academic' className='w-full'>
                                <TabsList className='h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b bg-transparent p-0'>
                                    <TabsTrigger
                                        value='academic'
                                        className='rounded-t-sm rounded-b-none border-b-0 bg-white px-6 py-2.5 font-semibold text-[#1f4e79] transition-colors data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white'>
                                        Academic Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='address'
                                        className='rounded-t-sm rounded-b-none border-b-0 bg-white px-6 py-2.5 font-semibold text-[#1f4e79] transition-colors data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white'>
                                        Address/Parents Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='attendance'
                                        className='rounded-t-sm rounded-b-none border-b-0 bg-white px-6 py-2.5 font-semibold text-[#1f4e79] transition-colors data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white'>
                                        Attendance Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='subject'
                                        className='rounded-t-sm rounded-b-none border-b-0 bg-white px-6 py-2.5 font-semibold text-[#1f4e79] transition-colors data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white'>
                                        Subject Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='library'
                                        className='rounded-t-sm rounded-b-none border-b-0 bg-white px-6 py-2.5 font-semibold text-[#1f4e79] transition-colors data-[state=active]:bg-[#1f4e79] data-[state=active]:text-white'>
                                        Library Details
                                    </TabsTrigger>
                                </TabsList>

                                <div className='mt-6 rounded-md border bg-white p-4 shadow-sm'>
                                    <TabsContent value='academic' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
                                        <div className='flex items-start gap-8'>
                                            <div className='flex items-center font-medium text-blue-600'>
                                                <span>{currentAcademicYear}</span>
                                                <div className='ml-4 h-4 w-4 rounded-full border-2 border-green-500 bg-white' />
                                            </div>
                                            <div className='space-y-2 border-gray-200 border-l-2 pl-4 text-gray-700 text-sm'>
                                                <p>
                                                    Class / Section : {currentClass} / {currentSection}
                                                </p>
                                                <p>Roll No. : {rollNo}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='address' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                            <div className='space-y-4'>
                                                <h4 className='border-b pb-1 font-bold text-gray-900'>FATHER DETAILS</h4>
                                                <div className='flex items-start justify-between text-sm'>
                                                    <div className='space-y-2'>
                                                        <p>
                                                            <span className='font-semibold'>Name :</span>{' '}
                                                            {fatherName}
                                                        </p>
                                                        <p>
                                                            <span className='font-semibold'>Mobile :</span>{' '}
                                                            {fatherMobile}
                                                        </p>
                                                        <p>
                                                            <span className='font-semibold'>Email :</span>{' '}
                                                            {fatherEmail}
                                                        </p>
                                                    </div>
                                                    <div className='flex h-20 w-16 items-center justify-center overflow-hidden border bg-gray-100 text-gray-400 text-xs'>
                                                        {fatherPhoto ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={fatherPhoto}
                                                                alt='Father'
                                                                className='h-full w-full object-cover'
                                                            />
                                                        ) : (
                                                            'Photo'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-4'>
                                                <h4 className='border-b pb-1 font-bold text-gray-900'>MOTHER DETAILS</h4>
                                                <div className='flex items-start justify-between text-sm'>
                                                    <div className='space-y-2'>
                                                        <p>
                                                            <span className='font-semibold'>Name :</span>{' '}
                                                            {motherName}
                                                        </p>
                                                        <p>
                                                            <span className='font-semibold'>Mobile :</span>{' '}
                                                            {motherMobile}
                                                        </p>
                                                        <p>
                                                            <span className='font-semibold'>Email :</span>{' '}
                                                            {motherEmail}
                                                        </p>
                                                    </div>
                                                    <div className='flex h-20 w-16 items-center justify-center overflow-hidden border bg-gray-100 text-gray-400 text-xs'>
                                                        {motherPhoto ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={motherPhoto}
                                                                alt='Mother'
                                                                className='h-full w-full object-cover'
                                                            />
                                                        ) : (
                                                            'Photo'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='space-y-4 border-t pt-4'>
                                                <h4 className='border-b pb-1 font-bold text-gray-900'>PERMANENT ADDRESS</h4>
                                                <div className='space-y-1 text-blue-800 text-sm'>
                                                    <p>{permanentAddress}</p>
                                                </div>
                                            </div>

                                            <div className='space-y-4 border-t pt-4'>
                                                <h4 className='border-b pb-1 font-bold text-gray-900'>COMMUNICATION ADDRESS</h4>
                                                <div className='space-y-1 text-blue-800 text-sm'>
                                                    <p>{communicationAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='attendance' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
                                        <div className='flex items-start gap-8'>
                                            <div className='flex items-center font-medium text-blue-600'>
                                                <span>{attendanceYear}</span>
                                                <div className='ml-4 h-4 w-4 rounded-full border-2 border-green-500 bg-white' />
                                            </div>
                                            <div className='space-y-2 border-gray-200 border-l-2 pl-4 text-gray-700 text-sm'>
                                                <p className='font-bold text-blue-700'>CURRENT YEAR</p>
                                                <p>
                                                    Class / Section : {currentClass} / {currentSection}
                                                </p>
                                                <p>Present Days : {presentDays}</p>
                                                <p>Working Days : {workingDays}</p>
                                                <p>Percentage : {percentage}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='subject' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
                                        <table className='w-full border text-left text-sm'>
                                            <thead className='bg-blue-600 text-white'>
                                                <tr>
                                                    <th className='w-16 border-r px-4 py-2 text-center font-semibold'>Sl.No</th>
                                                    <th className='border-r px-4 py-2 text-center font-semibold'>Subject Name</th>
                                                    <th className='w-24 px-4 py-2 text-center font-semibold'>Elective</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {effectiveSubjectsList?.length > 0 ? (
                                                    effectiveSubjectsList.map((item: any, i: number) => {
                                                        const subjectName = getField(item, 'ISMS_SubjectName', 'ismS_SubjectName', 'subjectName', 'name') || 'N/A';
                                                        const isElective = getField(item, 'ESTSU_ElecetiveFlag', 'estsU_ElecetiveFlag', 'isElective');
                                                        return (
                                                            <tr key={i} className='border-b hover:bg-gray-50'>
                                                                <td className='border-r px-4 py-2 text-center font-medium text-blue-800'>
                                                                    {i + 1}
                                                                </td>
                                                                <td className='border-r px-4 py-2 font-medium text-blue-800 uppercase'>
                                                                    {subjectName}
                                                                </td>
                                                                <td className='px-4 py-2 text-center font-bold text-red-500'>
                                                                    {isElective ? '✔' : '✖'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className='px-4 py-4 text-center text-gray-500'>
                                                            No subject details available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </TabsContent>

                                    <TabsContent value='library' className='m-0 focus-visible:outline-none focus-visible:ring-0'>
                                        <div className='flex min-h-[250px] flex-col'>
                                            <div className='flex flex-1 items-start justify-center pt-8'>
                                                <div className='flex items-center gap-4'>
                                                    <label className='font-medium text-gray-700 text-sm'>
                                                        Academic Year:<span className='text-red-500'>*</span>
                                                    </label>
                                                    <select className='w-64 rounded border border-purple-600 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600'>
                                                        <option value=''>--Select--</option>
                                                        {yearsForDropdown.map((ay: any, idx: number) => {
                                                            const id = getField(ay, 'ASMAY_Id', 'asmaY_Id', 'asmay_id') || idx;
                                                            const year = getField(ay, 'ASMAY_Year', 'asmaY_Year', 'asmay_year') || 'N/A';
                                                            return (
                                                                <option key={id} value={id}>
                                                                    {year}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className='mt-auto flex justify-end border-t bg-[#e9ecef] p-3'>
                                                <button
                                                    type='button'
                                                    onClick={onClose}
                                                    className='rounded border border-gray-300 bg-white px-4 py-1.5 font-medium text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50'>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                )}
            </AdaptiveBody>
        </AdaptiveDialog>
    );
}
