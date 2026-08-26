package com.example.boxcha.dto.request;

import lombok.Value;

@Value
public class UpdateUserRequest {
    String email;
    String firstName;
    String lastName;
    String phone;
}
