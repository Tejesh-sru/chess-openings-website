package com.chessopening.controller;

import com.chessopening.dto.UserProfileDTO;
import com.chessopening.model.User;
import com.chessopening.service.GameService;
import com.chessopening.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final UserService userService;
    private final GameService gameService;

    public ProfileController(UserService userService, GameService gameService) {
        this.userService = userService;
        this.gameService = gameService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> profile(Authentication auth) {
        String username = auth.getName();
        User u = userService.findByUsername(username);
        if (u == null) return ResponseEntity.notFound().build();
        
        UserProfileDTO dto = new UserProfileDTO(
            u.getId(),
            u.getUsername(),
            u.getEmail(),
            u.getDisplayName(),
            u.getAvatarUrl(),
            u.getBio()
        );
        
        long count = gameService.countByUser(u);
        dto.setGamesCount(count);
        gameService.latestByUser(u).ifPresent(game -> dto.setLatestSavedAt(game.getSavedAt()));
        
        return ResponseEntity.ok(dto);
    }
}