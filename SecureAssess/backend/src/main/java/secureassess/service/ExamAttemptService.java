package secureassess.service;

import org.springframework.stereotype.Service;

import secureassess.dto.QuestionResultResponse;
import secureassess.dto.ResultResponse;
import secureassess.entity.Exam;
import secureassess.entity.ExamAttempt;
import secureassess.entity.Question;
import secureassess.entity.StudentAnswer;
import secureassess.entity.User;
import secureassess.repository.ExamAttemptRepository;
import secureassess.repository.ExamRepository;
import secureassess.repository.QuestionRepository;
import secureassess.repository.StudentAnswerRepository;
import secureassess.repository.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserRepository userRepository;


    public ExamAttemptService(
            ExamAttemptRepository attemptRepository,
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            StudentAnswerRepository studentAnswerRepository,
            UserRepository userRepository
    ) {

        this.attemptRepository =
                attemptRepository;

        this.examRepository =
                examRepository;

        this.questionRepository =
                questionRepository;

        this.studentAnswerRepository =
                studentAnswerRepository;

        this.userRepository =
                userRepository;
    }


    // ========================================
    // START EXAM
    // ========================================

    public ExamAttempt startExam(
            Long studentId,
            Long examId
    ) {

        User student =
                userRepository.findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );


        if (
                student.getRole()
                        != User.Role.STUDENT
        ) {

            throw new RuntimeException(
                    "Only students can start exams"
            );
        }


        Exam exam =
                examRepository.findById(examId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Exam not found"
                                )
                        );


        if (
                exam.getStatus()
                        != Exam.Status.PUBLISHED
        ) {

            throw new RuntimeException(
                    "This exam is not available"
            );
        }


        // ========================================
        // CHECK EXISTING ATTEMPT
        // ========================================

        var existingAttempt =
                attemptRepository
                        .findByStudentIdAndExamId(
                                studentId,
                                examId
                        );


        if (existingAttempt.isPresent()) {

            ExamAttempt attempt =
                    existingAttempt.get();


            if (
                    attempt.getStatus()
                            == ExamAttempt.Status.IN_PROGRESS
            ) {

                return attempt;
            }


            throw new RuntimeException(
                    "You have already submitted this exam"
            );
        }


        // ========================================
        // CHECK EXAM SCHEDULE
        // ========================================

        LocalDateTime now =
                LocalDateTime.now();


        if (
                exam.getStartTime() != null
                        &&
                        exam.getEndTime() != null
        ) {

            if (
                    now.isBefore(
                            exam.getStartTime()
                    )
            ) {

                throw new RuntimeException(
                        "This exam has not started yet. Exam starts at "
                                + exam.getStartTime()
                );
            }


            if (
                    !now.isBefore(
                            exam.getEndTime()
                    )
            ) {

                throw new RuntimeException(
                        "The exam window has ended"
                );
            }
        }


        // ========================================
        // INVALID SCHEDULE
        // ========================================

        if (
                (exam.getStartTime() == null
                        && exam.getEndTime() != null)
                        ||
                        (exam.getStartTime() != null
                                && exam.getEndTime() == null)
        ) {

            throw new RuntimeException(
                    "Exam schedule is invalid"
            );
        }


        // ========================================
        // CREATE ATTEMPT
        // ========================================

        ExamAttempt attempt =
                new ExamAttempt(
                        student,
                        exam
                );


        attempt.setStartedAt(
                now
        );


        return attemptRepository.save(
                attempt
        );
    }


    // ========================================
    // SUBMIT EXAM
    // ========================================

    public ExamAttempt submitExam(
            Long attemptId,
            Map<Long, String> answers,
            Integer tabSwitches,
            Integer fullscreenExits,
            Integer copyAttempts,
            Integer integrityWarnings
    ) {

        ExamAttempt attempt =
                attemptRepository.findById(
                                attemptId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Exam attempt not found"
                                )
                        );


        if (
                attempt.getStatus()
                        == ExamAttempt.Status.SUBMITTED
        ) {

            throw new RuntimeException(
                    "This exam has already been submitted"
            );
        }


        Exam exam =
                attempt.getExam();


        // ========================================
        // CALCULATE DEADLINE
        // ========================================

        LocalDateTime durationDeadline =
                attempt.getStartedAt()
                        .plusMinutes(
                                exam.getDurationMinutes()
                        );


        LocalDateTime deadline =
                durationDeadline;


        if (
                exam.getEndTime() != null
                        &&
                        exam.getEndTime()
                                .isBefore(deadline)
        ) {

            deadline =
                    exam.getEndTime();
        }


        LocalDateTime now =
                LocalDateTime.now();


        boolean forcedSubmission =
                now.isAfter(deadline);


        LocalDateTime effectiveSubmittedAt =
                forcedSubmission
                        ? deadline
                        : now;


        // ========================================
        // EVALUATION
        // ========================================

        int score = 0;

        int correctAnswers = 0;

        int wrongAnswers = 0;


        if (answers != null) {

            for (
                    Map.Entry<Long, String> entry
                    : answers.entrySet()
            ) {

                Long questionId =
                        entry.getKey();


                String selectedAnswer =
                        entry.getValue();


                Question question =
                        questionRepository
                                .findById(
                                        questionId
                                )
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Question not found: "
                                                        + questionId
                                        )
                                );


                // ====================================
                // VERIFY QUESTION BELONGS TO EXAM
                // ====================================

                if (
                        question.getExam()
                                .getId()
                                .longValue()
                                != exam.getId()
                                .longValue()
                ) {

                    throw new RuntimeException(
                            "Question does not belong to this exam"
                    );
                }


                // ====================================
                // CREATE STUDENT ANSWER
                // ====================================

                StudentAnswer studentAnswer =
                        new StudentAnswer(
                                attempt,
                                question,
                                selectedAnswer
                        );


                // ====================================
                // CHECK ANSWER
                // ====================================

                boolean correct =
                        question.getCorrectAnswer()
                                != null
                                &&
                                selectedAnswer != null
                                &&
                                question.getCorrectAnswer()
                                        .equalsIgnoreCase(
                                                selectedAnswer
                                        );


                if (correct) {

                    studentAnswer.setCorrect(
                            true
                    );


                    studentAnswer.setMarksObtained(
                            question.getMarks()
                    );


                    score +=
                            question.getMarks();


                    correctAnswers++;

                } else {

                    studentAnswer.setCorrect(
                            false
                    );


                    studentAnswer.setMarksObtained(
                            0
                    );


                    wrongAnswers++;
                }


                studentAnswerRepository.save(
                        studentAnswer
                );
            }
        }


        // ========================================
        // UNANSWERED
        // ========================================

        int totalQuestions =
                exam.getTotalQuestions();


        int answeredQuestions =
                answers == null
                        ? 0
                        : answers.size();


        int unanswered =
                totalQuestions
                        - answeredQuestions;


        if (unanswered < 0) {

            unanswered = 0;
        }


        // ========================================
        // PERCENTAGE
        // ========================================

        double percentage =
                0.0;


        if (
                exam.getTotalMarks() != null
                        &&
                        exam.getTotalMarks() > 0
        ) {

            percentage =
                    (
                            (double) score
                                    /
                                    exam.getTotalMarks()
                    )
                            * 100;
        }


        // ========================================
        // UPDATE RESULT
        // ========================================

        attempt.setScore(
                score
        );


        attempt.setCorrectAnswers(
                correctAnswers
        );


        attempt.setWrongAnswers(
                wrongAnswers
        );


        attempt.setUnanswered(
                unanswered
        );


        attempt.setPercentage(
                percentage
        );


        // ========================================
        // UPDATE INTEGRITY
        // ========================================

        attempt.setTabSwitches(
                tabSwitches == null
                        ? 0
                        : Math.max(
                        0,
                        tabSwitches
                )
        );


        attempt.setFullscreenExits(
                fullscreenExits == null
                        ? 0
                        : Math.max(
                        0,
                        fullscreenExits
                )
        );


        attempt.setCopyAttempts(
                copyAttempts == null
                        ? 0
                        : Math.max(
                        0,
                        copyAttempts
                )
        );


        attempt.setIntegrityWarnings(
                integrityWarnings == null
                        ? 0
                        : Math.max(
                        0,
                        integrityWarnings
                )
        );


        // ========================================
        // SUBMIT
        // ========================================

        attempt.setStatus(
                ExamAttempt.Status.SUBMITTED
        );


        attempt.setSubmittedAt(
                effectiveSubmittedAt
        );


        return attemptRepository.save(
                attempt
        );
    }


    // ========================================
    // GET RESULT
    // ========================================

    public ResultResponse getResult(
            Long attemptId
    ) {

        ExamAttempt attempt =
                attemptRepository.findById(
                                attemptId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Exam attempt not found"
                                )
                        );


        Exam exam =
                attempt.getExam();


        User student =
                attempt.getStudent();


        long timeTakenSeconds =
                calculateTimeTaken(
                        attempt
                );


        return new ResultResponse(

                attempt.getId(),

                exam.getId(),

                exam.getTitle(),

                student.getId(),

                student.getName(),

                exam.getTotalQuestions(),

                attempt.getCorrectAnswers(),

                attempt.getWrongAnswers(),

                attempt.getUnanswered(),

                exam.getTotalMarks(),

                attempt.getScore(),

                attempt.getPercentage(),

                attempt.getStatus()
                        .name(),

                attempt.getStartedAt()
                        .toString(),

                attempt.getSubmittedAt() == null
                        ? null
                        : attempt.getSubmittedAt()
                        .toString(),

                timeTakenSeconds,

                attempt.getTabSwitches(),

                attempt.getFullscreenExits(),

                attempt.getCopyAttempts(),

                attempt.getIntegrityWarnings()
        );
    }


    // ========================================
    // GET STUDENT RESULTS
    // GET /api/attempts/student/{studentId}/results
    // ========================================

    public List<ResultResponse> getStudentResults(
            Long studentId
    ) {

        // ========================================
        // VERIFY STUDENT
        // ========================================

        User student =
                userRepository.findById(
                                studentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"
                                )
                        );


        if (
                student.getRole()
                        != User.Role.STUDENT
        ) {

            throw new RuntimeException(
                    "Only students can view student results"
            );
        }


        // ========================================
        // GET ATTEMPTS
        // ========================================

        List<ExamAttempt> attempts =
                attemptRepository.findByStudentId(
                        studentId
                );


        // ========================================
        // CONVERT TO DTO
        // ========================================

        return attempts.stream()

                .filter(attempt ->
                        attempt.getStatus()
                                == ExamAttempt.Status.SUBMITTED
                )

                .map(attempt -> {

                    Exam exam =
                            attempt.getExam();


                    User attemptStudent =
                            attempt.getStudent();


                    return new ResultResponse(

                            attempt.getId(),

                            exam.getId(),

                            exam.getTitle(),

                            attemptStudent.getId(),

                            attemptStudent.getName(),

                            exam.getTotalQuestions(),

                            attempt.getCorrectAnswers(),

                            attempt.getWrongAnswers(),

                            attempt.getUnanswered(),

                            exam.getTotalMarks(),

                            attempt.getScore(),

                            attempt.getPercentage(),

                            attempt.getStatus()
                                    .name(),

                            attempt.getStartedAt() == null
                                    ? null
                                    : attempt.getStartedAt()
                                    .toString(),

                            attempt.getSubmittedAt() == null
                                    ? null
                                    : attempt.getSubmittedAt()
                                    .toString(),

                            calculateTimeTaken(
                                    attempt
                            ),

                            attempt.getTabSwitches(),

                            attempt.getFullscreenExits(),

                            attempt.getCopyAttempts(),

                            attempt.getIntegrityWarnings()
                    );

                })

                .toList();
    }


    // ========================================
    // GET QUESTION RESULTS
    // ========================================

    public List<QuestionResultResponse>
    getQuestionResults(
            Long attemptId
    ) {

        ExamAttempt attempt =
                attemptRepository.findById(
                                attemptId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Exam attempt not found"
                                )
                        );


        List<Question> questions =
                questionRepository.findByExamId(
                        attempt.getExam().getId()
                );


        List<StudentAnswer> studentAnswers =
                studentAnswerRepository
                        .findByAttemptId(
                                attemptId
                        );


        return questions.stream()
                .map(question -> {

                    StudentAnswer studentAnswer =
                            studentAnswers.stream()
                                    .filter(answer ->
                                            answer.getQuestion()
                                                    .getId()
                                                    .equals(
                                                            question.getId()
                                                    )
                                    )
                                    .findFirst()
                                    .orElse(null);


                    String yourAnswer =
                            studentAnswer == null
                                    ? null
                                    : studentAnswer
                                    .getSelectedAnswer();


                    String status;

                    Integer marksObtained =
                            0;


                    if (
                            studentAnswer == null
                    ) {

                        status =
                                "UNANSWERED";

                    } else if (
                            Boolean.TRUE.equals(
                                    studentAnswer.getCorrect()
                            )
                    ) {

                        status =
                                "CORRECT";


                        marksObtained =
                                studentAnswer
                                        .getMarksObtained();

                    } else {

                        status =
                                "INCORRECT";
                    }


                    return new QuestionResultResponse(

                            questions.indexOf(
                                    question
                            ) + 1,

                            question.getId(),

                            question.getQuestionText(),

                            question.getOptionA(),

                            question.getOptionB(),

                            question.getOptionC(),

                            question.getOptionD(),

                            yourAnswer,

                            question.getCorrectAnswer(),

                            question.getMarks(),

                            marksObtained,

                            status
                    );

                })
                .toList();
    }


    // ========================================
    // GET ATTEMPT
    // ========================================

    public ExamAttempt getAttempt(
            Long attemptId
    ) {

        return attemptRepository
                .findById(
                        attemptId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Exam attempt not found"
                        )
                );
    }


    // ========================================
    // GET STUDENT ATTEMPTS
    // ========================================

    public List<ExamAttempt>
    getStudentAttempts(
            Long studentId
    ) {

        return attemptRepository
                .findByStudentId(
                        studentId
                );
    }


    // ========================================
    // GET EXAM ATTEMPTS
    // ========================================

    public List<ExamAttempt>
    getExamAttempts(
            Long examId
    ) {

        return attemptRepository
                .findByExamId(
                        examId
                );
    }


    // ========================================
    // CALCULATE TIME TAKEN
    // ========================================

    private long calculateTimeTaken(
            ExamAttempt attempt
    ) {

        if (
                attempt.getStartedAt() == null
        ) {

            return 0;
        }


        LocalDateTime endTime =
                attempt.getSubmittedAt();


        if (endTime == null) {

            endTime =
                    LocalDateTime.now();
        }


        long seconds =
                Duration.between(
                        attempt.getStartedAt(),
                        endTime
                ).getSeconds();


        return Math.max(
                0,
                seconds
        );
    }
}