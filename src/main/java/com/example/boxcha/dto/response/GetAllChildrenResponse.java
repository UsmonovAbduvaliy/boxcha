package com.example.boxcha.dto.response;

import lombok.Value;

import java.time.LocalDate;

@Value
public class GetAllChildrenResponse {
    Long id;
    String firstName;
    String lastName;
    String patronymic;
    Integer age;
    String gender;
    Boolean active;
}
