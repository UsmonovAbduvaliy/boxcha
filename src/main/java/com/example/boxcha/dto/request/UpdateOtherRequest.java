package com.example.boxcha.dto.request;

import lombok.Value;

import java.time.LocalDate;

@Value
public class UpdateOtherRequest {
    String firstName;
    String lastName;
    String phone;
    String profession;
    LocalDate dateOfBirth;
}
