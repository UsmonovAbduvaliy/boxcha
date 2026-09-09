package com.example.boxcha.accounting.service.impl;

import com.example.boxcha.accounting.dto.request.CreateExpenseRequest;
import com.example.boxcha.accounting.dto.request.UpdateExpenseRequest;
import com.example.boxcha.accounting.dto.response.ExpenseResponse;
import com.example.boxcha.accounting.entity.Expense;
import com.example.boxcha.accounting.entity.ExpenseCategory;
import com.example.boxcha.accounting.repo.ExpenseRepository;
import com.example.boxcha.accounting.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Override
    public ExpenseResponse create(CreateExpenseRequest request) {

        Expense expense = Expense.builder()
                .category(request.getCategory())
                .title(request.getTitle())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .description(request.getDescription())
                .receiptUrl(request.getReceiptUrl())
                .build();

        Expense saved = expenseRepository.save(expense);

        return mapToResponse(saved);
    }

    @Override
    public ExpenseResponse update(
            Long id,
            UpdateExpenseRequest request
    ) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense topilmadi: " + id
                        )
                );

        if (request.getCategory() != null) {
            expense.setCategory(request.getCategory());
        }

        if (request.getTitle() != null) {
            expense.setTitle(request.getTitle());
        }

        if (request.getAmount() != null) {
            expense.setAmount(request.getAmount());
        }

        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }

        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription());
        }

        if (request.getReceiptUrl() != null) {
            expense.setReceiptUrl(request.getReceiptUrl());
        }

        return mapToResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getById(Long id) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense topilmadi: " + id
                        )
                );

        return mapToResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAll() {

        return expenseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByDate(
            LocalDate date
    ) {

        return expenseRepository.findAllByExpenseDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByDateBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return expenseRepository.findAllByExpenseDateBetween(
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByCategory(
            String category
    ) {

        ExpenseCategory expenseCategory;

        try {
            expenseCategory = ExpenseCategory.valueOf(
                    category.toUpperCase()
            );
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Noto'g'ri expense category: " + category
            );
        }

        return expenseRepository.findAllByCategory(expenseCategory)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {

        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException(
                    "Expense topilmadi: " + id
            );
        }

        expenseRepository.deleteById(id);
    }

    private ExpenseResponse mapToResponse(
            Expense expense
    ) {

        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .receiptUrl(expense.getReceiptUrl())
                .build();
    }
}