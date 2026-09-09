package com.example.boxcha.accounting.repo;

import com.example.boxcha.accounting.entity.ChildPayment;
import com.example.boxcha.accounting.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ChildPaymentRepository extends JpaRepository<ChildPayment, Long> {

  List<ChildPayment> findAllByChildId(Long childId);

  List<ChildPayment> findAllByPaymentMonth(LocalDate paymentMonth);

  List<ChildPayment> findAllByStatus(PaymentStatus status);

  Optional<ChildPayment> findByChildIdAndPaymentMonth(
          Long childId,
          LocalDate paymentMonth
  );

  boolean existsByChildIdAndPaymentMonth(
          Long childId,
          LocalDate paymentMonth
  );

  /**
   * Berilgan oyda to'langan barcha pullar.
   */
  @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM ChildPayment c
            WHERE c.paymentMonth = :month
            AND c.status = :status
            """)
  BigDecimal getTotalIncome(
          LocalDate month,
          PaymentStatus status
  );

  /**
   * Berilgan oyda qarzdor bolalar.
   */
  List<ChildPayment> findAllByPaymentMonthAndStatus(
          LocalDate month,
          PaymentStatus status
  );
}