package com.example.boxcha.dto.response;

import lombok.*;
import lombok.Value;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    String accessToken;
    String refreshToken;
}
