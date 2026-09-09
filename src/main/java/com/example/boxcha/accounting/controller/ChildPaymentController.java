package com.example.boxcha.accounting.controller;

import com.example.boxcha.accounting.dto.request.CreateChildPaymentRequest;
import com.example.boxcha.accounting.dto.request.UpdateChildPaymentRequest;
import com.example.boxcha.accounting.dto.response.ChildPaymentResponse;
import com.example.boxcha.accounting.service.ChildPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounting/child-payments")
@RequiredArgsConstructor
public class ChildPaymentController {

    private final ChildPaymentService childPaymentService;


    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateChildPaymentRequest request
    ) {

        return ResponseEntity.ok(
                childPaymentService.create(request)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ChildPaymentResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateChildPaymentRequest request
    ) {

        return ResponseEntity.ok(
                childPaymentService.update(id, request)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ChildPaymentResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                childPaymentService.getById(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<ChildPaymentResponse>> getAll() {

        return ResponseEntity.ok(
                childPaymentService.getAll()
        );
    }


    @GetMapping("/child/{childId}")
    public ResponseEntity<List<ChildPaymentResponse>> getByChildId(
            @PathVariable Long childId
    ) {

        return ResponseEntity.ok(
                childPaymentService.getByChildId(childId)
        );
    }


    @GetMapping("/month")
    public ResponseEntity<List<ChildPaymentResponse>> getByMonth(
            @RequestParam LocalDate month
    ) {

        return ResponseEntity.ok(
                childPaymentService.getByMonth(month)
        );
    }


    @GetMapping("/status")
    public ResponseEntity<List<ChildPaymentResponse>> getByStatus(
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                childPaymentService.getByStatus(status)
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        childPaymentService.delete(id);

        return ResponseEntity.noContent().build();
    }
}