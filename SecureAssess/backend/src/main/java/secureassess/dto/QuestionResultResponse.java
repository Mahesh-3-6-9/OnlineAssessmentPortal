package secureassess.dto;

public record QuestionResultResponse(

        Integer questionNumber,

        Long questionId,

        String questionText,

        String optionA,

        String optionB,

        String optionC,

        String optionD,

        String yourAnswer,

        String correctAnswer,

        Integer marks,

        Integer marksObtained,

        String status

) {
}