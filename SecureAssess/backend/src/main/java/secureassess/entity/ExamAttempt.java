package secureassess.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempts")
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ========================================
    // STUDENT
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;


    // ========================================
    // EXAM
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;


    // ========================================
    // ATTEMPT STATUS
    // ========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;


    // ========================================
    // TIME
    // ========================================

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;


    // ========================================
    // RESULT
    // ========================================

    @Column(nullable = false)
    private Integer score = 0;

    @Column(nullable = false)
    private Integer correctAnswers = 0;

    @Column(nullable = false)
    private Integer wrongAnswers = 0;

    @Column(nullable = false)
    private Integer unanswered = 0;

    @Column(nullable = false)
    private Double percentage = 0.0;


    // ========================================
    // EXAM INTEGRITY
    // ========================================

    @Column(nullable = false)
    private Integer tabSwitches = 0;

    @Column(nullable = false)
    private Integer fullscreenExits = 0;

    @Column(nullable = false)
    private Integer copyAttempts = 0;

    @Column(nullable = false)
    private Integer integrityWarnings = 0;


    // ========================================
    // ENUM
    // ========================================

    public enum Status {
        IN_PROGRESS,
        SUBMITTED
    }


    // ========================================
    // CONSTRUCTORS
    // ========================================

    public ExamAttempt() {
    }


    public ExamAttempt(
            User student,
            Exam exam
    ) {

        this.student = student;
        this.exam = exam;

        this.status = Status.IN_PROGRESS;

        this.startedAt = LocalDateTime.now();

        // Result defaults
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.unanswered = 0;
        this.percentage = 0.0;

        // Integrity defaults
        this.tabSwitches = 0;
        this.fullscreenExits = 0;
        this.copyAttempts = 0;
        this.integrityWarnings = 0;
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


    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }


    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }


    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }


    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }


    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }


    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }


    public Integer getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(Integer wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }


    public Integer getUnanswered() {
        return unanswered;
    }

    public void setUnanswered(Integer unanswered) {
        this.unanswered = unanswered;
    }


    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }


    // ========================================
    // INTEGRITY GETTERS & SETTERS
    // ========================================

    public Integer getTabSwitches() {
        return tabSwitches;
    }

    public void setTabSwitches(Integer tabSwitches) {
        this.tabSwitches = tabSwitches;
    }


    public Integer getFullscreenExits() {
        return fullscreenExits;
    }

    public void setFullscreenExits(Integer fullscreenExits) {
        this.fullscreenExits = fullscreenExits;
    }


    public Integer getCopyAttempts() {
        return copyAttempts;
    }

    public void setCopyAttempts(Integer copyAttempts) {
        this.copyAttempts = copyAttempts;
    }


    public Integer getIntegrityWarnings() {
        return integrityWarnings;
    }

    public void setIntegrityWarnings(Integer integrityWarnings) {
        this.integrityWarnings = integrityWarnings;
    }
}