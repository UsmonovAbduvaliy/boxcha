package com.example.boxcha.accounting.dto.response;

import com.example.boxcha.accounting.entity.ExpenseCategory;
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
public class ExpenseResponse {

    private Long id;

    private ExpenseCategory category;

    private String title;

    private BigDecimal amount;

    private LocalDate expenseDate;

    private String description;

    private String receiptUrl;
}