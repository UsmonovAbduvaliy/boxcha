package com.example.boxcha.accounting.entity;

import com.example.boxcha.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "accounting_teacher_salaries")
public class TeacherSalary extends BaseEntity {

    /**
     * Boxcha dagi User entity ID'si.
     */
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    /**
     * Qaysi oy uchun oylik.
     * Masalan: 2026-09-01 -> 2026-yil sentabr.
     */
    @Column(name = "salary_month", nullable = false)
    private LocalDate salaryMonth;

    /**
     * Oylik miqdori.
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Oylik berilgan sana.
     */
    @Column(name = "paid_date")
    private LocalDate paidDate;

    /**
     * Oylik holati.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryStatus status;

    /**
     * Izoh.
     */
    @Column(length = 1000)
    private String description;
}