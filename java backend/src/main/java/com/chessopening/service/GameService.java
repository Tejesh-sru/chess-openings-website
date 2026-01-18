package com.chessopening.service;

import com.chessopening.model.Game;
import com.chessopening.model.User;
import com.chessopening.repository.GameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Transactional
    public Game save(Game game) {
        return gameRepository.save(game);
    }

    public List<Game> listByUser(User user) {
        return gameRepository.findByUserOrderBySavedAtDesc(user);
    }

    public long countByUser(User user) { return gameRepository.countByUser(user); }

    public Optional<Game> latestByUser(User user) { return gameRepository.findTopByUserOrderBySavedAtDesc(user); }
}