// Mock API services for Hutchings Junior College Admission Form

export const getInitialData = async () => {
  return {
    success: true,
    data: {
      studentList: [
        {
          pasr_id: 1,
          name: "John Doe",
          classname: "Class 11",
          streamname: "Science",
          pasR_RegistrationNo: "REG001",
          pasR_Sex: "Male",
          pasR_emailId: "john@example.com",
          username: "johndoe",
          viewflagclass: true,
          viewflag: true,
          download: true,
          ispaC_ApplFeeFlag: 1
        }
      ],
      countryList: [{ ivrmmC_Id: 1, ivrmmC_CountryName: "India" }],
      stateList: [{ ivrmmS_Id: 1, ivrmmS_Name: "Maharashtra" }],
      religionList: [{ ivrmmR_Id: 1, ivrmmR_Name: "Hindu" }],
      casteList: [{ imC_Id: 1, imC_CasteName: "General" }],
      classList: [{ asmcL_Id: 1, asmcL_ClassName: "Class 11" }, { asmcL_Id: 2, asmcL_ClassName: "Class 12" }],
      streamList: [{ asmsT_Id: 1, asmsT_StreamName: "Science" }, { asmsT_Id: 2, asmsT_StreamName: "Commerce" }],
      yearList: [{ asmaY_Id: 1, asmaY_Year: "2026-2027" }],
    }
  };
};

export const saveAdmissionData = async (data: any) => {
  return { success: true, message: "Admission data saved successfully" };
};
