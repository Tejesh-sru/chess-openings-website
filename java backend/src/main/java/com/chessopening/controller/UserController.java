package com.chessopening.controller;

import com.chessopening.dto.AuthResponse;
import com.chessopening.dto.UserProfileDTO;
import com.chessopening.model.User;
import com.chessopening.security.JwtUtil;
import com.chessopening.service.GameService;
import com.chessopening.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final GameService gameService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserController(UserService userService, GameService gameService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.gameService = gameService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        // UserService.register() handles password hashing
        User saved = userService.register(user);
        // Generate JWT token for the new user
        String token = jwtUtil.generateToken(saved.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getProfile(Authentication auth) {
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
        
        // Parse favorites from JSON string
        try {
            if (u.getFavorites() != null && !u.getFavorites().isEmpty()) {
                List<String> faves = Arrays.asList(objectMapper.readValue(u.getFavorites(), String[].class));
                dto.setFavorites(faves);
            } else {
                dto.setFavorites(new ArrayList<>());
            }
        } catch (Exception e) {
            dto.setFavorites(new ArrayList<>());
        }
        
        // Get game statistics
        long count = gameService.countByUser(u);
        dto.setGamesCount(count);
        
        gameService.latestByUser(u).ifPresent(game -> dto.setLatestSavedAt(game.getSavedAt()));
        
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody User updates, Authentication auth) {
        String username = auth.getName();
        User u = userService.findByUsername(username);
        if (u == null) return ResponseEntity.notFound().build();
        
        // Update profile fields
        if (updates.getDisplayName() != null) u.setDisplayName(updates.getDisplayName());
        if (updates.getAvatarUrl() != null) u.setAvatarUrl(updates.getAvatarUrl());
        if (updates.getBio() != null) u.setBio(updates.getBio());
        if (updates.getEmail() != null) u.setEmail(updates.getEmail());
        
        User saved = userService.save(u);
        
        UserProfileDTO dto = new UserProfileDTO(
            saved.getId(),
            saved.getUsername(),
            saved.getEmail(),
            saved.getDisplayName(),
            saved.getAvatarUrl(),
            saved.getBio()
        );
        
        // Parse favorites
        try {
            if (saved.getFavorites() != null && !saved.getFavorites().isEmpty()) {
                List<String> faves = Arrays.asList(objectMapper.readValue(saved.getFavorites(), String[].class));
                dto.setFavorites(faves);
            } else {
                dto.setFavorites(new ArrayList<>());
            }
        } catch (Exception e) {
            dto.setFavorites(new ArrayList<>());
        }
        
        long count = gameService.countByUser(saved);
        dto.setGamesCount(count);
        gameService.latestByUser(saved).ifPresent(game -> dto.setLatestSavedAt(game.getSavedAt()));
        
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/me/favorites")
    public ResponseEntity<List<String>> addFavorite(@RequestBody FavoriteRequest req, Authentication auth) {
        String username = auth.getName();
        User u = userService.findByUsername(username);
        if (u == null) return ResponseEntity.notFound().build();
        
        List<String> favorites = new ArrayList<>();
        try {
            if (u.getFavorites() != null && !u.getFavorites().isEmpty()) {
                favorites = new ArrayList<>(Arrays.asList(objectMapper.readValue(u.getFavorites(), String[].class)));
            }
        } catch (Exception e) {
            // ignore parse errors
        }
        
        if (!favorites.contains(req.getOpeningId())) {
            favorites.add(req.getOpeningId());
        }
        
        try {
            u.setFavorites(objectMapper.writeValueAsString(favorites));
            userService.save(u);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/me/favorites/{openingId}")
    public ResponseEntity<List<String>> removeFavorite(@PathVariable String openingId, Authentication auth) {
        String username = auth.getName();
        User u = userService.findByUsername(username);
        if (u == null) return ResponseEntity.notFound().build();
        
        List<String> favorites = new ArrayList<>();
        try {
            if (u.getFavorites() != null && !u.getFavorites().isEmpty()) {
                favorites = new ArrayList<>(Arrays.asList(objectMapper.readValue(u.getFavorites(), String[].class)));
            }
        } catch (Exception e) {
            // ignore parse errors
        }
        
        favorites.remove(openingId);
        
        try {
            u.setFavorites(objectMapper.writeValueAsString(favorites));
            userService.save(u);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        
        return ResponseEntity.ok(favorites);
    }
}

class FavoriteRequest {
    private String openingId;
    
    public String getOpeningId() { return openingId; }
    public void setOpeningId(String openingId) { this.openingId = openingId; }
}