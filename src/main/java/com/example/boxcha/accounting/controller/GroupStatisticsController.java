package com.example.boxcha.accounting.controller;

import com.example.boxcha.accounting.dto.response.GroupStatisticsResponse;
import com.example.boxcha.accounting.service.GroupStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/accounting/group-statistics")
@RequiredArgsConstructor
public class GroupStatisticsController {

    private final GroupStatisticsService groupStatisticsService;

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupStatisticsResponse> getStatistics(
            @PathVariable Long groupId,
            @RequestParam String month
    ) {

        // 2026-09 -> 2026-09-01
        LocalDate selectedMonth =
                YearMonth.parse(month).atDay(1);

        return ResponseEntity.ok(
                groupStatisticsService.getGroupStatistics(
                        groupId,
                        selectedMonth
                )
        );
    }
}