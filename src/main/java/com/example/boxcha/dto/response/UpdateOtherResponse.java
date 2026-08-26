package com.example.boxcha.dto.response;

import lombok.Value;

import java.time.LocalDate;

@Value
public class UpdateOtherResponse {
    Long id;
    String firstName;
    String lastName;
    String phone;
    String profession;
    LocalDate dateOfBirth;
}
