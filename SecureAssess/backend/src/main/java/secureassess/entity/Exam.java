package secureassess.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ========================================
    // BASIC INFORMATION
    // ========================================

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;


    // ========================================
    // EXAM CONFIGURATION
    // ========================================

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Integer totalQuestions;


    // ========================================
    // EXAM SCHEDULE
    // ========================================

    /*
     * startTime = when students are allowed to start
     * endTime   = hard deadline for the examination
     *
     * Nullable for existing exams already present
     * in the database.
     */

    private LocalDateTime startTime;

    private LocalDateTime endTime;


    // ========================================
    // STATUS
    // ========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;


    // ========================================
    // TEACHER
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;


    // ========================================
    // CREATED TIME
    // ========================================

    @Column(nullable = false)
    private LocalDateTime createdAt;


    // ========================================
    // STATUS ENUM
    // ========================================

    public enum Status {

        DRAFT,

        PUBLISHED,

        CLOSED
    }


    // ========================================
    // DEFAULT CONSTRUCTOR
    // ========================================

    public Exam() {
    }


    // ========================================
    // CONSTRUCTOR
    // ========================================

    public Exam(
            String title,
            String description,
            Integer durationMinutes,
            Integer totalMarks,
            Integer totalQuestions,
            User createdBy,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {

        this.title = title;

        this.description = description;

        this.durationMinutes =
                durationMinutes;

        this.totalMarks =
                totalMarks;

        this.totalQuestions =
                totalQuestions;

        this.createdBy =
                createdBy;

        this.startTime =
                startTime;

        this.endTime =
                endTime;

        this.status =
                Status.DRAFT;

        this.createdAt =
                LocalDateTime.now();
    }


    // ========================================
    // GET ID
    // ========================================

    public Long getId() {

        return id;
    }


    public void setId(Long id) {

        this.id = id;
    }


    // ========================================
    // GET TITLE
    // ========================================

    public String getTitle() {

        return title;
    }


    public void setTitle(String title) {

        this.title = title;
    }


    // ========================================
    // GET DESCRIPTION
    // ========================================

    public String getDescription() {

        return description;
    }


    public void setDescription(String description) {

        this.description = description;
    }


    // ========================================
    // GET DURATION
    // ========================================

    public Integer getDurationMinutes() {

        return durationMinutes;
    }


    public void setDurationMinutes(
            Integer durationMinutes
    ) {

        this.durationMinutes =
                durationMinutes;
    }


    // ========================================
    // GET TOTAL MARKS
    // ========================================

    public Integer getTotalMarks() {

        return totalMarks;
    }


    public void setTotalMarks(
            Integer totalMarks
    ) {

        this.totalMarks =
                totalMarks;
    }


    // ========================================
    // GET TOTAL QUESTIONS
    // ========================================

    public Integer getTotalQuestions() {

        return totalQuestions;
    }


    public void setTotalQuestions(
            Integer totalQuestions
    ) {

        this.totalQuestions =
                totalQuestions;
    }


    // ========================================
    // GET START TIME
    // ========================================

    public LocalDateTime getStartTime() {

        return startTime;
    }


    public void setStartTime(
            LocalDateTime startTime
    ) {

        this.startTime =
                startTime;
    }


    // ========================================
    // GET END TIME
    // ========================================

    public LocalDateTime getEndTime() {

        return endTime;
    }


    public void setEndTime(
            LocalDateTime endTime
    ) {

        this.endTime =
                endTime;
    }


    // ========================================
    // GET STATUS
    // ========================================

    public Status getStatus() {

        return status;
    }


    public void setStatus(Status status) {

        this.status =
                status;
    }


    // ========================================
    // GET CREATED BY
    // ========================================

    public User getCreatedBy() {

        return createdBy;
    }


    public void setCreatedBy(User createdBy) {

        this.createdBy =
                createdBy;
    }


    // ========================================
    // GET CREATED AT
    // ========================================

    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt =
                createdAt;
    }
}