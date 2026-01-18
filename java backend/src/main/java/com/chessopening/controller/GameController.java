package com.chessopening.controller;

import com.chessopening.model.Game;
import com.chessopening.model.User;
import com.chessopening.service.GameService;
import com.chessopening.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;
    private final UserService userService;

    public GameController(GameService gameService, UserService userService) {
        this.gameService = gameService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Game> saveGame(@RequestBody Game game, Authentication auth) {
        String username = auth.getName();
        User user = userService.findByUsername(username);
        if (user == null) return ResponseEntity.status(401).build();
        game.setUser(user);
        if (game.getMoves() != null) {
            // naive moves count calculation if JSON array provided as string
            long count = game.getMoves().chars().filter(ch -> ch == '"').count() / 2; // crude but works for ["e4","e5"]
            game.setMovesCount((int) Math.max(0, count));
        }
        Game saved = gameService.save(game);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Game>> listMyGames(Authentication auth) {
        String username = auth.getName();
        User user = userService.findByUsername(username);
        if (user == null) return ResponseEntity.status(401).build();
        List<Game> games = gameService.listByUser(user);
        return ResponseEntity.ok(games);
    }
}