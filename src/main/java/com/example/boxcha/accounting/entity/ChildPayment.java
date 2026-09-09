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
@Table(name = "accounting_child_payments")
public class ChildPayment extends BaseEntity {

    /**
     * Boxcha dagi Children entity ID'si.
     */
    @Column(name = "child_id", nullable = false)
    private Long childId;

    /**
     * Qaysi oy uchun to'lov.
     * Masalan: 2026-09-01 -> 2026-yil sentabr.
     */
    @Column(name = "payment_month", nullable = false)
    private LocalDate paymentMonth;

    /**
     * To'langan summa.
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * To'lov amalga oshirilgan sana.
     */
    @Column(name = "paid_date")
    private LocalDate paidDate;

    /**
     * To'lov holati.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    /**
     * Izoh.
     */
    @Column(length = 1000)
    private String description;
}