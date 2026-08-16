package secureassess.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import secureassess.dto.QuestionResultResponse;
import secureassess.dto.ResultResponse;
import secureassess.entity.ExamAttempt;
import secureassess.service.ExamAttemptService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attempts")
@CrossOrigin(origins = "*")
public class ExamAttemptController {

    private final ExamAttemptService attemptService;


    public ExamAttemptController(
            ExamAttemptService attemptService
    ) {

        this.attemptService =
                attemptService;
    }


    // ========================================
    // START EXAM
    // POST /api/attempts/start
    // ========================================

    @PostMapping("/start")
    public ResponseEntity<?> startExam(
            @RequestBody StartExamRequest request
    ) {

        try {

            ExamAttempt attempt =
                    attemptService.startExam(
                            request.studentId(),
                            request.examId()
                    );


            return ResponseEntity.ok(
                    attempt
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // SUBMIT EXAM
    // POST /api/attempts/{attemptId}/submit
    // ========================================

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<?> submitExam(
            @PathVariable Long attemptId,
            @RequestBody SubmitExamRequest request
    ) {

        try {

            ExamAttempt attempt =
                    attemptService.submitExam(

                            attemptId,

                            request.answers(),

                            request.tabSwitches(),

                            request.fullscreenExits(),

                            request.copyAttempts(),

                            request.integrityWarnings()
                    );


            return ResponseEntity.ok(
                    attempt
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // GET RESULT
    // GET /api/attempts/{attemptId}/result
    // ========================================

    @GetMapping("/{attemptId}/result")
    public ResponseEntity<?> getResult(
            @PathVariable Long attemptId
    ) {

        try {

            return ResponseEntity.ok(
                    attemptService.getResult(
                            attemptId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // GET QUESTION RESULTS
    // GET /api/attempts/{attemptId}/question-results
    // ========================================

    @GetMapping(
            "/{attemptId}/question-results"
    )
    public ResponseEntity<?> getQuestionResults(
            @PathVariable Long attemptId
    ) {

        try {

            List<QuestionResultResponse> results =
                    attemptService.getQuestionResults(
                            attemptId
                    );


            return ResponseEntity.ok(
                    results
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // GET ATTEMPT
    // GET /api/attempts/{id}
    // ========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAttempt(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    attemptService.getAttempt(
                            id
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            e.getMessage()
                    );
        }
    }


    // ========================================
    // GET STUDENT ATTEMPTS
    // GET /api/attempts/student/{studentId}
    // ========================================

    @GetMapping(
            "/student/{studentId}"
    )
    public ResponseEntity<List<ExamAttempt>>
    getStudentAttempts(
            @PathVariable Long studentId
    ) {

        return ResponseEntity.ok(
                attemptService.getStudentAttempts(
                        studentId
                )
        );
    }


    // ========================================
    // GET STUDENT RESULTS
    // GET /api/attempts/student/{studentId}/results
    // ========================================

    @GetMapping(
            "/student/{studentId}/results"
    )
    public ResponseEntity<List<ResultResponse>>
    getStudentResults(
            @PathVariable Long studentId
    ) {

        try {

            return ResponseEntity.ok(
                    attemptService.getStudentResults(
                            studentId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }


    // ========================================
    // GET EXAM ATTEMPTS
    // GET /api/attempts/exam/{examId}
    // ========================================

    @GetMapping(
            "/exam/{examId}"
    )
    public ResponseEntity<List<ExamAttempt>>
    getExamAttempts(
            @PathVariable Long examId
    ) {

        return ResponseEntity.ok(
                attemptService.getExamAttempts(
                        examId
                )
        );
    }


    // ========================================
    // START EXAM REQUEST
    // ========================================

    public record StartExamRequest(

            Long studentId,

            Long examId

    ) {
    }


    // ========================================
    // SUBMIT EXAM REQUEST
    // ========================================

    public record SubmitExamRequest(

            Map<Long, String> answers,

            Integer tabSwitches,

            Integer fullscreenExits,

            Integer copyAttempts,

            Integer integrityWarnings

    ) {
    }
}