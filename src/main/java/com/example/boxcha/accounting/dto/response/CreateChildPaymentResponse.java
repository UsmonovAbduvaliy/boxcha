package com.example.boxcha.accounting.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateChildPaymentResponse {
    ChildPaymentResponse payment;
    boolean alreadyExists;
}
