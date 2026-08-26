package com.example.boxcha.dto.response;

import lombok.Value;

@Value
public class GetAllUsersResponse {
    Long id;
    String firstName;
    String lastName;
    Boolean isActive;
    String profession;
}
