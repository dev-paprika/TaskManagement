package com.example.taskflow.repository;

import com.example.taskflow.entity.CardTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CardTagRepository extends JpaRepository<CardTag, UUID> {
    List<CardTag> findByCardId(UUID cardId);
}
