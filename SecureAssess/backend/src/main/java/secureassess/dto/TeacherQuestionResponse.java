package secureassess.dto;

import secureassess.entity.Question;

public record TeacherQuestionResponse(

        Long id,

        String questionText,

        String optionA,

        String optionB,

        String optionC,

        String optionD,

        String correctAnswer,

        Integer marks,

        Long examId

) {

    public static TeacherQuestionResponse from(
            Question question
    ) {

        return new TeacherQuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getCorrectAnswer(),
                question.getMarks(),
                question.getExam().getId()
        );
    }
}