package secureassess.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import secureassess.dto.StudentQuestionResponse;
import secureassess.service.QuestionService;

import java.util.List;

@RestController
@RequestMapping("/api/student/exams")
@CrossOrigin(origins = "*")
public class StudentExamController {

    private final QuestionService questionService;

    public StudentExamController(
            QuestionService questionService
    ) {
        this.questionService = questionService;
    }

    // ========================================
    // GET STUDENT QUESTIONS
    // GET /api/student/exams/{examId}/questions
    // ========================================

    @GetMapping("/{examId}/questions")
    public ResponseEntity<?> getStudentQuestions(
            @PathVariable Long examId
    ) {

        try {

            List<StudentQuestionResponse> questions =
                    questionService
                            .getQuestionsByExam(examId)
                            .stream()
                            .map(StudentQuestionResponse::from)
                            .toList();

            return ResponseEntity.ok(questions);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}