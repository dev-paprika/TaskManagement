package com.example.taskflow.repository;

import com.example.taskflow.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByBoardColumnIdOrderByPosition(UUID boardColumnId);
}
