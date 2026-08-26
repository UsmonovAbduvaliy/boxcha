package com.example.boxcha.repo;

import com.example.boxcha.entity.Children;
import com.example.boxcha.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildrenRepository extends JpaRepository<Children, Long> {
    List<Children> findByGroupAndIsActiveTrue(Group group);
}