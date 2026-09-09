package com.example.boxcha.accounting.service;

import com.example.boxcha.accounting.dto.response.GroupStatisticsResponse;

import java.time.LocalDate;

public interface GroupStatisticsService {

    GroupStatisticsResponse getGroupStatistics(
            Long groupId,
            LocalDate month
    );
}