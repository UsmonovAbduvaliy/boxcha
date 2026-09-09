package com.example.boxcha.accounting.service.impl;

import com.example.boxcha.accounting.dto.response.GroupStatisticsResponse;
import com.example.boxcha.accounting.entity.ChildPayment;
import com.example.boxcha.accounting.entity.PaymentStatus;
import com.example.boxcha.accounting.repo.ChildPaymentRepository;
import com.example.boxcha.accounting.service.GroupStatisticsService;
import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Group;
import com.example.boxcha.repo.ChildrenRepository;
import com.example.boxcha.repo.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupStatisticsServiceImpl implements GroupStatisticsService {

    private final GroupRepository groupRepository;
    private final ChildrenRepository childrenRepository;
    private final ChildPaymentRepository childPaymentRepository;

    // Hozircha oylik to'lov
    private static final BigDecimal MONTHLY_FEE =
            BigDecimal.valueOf(300_000);

    @Override
    public GroupStatisticsResponse getGroupStatistics(
            Long groupId,
            LocalDate month
    ) {

        // =====================================================
        // GROUP
        // =====================================================

        Optional<Group> groupOptional =
                groupRepository.findById(groupId);

        if (groupOptional.isEmpty()) {
            throw new RuntimeException(
                    "Group not found: " + groupId
            );
        }

        Group group = groupOptional.get();

        // =====================================================
        // CHILDREN
        // =====================================================

        List<Children> children =
                childrenRepository.findAll()
                        .stream()
                        .filter(child ->
                                child.getGroup() != null
                                        && child.getGroup()
                                        .getId()
                                        .equals(groupId)
                        )
                        .toList();

        int totalChildren = children.size();

        int activeChildren = (int) children.stream()
                .filter(child ->
                        Boolean.TRUE.equals(child.getIsActive())
                )
                .count();

        int inactiveChildren =
                totalChildren - activeChildren;

        // =====================================================
        // EXPECTED AMOUNT
        // =====================================================

        BigDecimal expectedAmount =
                MONTHLY_FEE.multiply(
                        BigDecimal.valueOf(activeChildren)
                );

        // =====================================================
        // PAYMENTS
        // =====================================================

        List<Long> activeChildIds =
                children.stream()
                        .filter(child ->
                                Boolean.TRUE.equals(
                                        child.getIsActive()
                                )
                        )
                        .map(Children::getId)
                        .toList();

        List<ChildPayment> payments =
                childPaymentRepository
                        .findAllByPaymentMonth(month)
                        .stream()
                        .filter(payment ->
                                activeChildIds.contains(
                                        payment.getChildId()
                                )
                        )
                        .toList();

        // =====================================================
        // PAYMENT COUNTS
        // =====================================================

        int paidCount = (int) payments.stream()
                .filter(payment ->
                        payment.getStatus() == PaymentStatus.PAID
                )
                .count();

        int partialCount = (int) payments.stream()
                .filter(payment ->
                        payment.getStatus() == PaymentStatus.PARTIAL
                )
                .count();

        int unpaidCount = (int) payments.stream()
                .filter(payment ->
                        payment.getStatus() == PaymentStatus.UNPAID
                )
                .count();

        // =====================================================
        // PAID AMOUNT
        // =====================================================

        BigDecimal paidAmount =
                payments.stream()
                        .map(payment ->
                                payment.getAmount() == null
                                        ? BigDecimal.ZERO
                                        : payment.getAmount()
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        // =====================================================
        // DEBT
        // =====================================================

        BigDecimal debtAmount =
                expectedAmount.subtract(paidAmount);

        if (debtAmount.compareTo(BigDecimal.ZERO) < 0) {
            debtAmount = BigDecimal.ZERO;
        }

        // =====================================================
        // TEACHER
        // =====================================================

        Long teacherId = null;
        String teacherFirstname = null;
        String teacherLastname = null;

        if (group.getTeacher() != null) {

            teacherId = group.getTeacher().getId();

            teacherFirstname =
                    group.getTeacher().getFirstName();

            teacherLastname =
                    group.getTeacher().getLastName();
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        return GroupStatisticsResponse.builder()

                .groupId(group.getId())
                .groupName(group.getName())

                .teacherId(teacherId)
                .teacherFirstname(teacherFirstname)
                .teacherLastname(teacherLastname)

                .totalChildren(totalChildren)
                .activeChildren(activeChildren)
                .inactiveChildren(inactiveChildren)

                .monthlyFee(MONTHLY_FEE)

                .expectedAmount(expectedAmount)
                .paidAmount(paidAmount)
                .debtAmount(debtAmount)

                .paidCount(paidCount)
                .partialCount(partialCount)
                .unpaidCount(unpaidCount)

                .build();
    }
}