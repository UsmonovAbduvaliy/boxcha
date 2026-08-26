package com.example.boxcha.dto.response;

import lombok.Value;

@Value
public class UpdateUserResponse {
    Long id;
    String email;
    String firstName;
    String lastName;
    String phone;
}
