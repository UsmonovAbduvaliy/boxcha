package com.example.boxcha.dto.request;

import lombok.Value;

import java.time.LocalDate;

@Value
public class AddDailyChildrenRequest {
    Long id;
    Boolean isPresent;
    LocalDate date;
}
