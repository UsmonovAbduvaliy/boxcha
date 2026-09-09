package com.example.boxcha.accounting.controller;

import com.example.boxcha.accounting.dto.request.CreateExpenseRequest;
import com.example.boxcha.accounting.dto.request.UpdateExpenseRequest;
import com.example.boxcha.accounting.dto.response.ExpenseResponse;
import com.example.boxcha.accounting.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounting/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;


    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
            @RequestBody CreateExpenseRequest request
    ) {

        return ResponseEntity.ok(
                expenseService.create(request)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateExpenseRequest request
    ) {

        return ResponseEntity.ok(
                expenseService.update(id, request)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                expenseService.getById(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll() {

        return ResponseEntity.ok(
                expenseService.getAll()
        );
    }


    @GetMapping("/date")
    public ResponseEntity<List<ExpenseResponse>> getByDate(
            @RequestParam LocalDate date
    ) {

        return ResponseEntity.ok(
                expenseService.getByDate(date)
        );
    }


    @GetMapping("/between")
    public ResponseEntity<List<ExpenseResponse>> getBetween(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                expenseService.getByDateBetween(
                        startDate,
                        endDate
                )
        );
    }


    @GetMapping("/category")
    public ResponseEntity<List<ExpenseResponse>> getByCategory(
            @RequestParam String category
    ) {

        return ResponseEntity.ok(
                expenseService.getByCategory(category)
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        expenseService.delete(id);

        return ResponseEntity.noContent().build();
    }
}