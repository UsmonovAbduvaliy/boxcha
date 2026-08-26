package com.example.boxcha.dto.response;

import lombok.Value;

@Value
public class GetAllOthersResponse {
    Long id;
    String firstName;
    String lastName;
    String profession;
    Boolean active;
}
