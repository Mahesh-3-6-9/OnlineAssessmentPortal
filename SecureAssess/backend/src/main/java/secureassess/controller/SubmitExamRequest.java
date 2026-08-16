package secureassess.controller;

import java.util.Map;

public record SubmitExamRequest(

        Map<Long, String> answers

) {
}