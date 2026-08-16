package secureassess.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import secureassess.entity.Exam;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByStatus(Exam.Status status);

    List<Exam> findByCreatedById(Long teacherId);
}