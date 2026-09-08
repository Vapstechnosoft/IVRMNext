using CommonLibrary;
using CommonLibrary.com.vaps.Common;
using PreadmissionDTOs.NAAC.LP_OnlineExam;
using System.Threading.Tasks;

namespace NaacServiceHub.LP_OnlineExam.Interface
{
    public interface MasterQuestionInterface
    {
        Task<APIResponseDto> GetInitialLoadData(ExtractTokenDto token);

        Task<APIResponseDto> GetMasterQuestionList(
            APIRequestDto? request,
            ExtractTokenDto token);

        Task<APIResponseDto> GetMasterQuestionById(
            long id,
            ExtractTokenDto token);

        Task<APIResponseDto> AddOrUpdateMasterQuestion(
            MasterQuestionRequestDto request,
            ExtractTokenDto token);

        Task<APIResponseDto> EditMasterQuestion(
            MasterQuestionRequestDto request,
            ExtractTokenDto token);

        Task<APIResponseDto> ToggleMasterQuestion(
            long id,
            ExtractTokenDto token);

        Task<APIResponseDto> SaveClassMapping(
            SaveQuestionClassMappingDto request,
            ExtractTokenDto token);

        Task<APIResponseDto> SaveQuestionOptions(
            SaveQuestionOptionsDto request,
            ExtractTokenDto token);

        Task<APIResponseDto> DeleteMasterQuestion(
            long id,
            ExtractTokenDto token);
    }
}