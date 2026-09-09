package com.example.boxcha.accounting.service.impl;

import com.example.boxcha.accounting.dto.response.AccountingDashboardResponse;
import com.example.boxcha.accounting.dto.response.AccountingDashboardResponse.UnpaidChildResponse;
import com.example.boxcha.accounting.dto.response.AccountingDashboardResponse.UnpaidTeacherResponse;
import com.example.boxcha.accounting.entity.PaymentStatus;
import com.example.boxcha.accounting.entity.SalaryStatus;
import com.example.boxcha.accounting.repo.ChildPaymentRepository;
import com.example.boxcha.accounting.repo.ExpenseRepository;
import com.example.boxcha.accounting.repo.TeacherSalaryRepository;
import com.example.boxcha.accounting.service.AccountingDashboardService;
import com.example.boxcha.dto.response.GetAllChildrenResponse;
import com.example.boxcha.dto.response.GetAllUsersResponse;
import com.example.boxcha.dto.response.GetOneChildrenResponse;
import com.example.boxcha.service.interfaces.ChildrenService;
import com.example.boxcha.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountingDashboardServiceImpl
        implements AccountingDashboardService {


    private final ChildPaymentRepository childPaymentRepository;
    private final TeacherSalaryRepository teacherSalaryRepository;
    private final ExpenseRepository expenseRepository;

    private final ChildrenService childrenService;
    private final UserService userService;


    // =========================================================
    // DASHBOARD
    // =========================================================

    @Override
    public AccountingDashboardResponse getDashboard(
            LocalDate month
    ) {

        // =====================================================
        // MONTH RANGE
        // =====================================================

        LocalDate startDate =
                month.withDayOfMonth(1);

        LocalDate endDate =
                month.withDayOfMonth(
                        month.lengthOfMonth()
                );


        // =====================================================
        // DAROMAD
        // =====================================================

        BigDecimal totalIncome =
                childPaymentRepository.getTotalIncome(
                        month,
                        PaymentStatus.PAID
                );

        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }


        // =====================================================
        // RASXOD
        // =====================================================

        BigDecimal totalExpenses =
                expenseRepository.getTotalExpenses(
                        startDate,
                        endDate
                );

        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }


        // =====================================================
        // USTOZ OYLIGI
        // =====================================================

        BigDecimal totalTeacherSalaries =
                teacherSalaryRepository.getTotalSalary(
                        month,
                        SalaryStatus.PAID
                );

        if (totalTeacherSalaries == null) {
            totalTeacherSalaries = BigDecimal.ZERO;
        }


        // =====================================================
        // SOF FOYDA
        // =====================================================

        BigDecimal netIncome =
                totalIncome
                        .subtract(totalExpenses)
                        .subtract(totalTeacherSalaries);


        // =====================================================
        // ACTIVE CHILDREN
        // =====================================================

        List<GetAllChildrenResponse> activeChildren =
                childrenService
                        .getAllChildren()
                        .stream()
                        .filter(child ->
                                Boolean.TRUE.equals(
                                        child.getActive()
                                )
                        )
                        .toList();


        // =====================================================
        // SHU OYDA TO'LOV QILGAN BOLALAR
        // =====================================================

        Set<Long> paidChildIds =
                childPaymentRepository
                        .findAllByPaymentMonthAndStatus(
                                month,
                                PaymentStatus.PAID
                        )
                        .stream()
                        .map(payment ->
                                payment.getChildId()
                        )
                        .collect(Collectors.toSet());


        // =====================================================
        // QARZDOR BOLALAR
        // =====================================================

        List<UnpaidChildResponse> unpaidChildren =
                activeChildren
                        .stream()
                        .filter(child ->
                                !paidChildIds.contains(
                                        child.getId()
                                )
                        )
                        .map(child ->
                                UnpaidChildResponse.builder()
                                        .childId(
                                                child.getId()
                                        )
                                        .childName(
                                                buildFullName(
                                                        child.getFirstName(),
                                                        child.getLastName(),
                                                        child.getPatronymic()
                                                )
                                        )
                                        .groupName(
                                                getGroupName(
                                                        child.getId()
                                                )
                                        )
                                        .build()
                        )
                        .toList();


        // =====================================================
        // ACTIVE TEACHERS
        // =====================================================

        List<GetAllUsersResponse> activeTeachers =
                userService
                        .getAllByActiveUsers(
                                true,
                                PageRequest.of(
                                        0,
                                        1000
                                )
                        )
                        .stream()
                        .filter(this::isTeacher)
                        .toList();


        // =====================================================
        // SHU OYDA OYLIGI BERILGAN TEACHERLAR
        // =====================================================

        Set<Long> paidTeacherIds =
                teacherSalaryRepository
                        .findAllBySalaryMonthAndStatus(
                                month,
                                SalaryStatus.PAID
                        )
                        .stream()
                        .map(teacher ->
                                teacher.getTeacherId()
                        )
                        .collect(Collectors.toSet());


        // =====================================================
        // OYLIGI BERILMAGAN TEACHERLAR
        // =====================================================

        List<UnpaidTeacherResponse> unpaidTeachers =
                activeTeachers
                        .stream()
                        .filter(teacher ->
                                !paidTeacherIds.contains(
                                        teacher.getId()
                                )
                        )
                        .map(teacher ->
                                UnpaidTeacherResponse.builder()
                                        .teacherId(
                                                teacher.getId()
                                        )
                                        .teacherName(
                                                buildFullName(
                                                        teacher.getFirstName(),
                                                        teacher.getLastName()
                                                )
                                        )
                                        .build()
                        )
                        .toList();


        // =====================================================
        // RESPONSE
        // =====================================================

        return AccountingDashboardResponse.builder()

                .totalIncome(
                        totalIncome
                )

                .totalExpenses(
                        totalExpenses
                )

                .totalTeacherSalaries(
                        totalTeacherSalaries
                )

                .netIncome(
                        netIncome
                )

                .unpaidChildrenCount(
                        (long) unpaidChildren.size()
                )

                .unpaidTeachersCount(
                        (long) unpaidTeachers.size()
                )

                .unpaidChildren(
                        unpaidChildren
                )

                .unpaidTeachers(
                        unpaidTeachers
                )

                .build();
    }


    // =========================================================
    // CHECK TEACHER
    // =========================================================

    private boolean isTeacher(
            GetAllUsersResponse user
    ) {

        if (user.getProfession() == null) {
            return false;
        }

        return user.getProfession()
                .equalsIgnoreCase("TEACHER");
    }


    // =========================================================
    // GET GROUP NAME
    // =========================================================

    private String getGroupName(
            Long childId
    ) {

        try {

            GetOneChildrenResponse child =
                    childrenService.getOneChildren(
                            childId
                    );

            if (child == null) {
                return null;
            }

            return child.getGroupName();

        } catch (Exception e) {

            return null;
        }
    }


    // =========================================================
    // FULL CHILD NAME
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
                .replaceAll(
                        "\\s+",
                        " "
                );
    }


    // =========================================================
    // FULL TEACHER NAME
    // =========================================================

    private String buildFullName(
            String firstName,
            String lastName
    ) {

        return String.join(
                        " ",
                        firstName == null ? "" : firstName,
                        lastName == null ? "" : lastName
                )
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }
}