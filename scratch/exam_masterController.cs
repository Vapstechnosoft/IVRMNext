
using CommonLibrary.com.vaps.Common;
using CommonLibrary.Helpers;
using ExamServiceHub.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
//using AdmissionServiceHub.com.vaps.Interfaces;
using PreadmissionDTOs;
using PreadmissionDTOs.com.vaps.Exam;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExamServiceHub.Controllers
{
    [Route("api/[controller]")]
    public class exam_masterController : Controller
    {
        public ExamMasterInterface _interface;

        public exam_masterController(ExamMasterInterface Interface)
        {
            _interface = Interface;
        }
        [HttpGet]
        public async Task<IActionResult> ExamMasterList([FromQuery] APIRequestDto? request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterList(token, request);
            return Ok(response);
        }
        [HttpGet("exam_master_order_list")]
        public async Task<IActionResult> ExamMasterOrderList([FromQuery] APIRequestDto? request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterOrderList(token, request);
            return Ok(response);
        }
        [HttpGet("exam_master_paper_type_list")]
        public async Task<IActionResult> ExamMasterPaperTypeList([FromQuery] APIRequestDto? request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterPaperTypeList(token, request);
            return Ok(response);
        }
        [HttpGet("exam_master_details_by_id/{eme_id}")]
        public async Task<IActionResult> ExamMasterDetailsById(long eme_id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterDetailsById(token, eme_id);
            return Ok(response);
        }
        [HttpGet("exam_master_paper_type_details_by_id/{empaty_id}")]
        public async Task<IActionResult> ExamMasterPaperTypeDetailsById(long empaty_id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterPaperTypeDetailsById(token, empaty_id);
            return Ok(response);
        }
        [HttpPut("toggle_exam_master/{id}")]
        public async Task<IActionResult> ToggleExamMaster(long id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ToggleExamMaster(token, id);
            return Ok(response);
        }
        [HttpPut("toggle_exam_master_paper_type/{id}")]
        public async Task<IActionResult> ToggleExamMasterPaperType(long id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ToggleExamMasterPaperType(token, id);
            return Ok(response);
        }
        [HttpPut("set_exam_master_order_number")]
        public async Task<IActionResult> SetExamMasterOrderNumber([FromBody] exammasterDTO request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.SetExamMasterOrderNumber(token, request);
            return Ok(response);
        }
        [HttpPost]
        public async Task<IActionResult> AddOrUpdateExamMaster([FromBody] exammasterDTO request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.AddOrUpdateExamMaster(token, request);
            return Ok(response);
        }
        [HttpPost("add_or_update_exam_master_paper_type")]
        public async Task<IActionResult> AddOrUpdateExamMasterPaperType([FromBody] ExamMasterPaperTypeDTO request)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.AddOrUpdateExamMasterPaperType(token, request);
            return Ok(response);
        }
        [HttpGet("exam_master_drop_down_list")]
        public async Task<IActionResult> ExamMasterDropDownList()
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamMasterDropDownList(token);
            return Ok(response);
        }
        [HttpGet("exam_drop_down_by_year_and_category_list/{asmay_id}/{emca_id}")]
        public async Task<IActionResult> ExamDropDownByAcademicYearAndCategoryList(long asmay_id, long emca_id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamDropDownByAcademicYearAndCategoryList(token, asmay_id, emca_id);
            return Ok(response);
        }

        [HttpGet("exam_drop_down_by_year_class_section_list/{asmay_id}/{asmcl_id}/{asms_id}")]
        public async Task<IActionResult> ExamDropDownByYearClassSectionList(long asmay_id, long asmcl_id, long asms_id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.ExamDropDownByYearClassSectionList(token, asmay_id, asmcl_id, asms_id);
            return Ok(response);
        }


        [HttpGet("get_academic_year_list")]
        public async Task<IActionResult> ExamDropDownByYearClassSectionList_(long asmay_id, long asmcl_id, long asms_id)
        {
            var token = Helpers.ExtractTokenDetails(HttpContext);
            if (token == null)
                return Unauthorized();
            var response = await _interface.getAcademicYearList(token);
            return Ok(response);
        }
    }
}
