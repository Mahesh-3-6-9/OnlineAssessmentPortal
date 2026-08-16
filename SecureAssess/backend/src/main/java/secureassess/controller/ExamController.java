package secureassess.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import secureassess.entity.Exam;
import secureassess.service.ExamService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamService examService;


    public ExamController(
            ExamService examService
    ) {

        this.examService =
                examService;
    }


    // ========================================
    // CREATE EXAM
    // POST /api/exams
    // ========================================

    @PostMapping
    public ResponseEntity<?> createExam(
            @RequestBody CreateExamRequest request
    ) {

        try {

            Exam exam =
                    examService.createExam(

                            request.title(),

                            request.description(),

                            request.durationMinutes(),

                            request.totalMarks(),

                            request.totalQuestions(),

                            request.teacherId(),

                            request.startTime(),

                            request.endTime()
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(exam);


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // GET EXAM
    // GET /api/exams/{id}
    // ========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getExam(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    examService.getExam(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // ========================================
    // GET ALL EXAMS
    // GET /api/exams
    // ========================================

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {

        return ResponseEntity.ok(
                examService.getAllExams()
        );
    }


    // ========================================
    // GET PUBLISHED EXAMS
    // GET /api/exams/published
    // ========================================

    @GetMapping("/published")
    public ResponseEntity<List<Exam>> getPublishedExams() {

        return ResponseEntity.ok(
                examService.getPublishedExams()
        );
    }


    // ========================================
    // GET TEACHER EXAMS
    // GET /api/exams/teacher/{teacherId}
    // ========================================

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Exam>> getTeacherExams(
            @PathVariable Long teacherId
    ) {

        return ResponseEntity.ok(
                examService.getTeacherExams(
                        teacherId
                )
        );
    }


    // ========================================
    // PUBLISH EXAM
    // PUT /api/exams/{id}/publish
    // ========================================

    @PutMapping("/{id}/publish")
    public ResponseEntity<?> publishExam(
            @PathVariable Long id,
            @RequestParam Long teacherId
    ) {

        try {

            return ResponseEntity.ok(
                    examService.publishExam(
                            id,
                            teacherId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // CLOSE EXAM
    // PUT /api/exams/{id}/close
    // ========================================

    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeExam(
            @PathVariable Long id,
            @RequestParam Long teacherId
    ) {

        try {

            return ResponseEntity.ok(
                    examService.closeExam(
                            id,
                            teacherId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ========================================
    // CREATE EXAM REQUEST
    // ========================================

    public record CreateExamRequest(

            String title,

            String description,

            Integer durationMinutes,

            Integer totalMarks,

            Integer totalQuestions,

            Long teacherId,

            LocalDateTime startTime,

            LocalDateTime endTime

    ) {
    }
}