package com.example.boxcha.accounting.dto.request;

import com.example.boxcha.accounting.entity.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class CreateChildPaymentRequest {

    @NotNull
    private Long childId;

    @NotNull
    private LocalDate paymentMonth;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private LocalDate paidDate;

    @NotNull
    private PaymentStatus status;

    private String description;
}