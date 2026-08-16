package secureassess.dto;

public record ResultResponse(

        Long attemptId,

        Long examId,

        String examTitle,

        Long studentId,

        String studentName,

        Integer totalQuestions,

        Integer correctAnswers,

        Integer wrongAnswers,

        Integer unanswered,

        Integer totalMarks,

        Integer obtainedMarks,

        Double percentage,

        String status,

        String startedAt,

        String submittedAt,

        Long timeTakenSeconds,

        // ========================================
        // EXAM INTEGRITY
        // ========================================

        Integer tabSwitches,

        Integer fullscreenExits,

        Integer copyAttempts,

        Integer integrityWarnings

) {
}