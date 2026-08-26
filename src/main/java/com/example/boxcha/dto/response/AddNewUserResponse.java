package com.example.boxcha.dto.response;

import lombok.Value;

@Value
public class AddNewUserResponse {
    Long id;
    String email;
    String firstName;
    String lastName;
    String phone;
}
