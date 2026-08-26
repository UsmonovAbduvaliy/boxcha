package com.example.boxcha.repo;

import com.example.boxcha.entity.Others;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OthersRepository extends JpaRepository<Others, Long> {

    List<Others> findAllByIsActive(Boolean active);
}