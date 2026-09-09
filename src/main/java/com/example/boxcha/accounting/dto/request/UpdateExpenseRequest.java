package com.example.boxcha.accounting.dto.request;

import com.example.boxcha.accounting.entity.ExpenseCategory;
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
public class UpdateExpenseRequest {

    private ExpenseCategory category;

    private String title;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private LocalDate expenseDate;

    private String description;

    private String receiptUrl;
}