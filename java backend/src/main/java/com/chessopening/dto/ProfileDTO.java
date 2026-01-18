package com.chessopening.dto;

import java.time.Instant;

public class ProfileDTO {
    private String username;
    private Long gamesCount;
    private Instant latestSavedAt;

    public ProfileDTO() {}

    public ProfileDTO(String username, Long gamesCount, Instant latestSavedAt) {
        this.username = username;
        this.gamesCount = gamesCount;
        this.latestSavedAt = latestSavedAt;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Long getGamesCount() { return gamesCount; }
    public void setGamesCount(Long gamesCount) { this.gamesCount = gamesCount; }
    public Instant getLatestSavedAt() { return latestSavedAt; }
    public void setLatestSavedAt(Instant latestSavedAt) { this.latestSavedAt = latestSavedAt; }
}