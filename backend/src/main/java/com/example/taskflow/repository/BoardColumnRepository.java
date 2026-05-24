package com.example.taskflow.repository;

import com.example.taskflow.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
    List<BoardColumn> findByUserIdOrderByPosition(UUID userId);
}
