package com.example.boxcha.repo;

import com.example.boxcha.entity.Daily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DailyRepository extends JpaRepository<Daily, Long> {
    List<Daily> findAllByChildrenId(Long id);
}