package com.example.boxcha.accounting.controller;

import com.example.boxcha.accounting.dto.response.AccountingDashboardResponse;
import com.example.boxcha.accounting.service.AccountingDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/accounting/dashboard")
@RequiredArgsConstructor
public class AccountingDashboardController {

    private final AccountingDashboardService accountingDashboardService;

    @GetMapping
    public ResponseEntity<AccountingDashboardResponse> getDashboard(
            @RequestParam LocalDate month
    ) {

        return ResponseEntity.ok(
                accountingDashboardService.getDashboard(month)
        );
    }
}