package com.example.boxcha.accounting.dto.response;

import com.example.boxcha.accounting.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildPaymentResponse {

    private Long id;

    private Long childId;

    private String childName;

    private String groupName;

    private LocalDate paymentMonth;

    private BigDecimal amount;

    private LocalDate paidDate;

    private PaymentStatus status;

    private String description;
}