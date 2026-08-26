package com.example.boxcha.entity;

import com.example.boxcha.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Children extends BaseEntity {
    private String firstName;
    private String lastName;
    private String patronymic;
    private Integer age;
    private String gender;
    private LocalDate birthDate;
    private String motherFirstName;
    private String motherLastName;
    private String fatherFirstName;
    private String fatherLastName;
    private String motherPhone;
    private String fatherPhone;
    @ManyToOne
    private Group group;
    private String address;
    @OneToMany(mappedBy = "children")
    List<Daily> daily;
}
