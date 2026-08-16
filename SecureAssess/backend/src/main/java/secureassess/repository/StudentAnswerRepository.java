package secureassess.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import secureassess.entity.StudentAnswer;

import java.util.List;

public interface StudentAnswerRepository
        extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByAttemptId(Long attemptId);

}