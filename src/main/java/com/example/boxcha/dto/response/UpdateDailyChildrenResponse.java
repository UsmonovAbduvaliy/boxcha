package com.example.boxcha.dto.response;

import lombok.Value;

import java.time.LocalDate;

@Value
public class UpdateDailyChildrenResponse {
    Long id;
    LocalDate date;
    Boolean present;
}
