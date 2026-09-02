package com.example.boxcha.dto.response;

import lombok.Value;

import java.time.LocalDate;

@Value
public class GetAllOthersResponse {
    Long id;
    String firstName;
    String lastName;
    String profession;
    String phone;
    LocalDate birthDate;
    Boolean active;
}
