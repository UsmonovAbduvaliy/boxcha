package com.example.boxcha.accounting.dto.response;

import com.example.boxcha.accounting.entity.SalaryStatus;
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
public class TeacherSalaryResponse {

    private Long id;

    private Long teacherId;

    private String teacherName;

    private LocalDate salaryMonth;

    private BigDecimal amount;

    private LocalDate paidDate;

    private SalaryStatus status;

    private String description;
}