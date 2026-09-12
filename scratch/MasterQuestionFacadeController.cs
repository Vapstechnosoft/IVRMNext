using CommonLibrary;
using CommonLibrary.com.vaps.Common;
using CommonLibrary.Helpers;
using Microsoft.AspNetCore.Mvc;
using NaacServiceHub.LP_OnlineExam.Interface;
using PreadmissionDTOs.NAAC.LP_OnlineExam;
using System.Threading.Tasks;

namespace NaacServiceHub.LP_OnlineExam.Facade
{
    [Route("api/[controller]")]
    public class MasterQuestionFacadeController : Controller
    {
        public MasterQuestionInterface _interface;

        public MasterQuestionFacadeController(MasterQuestionInterface Interface)
        {
            _interface = Interface;
        }

        [HttpGet("loaddata")]
        public async Task<IActionResult> GetInitialLoadData()
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.GetInitialLoadData(token);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetMasterQuestionList(
            [FromQuery] APIRequestDto? request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.GetMasterQuestionList(
                request,
                token);

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMasterQuestionById(long id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.GetMasterQuestionById(
                id,
                token);

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> AddOrUpdateMasterQuestion(
            [FromBody] MasterQuestionRequestDto data)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.AddOrUpdateMasterQuestion(
                data,
                token);

            return Ok(response);
        }

        [HttpPost("edit")]
        public async Task<IActionResult> EditMasterQuestion(
            [FromBody] MasterQuestionRequestDto data)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.EditMasterQuestion(
                data,
                token);

            return Ok(response);
        }

        [HttpPut("toggle/{id}")]
        public async Task<IActionResult> ToggleMasterQuestion(long id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.ToggleMasterQuestion(
                id,
                token);

            return Ok(response);
        }

        [HttpPost("class_mapping")]
        public async Task<IActionResult> SaveClassMapping(
            [FromBody] SaveQuestionClassMappingDto data)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.SaveClassMapping(
                data,
                token);

            return Ok(response);
        }

        [HttpPost("options")]
        public async Task<IActionResult> SaveQuestionOptions(
            [FromBody] SaveQuestionOptionsDto data)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.SaveQuestionOptions(
                data,
                token);

            return Ok(response);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteMasterQuestion(long id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();

            var response = await _interface.DeleteMasterQuestion(
                id,
                token);

            return Ok(response);
        }
    }
}