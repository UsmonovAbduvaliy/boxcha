package com.example.boxcha.accounting.service;

import com.example.boxcha.accounting.dto.request.CreateChildPaymentRequest;
import com.example.boxcha.accounting.dto.request.UpdateChildPaymentRequest;
import com.example.boxcha.accounting.dto.response.ChildPaymentResponse;
import com.example.boxcha.accounting.dto.response.CreateChildPaymentResponse;

import java.time.LocalDate;
import java.util.List;

public interface ChildPaymentService {

    CreateChildPaymentResponse create(CreateChildPaymentRequest request);

    ChildPaymentResponse update(Long id, UpdateChildPaymentRequest request);

    ChildPaymentResponse getById(Long id);

    List<ChildPaymentResponse> getAll();

    List<ChildPaymentResponse> getByChildId(Long childId);

    List<ChildPaymentResponse> getByMonth(LocalDate month);

    List<ChildPaymentResponse> getByStatus(String status);

    void delete(Long id);
}