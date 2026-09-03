package com.example.boxcha.repo;

import com.example.boxcha.entity.Daily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyRepository extends JpaRepository<Daily, Long> {
    List<Daily> findAllByChildrenId(Long childrenId);

    List<Daily> findAllByChildrenIdAndDateBetween(
            Long childrenId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<Daily> findByChildrenIdAndDate(
            Long childrenId,
            LocalDate date
    );
}