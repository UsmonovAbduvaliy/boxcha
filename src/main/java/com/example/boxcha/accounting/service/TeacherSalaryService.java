package com.example.boxcha.accounting.service;

import com.example.boxcha.accounting.dto.request.CreateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.request.UpdateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.response.CreateTeacherSalaryResponse;
import com.example.boxcha.accounting.dto.response.TeacherSalaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface TeacherSalaryService {

    CreateTeacherSalaryResponse create(CreateTeacherSalaryRequest request);

    TeacherSalaryResponse update(Long id, UpdateTeacherSalaryRequest request);

    TeacherSalaryResponse getById(Long id);

    List<TeacherSalaryResponse> getAll();

    List<TeacherSalaryResponse> getByTeacherId(Long teacherId);

    List<TeacherSalaryResponse> getByMonth(LocalDate month);

    List<TeacherSalaryResponse> getByStatus(String status);

    void delete(Long id);
}