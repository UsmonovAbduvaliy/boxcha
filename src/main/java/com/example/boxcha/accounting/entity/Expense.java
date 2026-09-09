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
@Table(name = "accounting_expenses")
public class Expense extends BaseEntity {

    /**
     * Xarajat kategoriyasi.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    /**
     * Nima xarid qilindi yoki nimaga pul sarflandi.
     */
    @Column(nullable = false, length = 500)
    private String title;

    /**
     * Xarajat summasi.
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Xarajat qilingan sana.
     */
    @Column(nullable = false)
    private LocalDate expenseDate;

    /**
     * Xarajat haqida qo'shimcha ma'lumot.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Chek yoki rasm URL'i.
     */
    @Column(name = "receipt_url", length = 1000)
    private String receiptUrl;
}