package com.example.boxcha.accounting.service;

import com.example.boxcha.accounting.dto.response.AccountingDashboardResponse;

import java.time.LocalDate;

public interface AccountingDashboardService {

    AccountingDashboardResponse getDashboard(
            LocalDate month
    );
}