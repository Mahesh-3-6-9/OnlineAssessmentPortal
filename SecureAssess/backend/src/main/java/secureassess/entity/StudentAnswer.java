package secureassess.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student_answers")
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // EXAM ATTEMPT
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    // ========================================
    // QUESTION
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // ========================================
    // STUDENT'S ANSWER
    // ========================================

    @Column(length = 1)
    private String selectedAnswer;

    // ========================================
    // EVALUATION
    // ========================================

    @Column(nullable = false)
    private Boolean correct = false;

    @Column(nullable = false)
    private Integer marksObtained = 0;

    // ========================================
    // CONSTRUCTORS
    // ========================================

    public StudentAnswer() {
    }

    public StudentAnswer(
            ExamAttempt attempt,
            Question question,
            String selectedAnswer
    ) {
        this.attempt = attempt;
        this.question = question;
        this.selectedAnswer = selectedAnswer;
        this.correct = false;
        this.marksObtained = 0;
    }

    // ========================================
    // GETTERS & SETTERS
    // ========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExamAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(ExamAttempt attempt) {
        this.attempt = attempt;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public Integer getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }
}