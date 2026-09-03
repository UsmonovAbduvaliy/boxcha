package com.example.boxcha.entity;

import com.example.boxcha.entity.base.BaseEntity;
import jakarta.persistence.*;
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
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_daily_child_date",
                        columnNames = {
                                "child_id",
                                "date"
                        }
                )
        }
)
public class Daily extends BaseEntity {
    private LocalDate date;
    private Boolean isPresent;
    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private Children children;
}
