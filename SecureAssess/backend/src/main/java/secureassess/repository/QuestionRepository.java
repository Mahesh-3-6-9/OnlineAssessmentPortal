package secureassess.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import secureassess.entity.Question;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    List<Question> findByExamId(Long examId);

}