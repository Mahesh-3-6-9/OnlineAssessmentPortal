package secureassess.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import secureassess.dto.TeacherQuestionResponse;
import secureassess.entity.Question;
import secureassess.service.QuestionService;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(
            QuestionService questionService
    ) {
        this.questionService = questionService;
    }


    // ========================================
    // ADD QUESTION
    // POST /api/questions
    // ========================================

    @PostMapping
    public ResponseEntity<?> addQuestion(
            @RequestBody AddQuestionRequest request
    ) {

        try {

            Question question =
                    questionService.addQuestion(
                            request.examId(),
                            request.teacherId(),
                            request.questionText(),
                            request.optionA(),
                            request.optionB(),
                            request.optionC(),
                            request.optionD(),
                            request.correctAnswer(),
                            request.marks()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            TeacherQuestionResponse.from(question)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // GET QUESTIONS FOR EXAM
    // GET /api/questions/exam/{examId}
    // ========================================

    @GetMapping("/exam/{examId}")
    public ResponseEntity<?> getQuestionsByExam(
            @PathVariable Long examId
    ) {

        try {

            List<TeacherQuestionResponse> questions =
                    questionService
                            .getQuestionsByExam(examId)
                            .stream()
                            .map(TeacherQuestionResponse::from)
                            .toList();

            return ResponseEntity.ok(questions);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ========================================
    // GET SINGLE QUESTION
    // GET /api/questions/{id}
    // ========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestion(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    TeacherQuestionResponse.from(
                            questionService.getQuestion(id)
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ========================================
    // EDIT / UPDATE QUESTION
    // PUT /api/questions/{id}
    // ========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long id,
            @RequestBody UpdateQuestionRequest request
    ) {

        try {

            Question question =
                    questionService.updateQuestion(
                            id,
                            request.teacherId(),
                            request.questionText(),
                            request.optionA(),
                            request.optionB(),
                            request.optionC(),
                            request.optionD(),
                            request.correctAnswer(),
                            request.marks()
                    );

            return ResponseEntity.ok(
                    TeacherQuestionResponse.from(question)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // DELETE QUESTION
    // DELETE /api/questions/{id}?teacherId=1
    // ========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(
            @PathVariable Long id,
            @RequestParam Long teacherId
    ) {

        try {

            questionService.deleteQuestion(
                    id,
                    teacherId
            );

            return ResponseEntity.ok(
                    "Question deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // ADD QUESTION REQUEST
    // ========================================

    public record AddQuestionRequest(

            Long examId,

            Long teacherId,

            String questionText,

            String optionA,

            String optionB,

            String optionC,

            String optionD,

            String correctAnswer,

            Integer marks

    ) {
    }


    // ========================================
    // UPDATE QUESTION REQUEST
    // ========================================

    public record UpdateQuestionRequest(

            Long teacherId,

            String questionText,

            String optionA,

            String optionB,

            String optionC,

            String optionD,

            String correctAnswer,

            Integer marks

    ) {
    }
}