package com.example.boxcha.accounting.service.impl;

import com.example.boxcha.accounting.dto.request.CreateChildPaymentRequest;
import com.example.boxcha.accounting.dto.request.UpdateChildPaymentRequest;
import com.example.boxcha.accounting.dto.response.ChildPaymentResponse;
import com.example.boxcha.accounting.dto.response.CreateChildPaymentResponse;
import com.example.boxcha.accounting.entity.ChildPayment;
import com.example.boxcha.accounting.entity.PaymentStatus;
import com.example.boxcha.accounting.repo.ChildPaymentRepository;
import com.example.boxcha.accounting.service.ChildPaymentService;
import com.example.boxcha.dto.response.GetOneChildrenResponse;
import com.example.boxcha.service.interfaces.ChildrenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChildPaymentServiceImpl implements ChildPaymentService {

    private final ChildPaymentRepository childPaymentRepository;
    private final ChildrenService childrenService;


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public CreateChildPaymentResponse create(
            CreateChildPaymentRequest request
    ) {

        Optional<ChildPayment> existingPayment =
                childPaymentRepository.findByChildIdAndPaymentMonth(
                        request.getChildId(),
                        request.getPaymentMonth()
                );

        if (existingPayment.isPresent()) {

            return new CreateChildPaymentResponse(
                    mapToResponse(existingPayment.get()),
                    true
            );
        }

        ChildPayment payment = ChildPayment.builder()
                .childId(request.getChildId())
                .paymentMonth(request.getPaymentMonth())
                .amount(request.getAmount())
                .paidDate(request.getPaidDate())
                .status(request.getStatus())
                .description(request.getDescription())
                .build();

        ChildPayment saved =
                childPaymentRepository.save(payment);

        return new CreateChildPaymentResponse(
                mapToResponse(saved),
                false
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public ChildPaymentResponse update(
            Long id,
            UpdateChildPaymentRequest request
    ) {

        ChildPayment payment =
                childPaymentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Child payment not found: " + id
                                )
                        );

        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }

        if (request.getPaidDate() != null) {
            payment.setPaidDate(request.getPaidDate());
        }

        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }

        if (request.getDescription() != null) {
            payment.setDescription(request.getDescription());
        }

        ChildPayment saved =
                childPaymentRepository.save(payment);

        return mapToResponse(saved);
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ChildPaymentResponse getById(Long id) {

        ChildPayment payment =
                childPaymentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Child payment not found: " + id
                                )
                        );

        return mapToResponse(payment);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ChildPaymentResponse> getAll() {

        return childPaymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY CHILD
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ChildPaymentResponse> getByChildId(
            Long childId
    ) {

        return childPaymentRepository
                .findAllByChildId(childId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY MONTH
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ChildPaymentResponse> getByMonth(
            LocalDate month
    ) {

        return childPaymentRepository
                .findAllByPaymentMonth(month)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ChildPaymentResponse> getByStatus(
            String status
    ) {

        PaymentStatus paymentStatus;

        try {

            paymentStatus =
                    PaymentStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid payment status: " + status
            );
        }

        return childPaymentRepository
                .findAllByStatus(paymentStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void delete(Long id) {

        if (!childPaymentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Child payment not found: " + id
            );
        }

        childPaymentRepository.deleteById(id);
    }


    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private ChildPaymentResponse mapToResponse(
            ChildPayment payment
    ) {

        String childName = null;
        String groupName = null;

        try {

            GetOneChildrenResponse child =
                    childrenService.getOneChildren(
                            payment.getChildId()
                    );

            if (child != null) {

                childName =
                        buildFullName(
                                child.getFirstName(),
                                child.getLastName(),
                                child.getPatronymic()
                        );

                groupName =
                        child.getGroupName();
            }

        } catch (Exception ignored) {
            // Child o'chirilgan yoki topilmagan bo'lsa
        }

        return ChildPaymentResponse.builder()
                .id(payment.getId())
                .childId(payment.getChildId())
                .childName(childName)
                .groupName(groupName)
                .paymentMonth(payment.getPaymentMonth())
                .amount(payment.getAmount())
                .paidDate(payment.getPaidDate())
                .status(payment.getStatus())
                .description(payment.getDescription())
                .build();
    }


    // =========================================================
    // FULL NAME
    // =========================================================

    private String buildFullName(
            String firstName,
            String lastName,
            String patronymic
    ) {

        return String.join(
                        " ",
                        firstName == null ? "" : firstName,
                        lastName == null ? "" : lastName,
                        patronymic == null ? "" : patronymic
                )
                .trim()
                .replaceAll("\\s+", " ");
    }
}
