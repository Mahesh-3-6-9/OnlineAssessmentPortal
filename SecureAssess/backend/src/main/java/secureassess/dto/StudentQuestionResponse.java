package secureassess.dto;

import secureassess.entity.Question;

public record StudentQuestionResponse(

        Long id,

        String questionText,

        String optionA,

        String optionB,

        String optionC,

        String optionD,

        Integer marks

) {

    public static StudentQuestionResponse from(
            Question question
    ) {

        return new StudentQuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getMarks()
        );
    }
}