package com.example.boxcha.entity;

import com.example.boxcha.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Others extends BaseEntity {
    private String firstName;
    private String lastName;
    private String phone;
    private String profession;
    private LocalDate dateOfBirth;
    private LocalDate startDate;
    private LocalDate endDate;
}
