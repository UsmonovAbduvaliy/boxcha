package com.example.boxcha.dto.response;

import com.example.boxcha.entity.Daily;
import lombok.Value;

import java.time.LocalDate;

@Value
public class GetOneChildrenDailyResponse {
    Daily daily;
}
