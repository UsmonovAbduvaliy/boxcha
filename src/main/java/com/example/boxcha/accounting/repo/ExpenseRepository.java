package com.example.boxcha.accounting.repo;

import com.example.boxcha.accounting.entity.Expense;
import com.example.boxcha.accounting.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

  List<Expense> findAllByCategory(
          ExpenseCategory category
  );

  List<Expense> findAllByExpenseDate(
          LocalDate expenseDate
  );

  List<Expense> findAllByExpenseDateBetween(
          LocalDate startDate,
          LocalDate endDate
  );

  /**
   * Berilgan vaqt oralig'idagi barcha xarajatlar.
   */
  @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM Expense e
            WHERE e.expenseDate BETWEEN :startDate AND :endDate
            """)
  BigDecimal getTotalExpenses(
          LocalDate startDate,
          LocalDate endDate
  );
}