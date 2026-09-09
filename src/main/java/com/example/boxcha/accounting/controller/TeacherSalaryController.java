package com.example.boxcha.accounting.controller;

import com.example.boxcha.accounting.dto.request.CreateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.request.UpdateTeacherSalaryRequest;
import com.example.boxcha.accounting.dto.response.TeacherSalaryResponse;
import com.example.boxcha.accounting.service.TeacherSalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounting/teacher-salaries")
@RequiredArgsConstructor
public class TeacherSalaryController {

    private final TeacherSalaryService teacherSalaryService;


    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateTeacherSalaryRequest request
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.create(request)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<TeacherSalaryResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateTeacherSalaryRequest request
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.update(id, request)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<TeacherSalaryResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.getById(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<TeacherSalaryResponse>> getAll() {

        return ResponseEntity.ok(
                teacherSalaryService.getAll()
        );
    }


    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TeacherSalaryResponse>> getByTeacherId(
            @PathVariable Long teacherId
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.getByTeacherId(teacherId)
        );
    }


    @GetMapping("/month")
    public ResponseEntity<List<TeacherSalaryResponse>> getByMonth(
            @RequestParam LocalDate month
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.getByMonth(month)
        );
    }


    @GetMapping("/status")
    public ResponseEntity<List<TeacherSalaryResponse>> getByStatus(
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                teacherSalaryService.getByStatus(status)
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        teacherSalaryService.delete(id);

        return ResponseEntity.noContent().build();
    }
}