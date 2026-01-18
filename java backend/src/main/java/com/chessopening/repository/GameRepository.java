package com.chessopening.repository;

import com.chessopening.model.Game;
import com.chessopening.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByUserOrderBySavedAtDesc(User user);
    long countByUser(User user);
    Optional<Game> findTopByUserOrderBySavedAtDesc(User user);
}