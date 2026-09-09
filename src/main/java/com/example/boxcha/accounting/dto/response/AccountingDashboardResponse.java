package com.example.boxcha.accounting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountingDashboardResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalTeacherSalaries;
    private BigDecimal netIncome;

    private Long unpaidChildrenCount;
    private Long unpaidTeachersCount;

    private List<UnpaidChildResponse> unpaidChildren;
    private List<UnpaidTeacherResponse> unpaidTeachers;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UnpaidChildResponse {

        private Long childId;
        private String childName;
        private String groupName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UnpaidTeacherResponse {

        private Long teacherId;
        private String teacherName;
    }
}