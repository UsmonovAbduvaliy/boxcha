package com.example.boxcha.accounting.repo;

import com.example.boxcha.accounting.entity.SalaryStatus;
import com.example.boxcha.accounting.entity.TeacherSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TeacherSalaryRepository
        extends JpaRepository<TeacherSalary, Long> {

  List<TeacherSalary> findAllByTeacherId(Long teacherId);

  List<TeacherSalary> findAllBySalaryMonth(LocalDate salaryMonth);

  List<TeacherSalary> findAllByStatus(SalaryStatus status);

  Optional<TeacherSalary> findByTeacherIdAndSalaryMonth(
          Long teacherId,
          LocalDate salaryMonth
  );

  boolean existsByTeacherIdAndSalaryMonth(
          Long teacherId,
          LocalDate salaryMonth
  );

  /**
   * Berilgan oyda berilgan barcha oyliklar.
   */
  @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM TeacherSalary t
            WHERE t.salaryMonth = :month
            AND t.status = :status
            """)
  BigDecimal getTotalSalary(
          LocalDate month,
          SalaryStatus status
  );

  /**
   * Berilgan oyda oyligi berilmagan ustozlar.
   */
  List<TeacherSalary> findAllBySalaryMonthAndStatus(
          LocalDate month,
          SalaryStatus status
  );
}