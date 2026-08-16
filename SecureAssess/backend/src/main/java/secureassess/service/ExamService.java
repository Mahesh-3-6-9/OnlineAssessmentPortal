package secureassess.service;

import org.springframework.stereotype.Service;
import secureassess.entity.Exam;
import secureassess.entity.User;
import secureassess.repository.ExamRepository;
import secureassess.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    private final UserRepository userRepository;


    public ExamService(
            ExamRepository examRepository,
            UserRepository userRepository
    ) {

        this.examRepository =
                examRepository;

        this.userRepository =
                userRepository;
    }


    // ========================================
    // CREATE EXAM
    // ========================================

    public Exam createExam(
            String title,
            String description,
            Integer durationMinutes,
            Integer totalMarks,
            Integer totalQuestions,
            Long teacherId,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {


        // ====================================
        // FIND TEACHER
        // ====================================

        User teacher =
                userRepository.findById(
                                teacherId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher not found"
                                )
                        );


        // ====================================
        // VERIFY TEACHER
        // ====================================

        if (
                teacher.getRole()
                        != User.Role.TEACHER
        ) {

            throw new RuntimeException(
                    "Only teachers can create exams"
            );
        }


        // ====================================
        // TITLE
        // ====================================

        if (
                title == null ||
                        title.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Exam title is required"
            );
        }


        // ====================================
        // DURATION
        // ====================================

        if (
                durationMinutes == null ||
                        durationMinutes <= 0
        ) {

            throw new RuntimeException(
                    "Duration must be greater than 0"
            );
        }


        // ====================================
        // MARKS
        // ====================================

        if (
                totalMarks == null ||
                        totalMarks <= 0
        ) {

            throw new RuntimeException(
                    "Total marks must be greater than 0"
            );
        }


        // ====================================
        // QUESTIONS
        // ====================================

        if (
                totalQuestions == null ||
                        totalQuestions <= 0
        ) {

            throw new RuntimeException(
                    "Total questions must be greater than 0"
            );
        }


        // ====================================
        // START TIME
        // ====================================

        if (startTime == null) {

            throw new RuntimeException(
                    "Exam start time is required"
            );
        }


        // ====================================
        // END TIME
        // ====================================

        if (endTime == null) {

            throw new RuntimeException(
                    "Exam end time is required"
            );
        }


        // ====================================
        // VALIDATE TIME ORDER
        // ====================================

        if (
                !endTime.isAfter(startTime)
        ) {

            throw new RuntimeException(
                    "Exam end time must be after start time"
            );
        }


        // ====================================
        // VALIDATE DURATION
        // ====================================

        long availableMinutes =
                java.time.Duration
                        .between(
                                startTime,
                                endTime
                        )
                        .toMinutes();


        if (
                availableMinutes <
                        durationMinutes
        ) {

            throw new RuntimeException(
                    "Exam window must be at least as long as the exam duration"
            );
        }


        // ====================================
        // CREATE EXAM
        // ====================================

        Exam exam =
                new Exam(

                        title.trim(),

                        description,

                        durationMinutes,

                        totalMarks,

                        totalQuestions,

                        teacher,

                        startTime,

                        endTime
                );


        return examRepository.save(
                exam
        );
    }


    // ========================================
    // GET EXAM
    // ========================================

    public Exam getExam(
            Long examId
    ) {

        return examRepository.findById(
                        examId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Exam not found"
                        )
                );
    }


    // ========================================
    // GET ALL EXAMS
    // ========================================

    public List<Exam> getAllExams() {

        return examRepository.findAll();
    }


    // ========================================
    // GET PUBLISHED EXAMS
    // ========================================

    public List<Exam> getPublishedExams() {

        return examRepository.findByStatus(
                Exam.Status.PUBLISHED
        );
    }


    // ========================================
    // GET TEACHER EXAMS
    // ========================================

    public List<Exam> getTeacherExams(
            Long teacherId
    ) {

        return examRepository.findByCreatedById(
                teacherId
        );
    }


    // ========================================
    // PUBLISH EXAM
    // ========================================

    public Exam publishExam(
            Long examId,
            Long teacherId
    ) {

        Exam exam =
                getExam(examId);


        verifyTeacherOwnership(
                exam,
                teacherId
        );


        // ====================================
        // REQUIRE SCHEDULE
        // ====================================

        if (
                exam.getStartTime() == null ||
                        exam.getEndTime() == null
        ) {

            throw new RuntimeException(
                    "Exam start and end time must be configured before publishing"
            );
        }


        // ====================================
        // VALIDATE SCHEDULE
        // ====================================

        if (
                !exam.getEndTime()
                        .isAfter(
                                exam.getStartTime()
                        )
        ) {

            throw new RuntimeException(
                    "Exam end time must be after start time"
            );
        }


        // ====================================
        // PUBLISH
        // ====================================

        exam.setStatus(
                Exam.Status.PUBLISHED
        );


        return examRepository.save(
                exam
        );
    }


    // ========================================
    // CLOSE EXAM
    // ========================================

    public Exam closeExam(
            Long examId,
            Long teacherId
    ) {

        Exam exam =
                getExam(examId);


        verifyTeacherOwnership(
                exam,
                teacherId
        );


        exam.setStatus(
                Exam.Status.CLOSED
        );


        return examRepository.save(
                exam
        );
    }


    // ========================================
    // VERIFY TEACHER OWNERSHIP
    // ========================================

    private void verifyTeacherOwnership(
            Exam exam,
            Long teacherId
    ) {

        if (
                exam.getCreatedBy() == null ||
                        !exam.getCreatedBy()
                                .getId()
                                .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to modify this exam"
            );
        }


        if (
                exam.getCreatedBy()
                        .getRole()
                        != User.Role.TEACHER
        ) {

            throw new RuntimeException(
                    "Only teachers can modify exams"
            );
        }
    }


    // ========================================
    // CHECK WHETHER EXAM IS OPEN
    // ========================================

    public boolean isExamOpen(
            Exam exam
    ) {

        LocalDateTime now =
                LocalDateTime.now();


        // ====================================
        // STATUS
        // ====================================

        if (
                exam.getStatus()
                        != Exam.Status.PUBLISHED
        ) {

            return false;
        }


        // ====================================
        // OLD EXAMS
        // ====================================

        /*
         * Existing exams created before the
         * scheduling feature may not have
         * start/end times.
         *
         * They are considered open according
         * to their published status.
         */

        if (
                exam.getStartTime() == null ||
                        exam.getEndTime() == null
        ) {

            return true;
        }


        // ====================================
        // TIME WINDOW
        // ====================================

        return !now.isBefore(
                exam.getStartTime()
        )
                &&
                now.isBefore(
                        exam.getEndTime()
                );
    }


    // ========================================
    // GET REMAINING WINDOW SECONDS
    // ========================================

    public long getRemainingWindowSeconds(
            Exam exam
    ) {

        if (
                exam.getEndTime() == null
        ) {

            return Long.MAX_VALUE;
        }


        long seconds =
                java.time.Duration
                        .between(
                                LocalDateTime.now(),
                                exam.getEndTime()
                        )
                        .getSeconds();


        return Math.max(
                seconds,
                0
        );
    }
}