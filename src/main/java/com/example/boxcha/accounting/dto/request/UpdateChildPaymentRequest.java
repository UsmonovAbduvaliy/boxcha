package com.example.boxcha.accounting.dto.request;

import com.example.boxcha.accounting.entity.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateChildPaymentRequest {

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private LocalDate paidDate;

    private PaymentStatus status;

    private String description;
}