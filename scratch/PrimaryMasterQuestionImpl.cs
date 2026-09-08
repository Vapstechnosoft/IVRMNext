using System;
using System.Linq;
using System.Threading.Tasks;
using CommonLibrary;
using CommonLibrary.com.vaps.Common;
using DataAccessMsSqlServerProvider.com.vapstech.Exam;
using DomainModel.Model.NAAC.LP_OnlineExam;
using Microsoft.EntityFrameworkCore;
using PrimaryServiceHub.Interfaces;
using PreadmissionDTOs.com.vaps.OnlineExam;

namespace PrimaryServiceHub.Services
{
    public class MasterQuestionImpl : MasterQuestionInterface
    {
        private readonly DomainModelMsSqlServerContext _context;

        public MasterQuestionImpl(DomainModelMsSqlServerContext context)
        {
            _context = context ??
                throw new ArgumentNullException(nameof(context));
        }

        // ---------------------------------------------------------
        // INITIAL LOAD
        // ---------------------------------------------------------

        public async Task<APIResponseDto> GetInitialLoadData(
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI = token.MI_Id;

                var classList = await _context.AdmissionClass
                    .Where(a =>
                        a.MI_Id == targetMI &&
                        a.ASMCL_ActiveFlag == true)
                    .OrderBy(a => a.ASMCL_Order)
                    .Select(c => new
                    {
                        asmcL_Id = c.ASMCL_Id,
                        asmcL_ClassName =
                            c.ASMCL_ClassName ?? string.Empty,
                        asmcL_ClassOrder = c.ASMCL_Order
                    })
                    .AsNoTracking()
                    .ToListAsync();

                var subjectList =
                    await _context.IVRM_School_Master_SubjectsDMO
                    .Where(s =>
                        s.MI_Id == targetMI &&
                        s.ISMS_ActiveFlag == 1)
                    .OrderBy(s => s.ISMS_OrderFlag)
                    .Select(s => new
                    {
                        ismS_Id = s.ISMS_Id,
                        ismS_SubjectName =
                            s.ISMS_SubjectName ?? string.Empty,
                        ismS_SubjectCode =
                            s.ISMS_SubjectCode ?? string.Empty
                    })
                    .AsNoTracking()
                    .ToListAsync();

                var complexityList =
                    await _context.LP_Master_ComplexitiesDMO
                    .Where(c =>
                        c.LPMCOMP_ActiveFlg == true ||
                        c.LPMCOMP_ActiveFlg == null)
                    .OrderBy(c => c.LPMCOMP_Id)
                    .Select(c => new
                    {
                        lmsmoecX_Id = c.LPMCOMP_Id,
                        lmsmoecX_ComplexityName =
                            c.LPMCOMP_ComplexityName ?? string.Empty,
                        lpmcomP_Id = c.LPMCOMP_Id,
                        lpmcomP_ComplexityName =
                            c.LPMCOMP_ComplexityName ?? string.Empty
                    })
                    .AsNoTracking()
                    .ToListAsync();

                var topicList =
                    await (
                        from a in _context.SchoolSubjectWithMasterTopicMapping
                        join b in _context.MasterSchoolTopicDMO
                            on a.LPMMT_Id equals b.LPMMT_Id
                        where a.MI_Id == targetMI &&
                              a.LPMT_ActiveFlag == true
                        select new
                        {
                            lpmT_Id = a.LPMT_Id,
                            lpmT_TopicName =
                                a.LPMT_TopicName ?? string.Empty,
                            ismS_Id = b.ISMS_Id
                        }
                    )
                    .AsNoTracking()
                    .ToListAsync();

                response.success = true;
                response.message =
                    "Initial load data fetched successfully";

                response.data = new
                {
                    getClass = classList,
                    getSubjects = subjectList,
                    getComplexity = complexityList,
                    getTopics = topicList
                };
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // GET MASTER QUESTION LIST
        // ---------------------------------------------------------

        public async Task<APIResponseDto> GetMasterQuestionList(
            APIRequestDto? request,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI = token.MI_Id;

                var query =
                    from a in _context.LMS_Master_OE_QuestionsDMO

                    join c in _context.AdmissionClass
                        on a.ASMCL_Id equals c.ASMCL_Id
                        into cJoin
                    from c in cJoin.DefaultIfEmpty()

                    join d in _context.IVRM_School_Master_SubjectsDMO
                        on a.ISMS_Id equals d.ISMS_Id
                        into dJoin
                    from d in dJoin.DefaultIfEmpty()

                    join f in _context.LP_Master_ComplexitiesDMO
                        on a.LPMCOMP_Id equals f.LPMCOMP_Id
                        into fJoin
                    from f in fJoin.DefaultIfEmpty()

                    where a.MI_Id == targetMI

                    select new MasterQuestionDTO
                    {
                        LMSMOEQ_Id = a.LMSMOEQ_Id,
                        MI_Id = a.MI_Id ?? 0,

                        ASMCL_Id = a.ASMCL_Id ?? 0,

                        ASMCL_ClassName =
                            c != null
                            ? c.ASMCL_ClassName ?? string.Empty
                            : string.Empty,

                        ISMS_Id = a.ISMS_Id ?? 0,

                        ISMS_SubjectName =
                            d != null
                            ? d.ISMS_SubjectName ?? string.Empty
                            : string.Empty,

                        LPMT_Id = a.LPMT_Id ?? 0,

                        LPMCOMP_Id = a.LPMCOMP_Id ?? 0,

                        LPMCOMP_ComplexityName =
                            f != null
                            ? f.LPMCOMP_ComplexityName ?? string.Empty
                            : "Standard",

                        LMSMOEQ_Marks =
                            a.LMSMOEQ_Marks ?? 1,

                        LMSMOEQ_Question =
                            a.LMSMOEQ_Question ?? string.Empty,

                        LMSMOEQ_QuestionDesc =
                            a.LMSMOEQ_QuestionDesc ?? string.Empty,

                        LMSMOEQ_ActiveFlg =
                            a.LMSMOEQ_ActiveFlg ?? true,

                        LMSMOEQ_NoOfOptions =
                            a.LMSMOEQ_NoOfOptions ?? 0,

                        LMSMOEQ_SubjectiveFlg =
                            a.LMSMOEQ_SubjectiveFlg ?? false,

                        LMSMOEQ_MatchTheFollowingFlg =
                            a.LMSMOEQ_MatchTheFollowingFlg ?? false,

                        LMSMOEQ_StructuralFlg =
                            a.LMSMOEQ_StructuralFlg ?? string.Empty,

                        LMSMOEQ_Answer =
                            a.LMSMOEQ_Answer ?? string.Empty,

                        countdoc =
                            _context.LMS_Master_OE_Questions_FilesDMO
                            .Count(b =>
                                b.LMSMOEQ_Id == a.LMSMOEQ_Id),

                        countoption =
                            _context.LMS_Master_OE_QNS_OptionsDMO
                            .Count(b =>
                                b.LMSMOEQ_Id == a.LMSMOEQ_Id),

                        CreatedDate =
                            a.CreatedDate ?? DateTime.UtcNow,

                        UpdatedDate =
                            a.UpdatedDate ?? DateTime.UtcNow
                    };

                if (request != null &&
                    !string.IsNullOrWhiteSpace(
                        request.search_query))
                {
                    var search =
                        request.search_query.Trim().ToLower();

                    query = query.Where(a =>
                        a.LMSMOEQ_Question
                            .ToLower()
                            .Contains(search) ||

                        a.ISMS_SubjectName
                            .ToLower()
                            .Contains(search) ||

                        a.ASMCL_ClassName
                            .ToLower()
                            .Contains(search) ||

                        a.LPMCOMP_ComplexityName
                            .ToLower()
                            .Contains(search));
                }

                query = query.OrderBy(a => a.LMSMOEQ_Id);

                var totalCount =
                    await query.CountAsync();

                if (request != null &&
                    request.page_size > 0 &&
                    request.page > 0)
                {
                    query = query
                        .Skip(
                            (request.page - 1) *
                            request.page_size)
                        .Take(request.page_size);
                }

                var list =
                    await query.ToListAsync();

                response.success = true;
                response.message =
                    "Master questions fetched successfully";

                response.data = list;
                response.total = totalCount;
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------

        public async Task<APIResponseDto> GetMasterQuestionById(
            long id,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI = token.MI_Id;

                var question =
                    await _context.LMS_Master_OE_QuestionsDMO
                    .Where(a =>
                        a.LMSMOEQ_Id == id &&
                        a.MI_Id == targetMI)
                    .Select(a => new MasterQuestionDTO
                    {
                        LMSMOEQ_Id = a.LMSMOEQ_Id,
                        MI_Id = a.MI_Id ?? 0,
                        ASMCL_Id = a.ASMCL_Id ?? 0,
                        ISMS_Id = a.ISMS_Id ?? 0,
                        LPMT_Id = a.LPMT_Id ?? 0,
                        LPMCOMP_Id = a.LPMCOMP_Id ?? 0,

                        LMSMOEQ_Marks =
                            a.LMSMOEQ_Marks ?? 1,

                        LMSMOEQ_Question =
                            a.LMSMOEQ_Question ?? string.Empty,

                        LMSMOEQ_QuestionDesc =
                            a.LMSMOEQ_QuestionDesc ?? string.Empty,

                        LMSMOEQ_ActiveFlg =
                            a.LMSMOEQ_ActiveFlg ?? true,

                        LMSMOEQ_NoOfOptions =
                            a.LMSMOEQ_NoOfOptions ?? 0,

                        LMSMOEQ_SubjectiveFlg =
                            a.LMSMOEQ_SubjectiveFlg ?? false,

                        LMSMOEQ_MatchTheFollowingFlg =
                            a.LMSMOEQ_MatchTheFollowingFlg ?? false,

                        LMSMOEQ_StructuralFlg =
                            a.LMSMOEQ_StructuralFlg ?? string.Empty,

                        LMSMOEQ_Answer =
                            a.LMSMOEQ_Answer ?? string.Empty,

                        CreatedDate =
                            a.CreatedDate ?? DateTime.UtcNow,

                        UpdatedDate =
                            a.UpdatedDate ?? DateTime.UtcNow
                    })
                    .FirstOrDefaultAsync();

                if (question == null)
                {
                    response.success = false;
                    response.message =
                        "Question not found";

                    return response;
                }

                question.QuestionOptions =
                    await _context
                    .LMS_Master_OE_QNS_OptionsDMO
                    .Where(o =>
                        o.LMSMOEQ_Id == id)
                    .Select(o => new MasterQuestionOptionDto
                    {
                        LMSMOEQOA_Id =
                            o.LMSMOEQOA_Id,

                        LMSMOEQ_Id =
                            o.LMSMOEQ_Id,

                        LMSMOEQOA_Option =
                            o.LMSMOEQOA_Option ??
                            string.Empty,

                        LMSMOEQOA_OptionCode =
                            o.LMSMOEQOA_OptionCode ??
                            string.Empty,

                        LMSMOEQOA_AnswerFlag =
                            o.LMSMOEQOA_AnswerFlag ??
                            false,

                        LMSMOEQOA_Marks =
                            o.LMSMOEQOA_Marks,

                        LMSMOEQOA_ActiveFlg =
                            o.LMSMOEQOA_ActiveFlg ??
                            true
                    })
                    .ToListAsync();

                question.QuestionFiles =
                    await _context
                    .LMS_Master_OE_Questions_FilesDMO
                    .Where(f =>
                        f.LMSMOEQ_Id == id)
                    .Select(f => new MasterQuestionFileDto
                    {
                        LMSMOEQF_Id =
                            f.LMSMOEQF_Id,

                        LMSMOEQ_Id =
                            f.LMSMOEQ_Id,

                        LMSMOEQF_FileName =
                            f.LMSMOEQF_FileName ??
                            string.Empty,

                        LMSMOEQF_FilePath =
                            f.LMSMOEQF_FilePath ??
                            string.Empty,

                        LMSMOEQF_ActiveFlag =
                            f.LMSMOEQF_ActiveFlag ??
                            true
                    })
                    .ToListAsync();

                response.success = true;
                response.message =
                    "Question details fetched successfully";

                response.data = question;
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // ADD / UPDATE
        // ---------------------------------------------------------

        public async Task<APIResponseDto> AddOrUpdateMasterQuestion(
            MasterQuestionRequestDto request,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                DateTime nowUtc =
                    DateTime.UtcNow;

                long targetMI =
                    token.MI_Id;

                long userId =
                    token.UserId;

                long? classId =
                    request.ASMCL_Id > 0
                    ? request.ASMCL_Id
                    : (
                        request.selectedClassList != null &&
                        request.selectedClassList.Count > 0 &&
                        request.selectedClassList[0] > 0
                        ? request.selectedClassList[0]
                        : (long?)null
                    );

                long? subjectId =
                    request.ISMS_Id > 0
                    ? request.ISMS_Id
                    : (long?)null;

                long? topicId =
                    request.LPMT_Id > 0
                    ? request.LPMT_Id
                    : (long?)null;

                long? complexityId =
                    request.LPMCOMP_Id > 0
                    ? request.LPMCOMP_Id
                    : (long?)null;

                if (complexityId == null ||
                    complexityId == 0)
                {
                    complexityId =
                        await _context
                        .LP_Master_ComplexitiesDMO
                        .Where(c =>
                            c.LPMCOMP_DefaultFlg == true ||
                            c.LPMCOMP_ActiveFlg == true)
                        .OrderByDescending(c =>
                            c.LPMCOMP_DefaultFlg)
                        .Select(c =>
                            (long?)c.LPMCOMP_Id)
                        .FirstOrDefaultAsync();
                }

                // ==========================
                // UPDATE
                // ==========================

                if (request.LMSMOEQ_Id > 0)
                {
                    var record =
                        await _context
                        .LMS_Master_OE_QuestionsDMO
                        .Where(a =>
                            a.LMSMOEQ_Id ==
                            request.LMSMOEQ_Id &&
                            a.MI_Id == targetMI)
                        .FirstOrDefaultAsync();

                    if (record == null)
                    {
                        response.success = false;
                        response.message =
                            "Question record not found";

                        return response;
                    }

                    if (subjectId.HasValue)
                        record.ISMS_Id =
                            subjectId;

                    if (classId.HasValue)
                        record.ASMCL_Id =
                            classId;

                    if (topicId.HasValue)
                        record.LPMT_Id =
                            topicId;

                    if (complexityId.HasValue)
                        record.LPMCOMP_Id =
                            complexityId;

                    record.LMSMOEQ_Question =
                        request.LMSMOEQ_Question
                        ?.Trim() ??
                        string.Empty;

                    record.LMSMOEQ_QuestionDesc =
                        request.LMSMOEQ_QuestionDesc
                        ?.Trim() ??
                        string.Empty;

                    record.LMSMOEQ_Marks =
                        request.LMSMOEQ_Marks;

                    record.LMSMOEQ_SubjectiveFlg =
                        request.LMSMOEQ_SubjectiveFlg;

                    record.LMSMOEQ_MatchTheFollowingFlg =
                        request.LMSMOEQ_MatchTheFollowingFlg;

                    record.LMSMOEQ_StructuralFlg =
                        request.LMSMOEQ_StructuralFlg ??
                        string.Empty;

                    record.LMSMOEQ_Answer =
                        request.LMSMOEQ_Answer ??
                        string.Empty;

                    record.LMSMOEQ_UpdatedBy =
                        userId;

                    record.UpdatedDate =
                        nowUtc;

                    if (request.tempoptionsDTO != null &&
                        request.tempoptionsDTO.Count > 0)
                    {
                        var existingOpts =
                            await _context
                            .LMS_Master_OE_QNS_OptionsDMO
                            .Where(o =>
                                o.LMSMOEQ_Id ==
                                record.LMSMOEQ_Id)
                            .ToListAsync();

                        foreach (var opt in
                                 request.tempoptionsDTO)
                        {
                            if (opt.LMSMOEQOA_Id > 0)
                            {
                                var exist =
                                    existingOpts
                                    .FirstOrDefault(e =>
                                        e.LMSMOEQOA_Id ==
                                        opt.LMSMOEQOA_Id);

                                if (exist != null)
                                {
                                    exist.LMSMOEQOA_Option =
                                        opt.LMSMOEQOA_Option;

                                    exist.LMSMOEQOA_OptionCode =
                                        opt.LMSMOEQOA_OptionCode ??
                                        string.Empty;

                                    exist.LMSMOEQOA_AnswerFlag =
                                        opt.LMSMOEQOA_AnswerFlag;

                                    exist.LMSMOEQOA_Marks =
                                        opt.LMSMOEQOA_Marks;

                                    exist.LMSMOEQOA_ActiveFlg =
                                        true;

                                    exist.LMSMOEQOA_UpdatedBy =
                                        userId;

                                    exist.UpdatedDate =
                                        nowUtc;

                                    _context.Update(exist);
                                }
                            }
                            else
                            {
                                var newOpt =
                                    new LMS_Master_OE_QNS_OptionsDMO
                                    {
                                        LMSMOEQ_Id =
                                            record.LMSMOEQ_Id,

                                        LMSMOEQOA_Option =
                                            opt.LMSMOEQOA_Option,

                                        LMSMOEQOA_OptionCode =
                                            opt.LMSMOEQOA_OptionCode ??
                                            string.Empty,

                                        LMSMOEQOA_AnswerFlag =
                                            opt.LMSMOEQOA_AnswerFlag,

                                        LMSMOEQOA_Marks =
                                            opt.LMSMOEQOA_Marks,

                                        LMSMOEQOA_ActiveFlg =
                                            true,

                                        LMSMOEQOA_CreatedBy =
                                            userId,

                                        LMSMOEQOA_UpdatedBy =
                                            userId,

                                        CreatedDate =
                                            nowUtc,

                                        UpdatedDate =
                                            nowUtc
                                    };

                                _context.Add(newOpt);
                            }
                        }

                        record.LMSMOEQ_NoOfOptions =
                            request.tempoptionsDTO.Count;
                    }

                    _context.Update(record);

                    await _context.SaveChangesAsync();

                    response.success = true;
                    response.message =
                        "Update";

                    response.data =
                        record;
                }
                else
                {
                    // ==========================
                    // INSERT
                    // ==========================

                    var newRecord =
                        new LMS_Master_OE_QuestionsDMO
                        {
                            MI_Id =
                                targetMI,

                            ISMS_Id =
                                subjectId,

                            ASMCL_Id =
                                classId,

                            LPMT_Id =
                                topicId,

                            LPMCOMP_Id =
                                complexityId,

                            LMSMOEQ_Question =
                                request.LMSMOEQ_Question
                                ?.Trim() ??
                                string.Empty,

                            LMSMOEQ_QuestionDesc =
                                request.LMSMOEQ_QuestionDesc
                                ?.Trim() ??
                                string.Empty,

                            LMSMOEQ_Marks =
                                request.LMSMOEQ_Marks,

                            LMSMOEQ_SubjectiveFlg =
                                request.LMSMOEQ_SubjectiveFlg,

                            LMSMOEQ_MatchTheFollowingFlg =
                                request.LMSMOEQ_MatchTheFollowingFlg,

                            LMSMOEQ_StructuralFlg =
                                request.LMSMOEQ_StructuralFlg ??
                                string.Empty,

                            LMSMOEQ_Answer =
                                request.LMSMOEQ_Answer ??
                                string.Empty,

                            LMSMOEQ_NoOfOptions =
                                request.tempoptionsDTO
                                ?.Count ?? 0,

                            LMSMOEQ_ActiveFlg =
                                true,

                            LMSMOEQ_CreatedBy =
                                userId,

                            LMSMOEQ_UpdatedBy =
                                userId,

                            CreatedDate =
                                nowUtc,

                            UpdatedDate =
                                nowUtc
                        };

                    _context.Add(newRecord);

                    await _context.SaveChangesAsync();

                    // Save Options
                    if (request.tempoptionsDTO != null &&
                        request.tempoptionsDTO.Count > 0)
                    {
                        foreach (var opt in
                                 request.tempoptionsDTO)
                        {
                            var newOpt =
                                new LMS_Master_OE_QNS_OptionsDMO
                                {
                                    LMSMOEQ_Id =
                                        newRecord.LMSMOEQ_Id,

                                    LMSMOEQOA_Option =
                                        opt.LMSMOEQOA_Option,

                                    LMSMOEQOA_OptionCode =
                                        opt.LMSMOEQOA_OptionCode ??
                                        string.Empty,

                                    LMSMOEQOA_AnswerFlag =
                                        opt.LMSMOEQOA_AnswerFlag,

                                    LMSMOEQOA_Marks =
                                        opt.LMSMOEQOA_Marks,

                                    LMSMOEQOA_ActiveFlg =
                                        true,

                                    LMSMOEQOA_CreatedBy =
                                        userId,

                                    LMSMOEQOA_UpdatedBy =
                                        userId,

                                    CreatedDate =
                                        nowUtc,

                                    UpdatedDate =
                                        nowUtc
                                };

                            _context.Add(newOpt);
                        }

                        await _context.SaveChangesAsync();
                    }

                    // Save Files
                    if (request.tempfilesDTO != null &&
                        request.tempfilesDTO.Count > 0)
                    {
                        foreach (var f in
                                 request.tempfilesDTO)
                        {
                            var newFile =
                                new LMS_Master_OE_Questions_FilesDMO
                                {
                                    LMSMOEQ_Id =
                                        newRecord.LMSMOEQ_Id,

                                    LMSMOEQF_FileName =
                                        f.LMSMOEQF_FileName,

                                    LMSMOEQF_FilePath =
                                        f.LMSMOEQF_FilePath,

                                    LMSMOEQF_ActiveFlag =
                                        true
                                };

                            _context.Add(newFile);
                        }

                        await _context.SaveChangesAsync();
                    }

                    response.success = true;
                    response.message =
                        "Add";

                    response.data =
                        newRecord;
                }
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // EDIT
        // ---------------------------------------------------------

        public async Task<APIResponseDto> EditMasterQuestion(
            MasterQuestionRequestDto request,
            ExtractTokenDto token)
        {
            return await AddOrUpdateMasterQuestion(
                request,
                token);
        }

        // ---------------------------------------------------------
        // ACTIVATE / DEACTIVATE
        // ---------------------------------------------------------

        public async Task<APIResponseDto> ToggleMasterQuestion(
            long id,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI =
                    token.MI_Id;

                long userId =
                    token.UserId;

                var record =
                    await _context
                    .LMS_Master_OE_QuestionsDMO
                    .Where(a =>
                        a.LMSMOEQ_Id == id &&
                        a.MI_Id == targetMI)
                    .FirstOrDefaultAsync();

                if (record == null)
                {
                    response.success = false;
                    response.message =
                        "Question not found";

                    return response;
                }

                record.LMSMOEQ_ActiveFlg =
                    !(record.LMSMOEQ_ActiveFlg ??
                      false);

                record.LMSMOEQ_UpdatedBy =
                    userId;

                record.UpdatedDate =
                    DateTime.UtcNow;

                _context.Update(record);

                await _context.SaveChangesAsync();

                response.success = true;

                response.message =
                    record.LMSMOEQ_ActiveFlg == true
                    ? "Question activated successfully"
                    : "Question deactivated successfully";

                response.data =
                    record;
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // CLASS MAPPING
        // ---------------------------------------------------------

        public async Task<APIResponseDto> SaveClassMapping(
            SaveQuestionClassMappingDto request,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI =
                    token.MI_Id;

                long userId =
                    token.UserId;

                var question =
                    await _context
                    .LMS_Master_OE_QuestionsDMO
                    .Where(q =>
                        q.LMSMOEQ_Id ==
                        request.LMSMOEQ_Id &&
                        q.MI_Id == targetMI)
                    .FirstOrDefaultAsync();

                if (question == null)
                {
                    response.success = false;
                    response.message =
                        "Question not found";

                    return response;
                }

                if (request.selectedClassList != null &&
                    request.selectedClassList.Count > 0)
                {
                    var chosenClass =
                        request.selectedClassList
                        .FirstOrDefault(c => c > 0);

                    if (chosenClass > 0)
                    {
                        question.ASMCL_Id =
                            chosenClass;

                        question.LMSMOEQ_UpdatedBy =
                            userId;

                        question.UpdatedDate =
                            DateTime.UtcNow;

                        _context.Update(question);

                        await _context.SaveChangesAsync();
                    }
                }

                response.success = true;
                response.message =
                    "Class mapped successfully";
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // SAVE OPTIONS
        // ---------------------------------------------------------

        public async Task<APIResponseDto> SaveQuestionOptions(
            SaveQuestionOptionsDto request,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI =
                    token.MI_Id;

                long userId =
                    token.UserId;

                var question =
                    await _context
                    .LMS_Master_OE_QuestionsDMO
                    .Where(q =>
                        q.LMSMOEQ_Id ==
                        request.LMSMOEQ_Id &&
                        q.MI_Id == targetMI)
                    .FirstOrDefaultAsync();

                if (question == null)
                {
                    response.success = false;
                    response.message =
                        "Question not found";

                    return response;
                }

                var existing =
                    await _context
                    .LMS_Master_OE_QNS_OptionsDMO
                    .Where(o =>
                        o.LMSMOEQ_Id ==
                        request.LMSMOEQ_Id)
                    .ToListAsync();

                if (request.options != null &&
                    request.options.Count > 0)
                {
                    foreach (var opt in
                             request.options)
                    {
                        if (opt.LMSMOEQOA_Id > 0)
                        {
                            var exist =
                                existing
                                .FirstOrDefault(e =>
                                    e.LMSMOEQOA_Id ==
                                    opt.LMSMOEQOA_Id);

                            if (exist != null)
                            {
                                exist.LMSMOEQOA_Option =
                                    opt.LMSMOEQOA_Option;

                                exist.LMSMOEQOA_OptionCode =
                                    opt.LMSMOEQOA_OptionCode ??
                                    string.Empty;

                                exist.LMSMOEQOA_AnswerFlag =
                                    opt.LMSMOEQOA_AnswerFlag;

                                exist.LMSMOEQOA_ActiveFlg =
                                    true;

                                exist.LMSMOEQOA_UpdatedBy =
                                    userId;

                                exist.UpdatedDate =
                                    DateTime.UtcNow;

                                _context.Update(exist);
                            }
                        }
                        else
                        {
                            var newOpt =
                                new LMS_Master_OE_QNS_OptionsDMO
                                {
                                    LMSMOEQ_Id =
                                        request.LMSMOEQ_Id,

                                    LMSMOEQOA_Option =
                                        opt.LMSMOEQOA_Option,

                                    LMSMOEQOA_OptionCode =
                                        opt.LMSMOEQOA_OptionCode ??
                                        string.Empty,

                                    LMSMOEQOA_AnswerFlag =
                                        opt.LMSMOEQOA_AnswerFlag,

                                    LMSMOEQOA_ActiveFlg =
                                        true,

                                    LMSMOEQOA_CreatedBy =
                                        userId,

                                    LMSMOEQOA_UpdatedBy =
                                        userId,

                                    CreatedDate =
                                        DateTime.UtcNow,

                                    UpdatedDate =
                                        DateTime.UtcNow
                                };

                            _context.Add(newOpt);
                        }
                    }

                    question.LMSMOEQ_NoOfOptions =
                        request.options.Count;

                    question.LMSMOEQ_UpdatedBy =
                        userId;

                    question.UpdatedDate =
                        DateTime.UtcNow;

                    _context.Update(question);

                    await _context.SaveChangesAsync();
                }

                response.success = true;
                response.message =
                    "Options saved successfully";
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------

        public async Task<APIResponseDto> DeleteMasterQuestion(
            long id,
            ExtractTokenDto token)
        {
            var response = new APIResponseDto();

            try
            {
                _context.Database.SetCommandTimeout(30);

                long targetMI =
                    token.MI_Id;

                long userId =
                    token.UserId;

                var record =
                    await _context
                    .LMS_Master_OE_QuestionsDMO
                    .Where(a =>
                        a.LMSMOEQ_Id == id &&
                        a.MI_Id == targetMI)
                    .FirstOrDefaultAsync();

                if (record == null)
                {
                    response.success = false;
                    response.message =
                        "Question not found";

                    return response;
                }

                bool isUsedInExam =
                    await _context
                    .LP_Master_OE_Exam_QuestionsDMO
                    .Where(eq =>
                        eq.LMSMOEQ_Id == id)
                    .AnyAsync();

                if (isUsedInExam)
                {
                    response.success = false;
                    response.message =
                        "Cannot delete question as it is mapped in an existing exam";

                    return response;
                }

                var files =
                    await _context
                    .LMS_Master_OE_Questions_FilesDMO
                    .Where(f =>
                        f.LMSMOEQ_Id == id)
                    .ToListAsync();

                if (files.Count > 0)
                {
                    _context
                        .LMS_Master_OE_Questions_FilesDMO
                        .RemoveRange(files);
                }

                var options =
                    await _context
                    .LMS_Master_OE_QNS_OptionsDMO
                    .Where(o =>
                        o.LMSMOEQ_Id == id)
                    .ToListAsync();

                if (options.Count > 0)
                {
                    _context
                        .LMS_Master_OE_QNS_OptionsDMO
                        .RemoveRange(options);
                }

                // UserId used before delete for audit if required
                record.LMSMOEQ_UpdatedBy =
                    userId;

                _context
                    .LMS_Master_OE_QuestionsDMO
                    .Remove(record);

                await _context.SaveChangesAsync();

                response.success = true;
                response.message =
                    "Question deleted successfully";
            }
            catch (Exception ex)
            {
                response.success = false;
                response.message =
                    $"Error: {ex.Message} | Inner: {ex.InnerException?.Message}";
            }

            return response;
        }
    }
}