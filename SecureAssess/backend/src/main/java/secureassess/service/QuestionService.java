package secureassess.service;

import org.springframework.stereotype.Service;
import secureassess.entity.Exam;
import secureassess.entity.Question;
import secureassess.entity.User;
import secureassess.repository.ExamRepository;
import secureassess.repository.QuestionRepository;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            ExamRepository examRepository
    ) {
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
    }


    // ========================================
    // ADD QUESTION
    // ========================================

    public Question addQuestion(
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

        Exam exam =
                examRepository.findById(examId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Exam not found"
                                )
                        );


        // Verify teacher ownership
        verifyTeacherOwnership(
                exam,
                teacherId
        );


        // Questions can only be added to DRAFT exams
        if (exam.getStatus() != Exam.Status.DRAFT) {

            throw new RuntimeException(
                    "Questions can only be added while the exam is in DRAFT status"
            );

        }


        validateQuestionData(
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer,
                marks
        );


        Question question =
                new Question(
                        questionText.trim(),
                        optionA.trim(),
                        optionB.trim(),
                        optionC.trim(),
                        optionD.trim(),
                        correctAnswer.trim().toUpperCase(),
                        marks,
                        exam
                );


        return questionRepository.save(
                question
        );
    }


    // ========================================
    // UPDATE / EDIT QUESTION
    // ========================================

    public Question updateQuestion(
            Long questionId,
            Long teacherId,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctAnswer,
            Integer marks
    ) {

        // ====================================
        // FIND QUESTION
        // ====================================

        Question question =
                getQuestion(questionId);


        // ====================================
        // GET EXAM
        // ====================================

        Exam exam =
                question.getExam();


        if (exam == null) {

            throw new RuntimeException(
                    "Question is not associated with an exam"
            );

        }


        // ====================================
        // VERIFY TEACHER OWNERSHIP
        // ====================================

        verifyTeacherOwnership(
                exam,
                teacherId
        );


        // ====================================
        // ONLY DRAFT EXAMS CAN BE EDITED
        // ====================================

        if (
                exam.getStatus()
                        != Exam.Status.DRAFT
        ) {

            throw new RuntimeException(
                    "Questions can only be edited while the exam is in DRAFT status"
            );

        }


        // ====================================
        // VALIDATE DATA
        // ====================================

        validateQuestionData(
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer,
                marks
        );


        // ====================================
        // UPDATE QUESTION
        // ====================================

        question.setQuestionText(
                questionText.trim()
        );


        question.setOptionA(
                optionA.trim()
        );


        question.setOptionB(
                optionB.trim()
        );


        question.setOptionC(
                optionC.trim()
        );


        question.setOptionD(
                optionD.trim()
        );


        question.setCorrectAnswer(
                correctAnswer.trim().toUpperCase()
        );


        question.setMarks(
                marks
        );


        // ====================================
        // SAVE
        // ====================================

        return questionRepository.save(
                question
        );
    }


    // ========================================
    // VALIDATE QUESTION DATA
    // ========================================

    private void validateQuestionData(
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctAnswer,
            Integer marks
    ) {

        // ====================================
        // QUESTION TEXT
        // ====================================

        if (
                questionText == null ||
                        questionText.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Question text is required"
            );

        }


        // ====================================
        // OPTIONS
        // ====================================

        if (
                optionA == null ||
                        optionA.trim().isEmpty() ||

                        optionB == null ||
                        optionB.trim().isEmpty() ||

                        optionC == null ||
                        optionC.trim().isEmpty() ||

                        optionD == null ||
                        optionD.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "All four options are required"
            );

        }


        // ====================================
        // CORRECT ANSWER
        // ====================================

        if (
                correctAnswer == null ||
                        !(
                                correctAnswer.trim()
                                        .equalsIgnoreCase("A") ||

                                        correctAnswer.trim()
                                                .equalsIgnoreCase("B") ||

                                        correctAnswer.trim()
                                                .equalsIgnoreCase("C") ||

                                        correctAnswer.trim()
                                                .equalsIgnoreCase("D")
                        )
        ) {

            throw new RuntimeException(
                    "Correct answer must be A, B, C, or D"
            );

        }


        // ====================================
        // MARKS
        // ====================================

        if (
                marks == null ||
                        marks <= 0
        ) {

            throw new RuntimeException(
                    "Marks must be greater than 0"
            );

        }

    }


    // ========================================
    // GET QUESTIONS FOR EXAM
    // ========================================

    public List<Question> getQuestionsByExam(
            Long examId
    ) {

        if (
                !examRepository.existsById(
                        examId
                )
        ) {

            throw new RuntimeException(
                    "Exam not found"
            );

        }


        return questionRepository.findByExamId(
                examId
        );
    }


    // ========================================
    // GET QUESTION BY ID
    // ========================================

    public Question getQuestion(
            Long questionId
    ) {

        return questionRepository.findById(
                        questionId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Question not found"
                        )
                );
    }


    // ========================================
    // DELETE QUESTION
    // ========================================

    public void deleteQuestion(
            Long questionId,
            Long teacherId
    ) {

        Question question =
                getQuestion(questionId);


        // Verify ownership
        verifyTeacherOwnership(
                question.getExam(),
                teacherId
        );


        // Only DRAFT exams can be modified
        if (
                question.getExam().getStatus()
                        != Exam.Status.DRAFT
        ) {

            throw new RuntimeException(
                    "Questions can only be deleted from a DRAFT exam"
            );

        }


        questionRepository.delete(
                question
        );
    }


    // ========================================
    // VERIFY TEACHER OWNERSHIP
    // ========================================

    private void verifyTeacherOwnership(
            Exam exam,
            Long teacherId
    ) {

        if (exam == null) {

            throw new RuntimeException(
                    "Exam not found"
            );

        }


        if (exam.getCreatedBy() == null) {

            throw new RuntimeException(
                    "Exam has no owner"
            );

        }


        if (teacherId == null) {

            throw new RuntimeException(
                    "Teacher ID is required"
            );

        }


        if (
                !exam.getCreatedBy()
                        .getId()
                        .equals(teacherId)
        ) {

            throw new RuntimeException(
                    "You are not authorized to modify this exam"
            );

        }


        if (
                exam.getCreatedBy().getRole()
                        != User.Role.TEACHER
        ) {

            throw new RuntimeException(
                    "Only teachers can modify exam questions"
            );

        }

    }

}