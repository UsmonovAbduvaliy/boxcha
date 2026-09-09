package com.example.boxcha.accounting.service.impl;

import com.example.boxcha.accounting.dto.request.CreateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.request.UpdateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.response.CreateTeacherSalaryResponse;
import com.example.boxcha.accounting.dto.response.TeacherSalaryResponse;
import com.example.boxcha.accounting.entity.SalaryStatus;
import com.example.boxcha.accounting.entity.TeacherSalary;
import com.example.boxcha.accounting.repo.TeacherSalaryRepository;
import com.example.boxcha.accounting.service.TeacherSalaryService;
import com.example.boxcha.dto.response.GetOneUserResponse;
import com.example.boxcha.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherSalaryServiceImpl implements TeacherSalaryService {

    private final TeacherSalaryRepository teacherSalaryRepository;
    private final UserService userService;


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public CreateTeacherSalaryResponse create(
            CreateTeacherSalaryRequest request
    ) {

        Optional<TeacherSalary> existingSalary =
                teacherSalaryRepository.findByTeacherIdAndSalaryMonth(
                        request.getTeacherId(),
                        request.getSalaryMonth()
                );

        if (existingSalary.isPresent()) {

            return new CreateTeacherSalaryResponse(
                    mapToResponse(existingSalary.get()),
                    true
            );
        }

        TeacherSalary salary =
                TeacherSalary.builder()
                        .teacherId(request.getTeacherId())
                        .salaryMonth(request.getSalaryMonth())
                        .amount(request.getAmount())
                        .paidDate(request.getPaidDate())
                        .status(request.getStatus())
                        .description(request.getDescription())
                        .build();

        TeacherSalary saved =
                teacherSalaryRepository.save(salary);

        return new CreateTeacherSalaryResponse(
                mapToResponse(saved),
                false
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public TeacherSalaryResponse update(
            Long id,
            UpdateTeacherSalaryRequest request
    ) {

        TeacherSalary salary =
                teacherSalaryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher salary not found: " + id
                                )
                        );

        if (request.getAmount() != null) {
            salary.setAmount(
                    request.getAmount()
            );
        }

        if (request.getPaidDate() != null) {
            salary.setPaidDate(
                    request.getPaidDate()
            );
        }

        if (request.getStatus() != null) {
            salary.setStatus(
                    request.getStatus()
            );
        }

        if (request.getDescription() != null) {
            salary.setDescription(
                    request.getDescription()
            );
        }

        TeacherSalary saved =
                teacherSalaryRepository.save(salary);

        return mapToResponse(saved);
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public TeacherSalaryResponse getById(
            Long id
    ) {

        TeacherSalary salary =
                teacherSalaryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher salary not found: " + id
                                )
                        );

        return mapToResponse(salary);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherSalaryResponse> getAll() {

        return teacherSalaryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY TEACHER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherSalaryResponse> getByTeacherId(
            Long teacherId
    ) {

        return teacherSalaryRepository
                .findAllByTeacherId(teacherId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY MONTH
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherSalaryResponse> getByMonth(
            LocalDate month
    ) {

        return teacherSalaryRepository
                .findAllBySalaryMonth(month)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherSalaryResponse> getByStatus(
            String status
    ) {

        SalaryStatus salaryStatus;

        try {

            salaryStatus =
                    SalaryStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid salary status: " + status
            );
        }

        return teacherSalaryRepository
                .findAllByStatus(salaryStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void delete(Long id) {

        if (!teacherSalaryRepository.existsById(id)) {

            throw new RuntimeException(
                    "Teacher salary not found: " + id
            );
        }

        teacherSalaryRepository.deleteById(id);
    }


    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private TeacherSalaryResponse mapToResponse(
            TeacherSalary salary
    ) {

        String teacherName = null;

        try {

            GetOneUserResponse response =
                    userService.getOneUser(
                            salary.getTeacherId()
                    );

            if (response != null &&
                    response.getUser() != null) {

                teacherName =
                        buildFullName(
                                response.getUser().getFirstName(),
                                response.getUser().getLastName()
                        );
            }

        } catch (Exception ignored) {
            // Teacher topilmasa ham payment qaytadi
        }

        return TeacherSalaryResponse.builder()
                .id(salary.getId())
                .teacherId(salary.getTeacherId())
                .teacherName(teacherName)
                .salaryMonth(salary.getSalaryMonth())
                .amount(salary.getAmount())
                .paidDate(salary.getPaidDate())
                .status(salary.getStatus())
                .description(salary.getDescription())
                .build();
    }


    // =========================================================
    // FULL NAME
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
                .replaceAll("\\s+", " ");
    }
}