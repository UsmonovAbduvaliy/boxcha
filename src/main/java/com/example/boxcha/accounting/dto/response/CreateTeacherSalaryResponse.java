package com.example.boxcha.accounting.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTeacherSalaryResponse {

    private TeacherSalaryResponse salary;

    private boolean alreadyExists;
}