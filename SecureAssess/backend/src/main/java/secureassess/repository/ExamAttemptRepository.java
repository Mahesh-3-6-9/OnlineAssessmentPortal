package secureassess.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import secureassess.entity.ExamAttempt;

import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository
        extends JpaRepository<ExamAttempt, Long> {

    List<ExamAttempt> findByStudentId(Long studentId);

    List<ExamAttempt> findByExamId(Long examId);

    Optional<ExamAttempt> findByStudentIdAndExamId(
            Long studentId,
            Long examId
    );
}