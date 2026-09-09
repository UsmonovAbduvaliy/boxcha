package com.example.boxcha.accounting.service;

import com.example.boxcha.accounting.dto.request.CreateExpenseRequest;
import com.example.boxcha.accounting.dto.request.UpdateExpenseRequest;
import com.example.boxcha.accounting.dto.response.ExpenseResponse;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {

    ExpenseResponse create(CreateExpenseRequest request);

    ExpenseResponse update(Long id, UpdateExpenseRequest request);

    ExpenseResponse getById(Long id);

    List<ExpenseResponse> getAll();

    List<ExpenseResponse> getByDate(LocalDate date);

    List<ExpenseResponse> getByDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<ExpenseResponse> getByCategory(String category);

    void delete(Long id);
}