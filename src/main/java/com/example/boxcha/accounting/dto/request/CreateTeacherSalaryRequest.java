package com.example.boxcha.accounting.dto.request;

import com.example.boxcha.accounting.entity.SalaryStatus;
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
public class CreateTeacherSalaryRequest {

    @NotNull
    private Long teacherId;

    @NotNull
    private LocalDate salaryMonth;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private LocalDate paidDate;

    @NotNull
    private SalaryStatus status;

    private String description;
}