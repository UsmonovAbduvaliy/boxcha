package com.example.boxcha.accounting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupStatisticsResponse {

    private Long groupId;
    private String groupName;

    private Long teacherId;
    private String teacherFirstname;
    private String teacherLastname;

    // Children
    private int totalChildren;
    private int activeChildren;
    private int inactiveChildren;

    // Payment
    private BigDecimal monthlyFee;

    private BigDecimal expectedAmount;
    private BigDecimal paidAmount;
    private BigDecimal debtAmount;

    private int paidCount;
    private int partialCount;
    private int unpaidCount;
}