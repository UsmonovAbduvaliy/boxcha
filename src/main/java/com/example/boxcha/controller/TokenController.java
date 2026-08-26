package com.example.boxcha.controller;

import com.example.boxcha.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
public class TokenController {

    @PostMapping
    public ResponseEntity<?> checkToken(String token){
        return ResponseEntity.ok().build();
    }
}
