package com.example.boxcha.repo;

import com.example.boxcha.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findGroupByTeacherId(Long id);
    Optional<Group> findByTeacherId(Long teacherId);
}