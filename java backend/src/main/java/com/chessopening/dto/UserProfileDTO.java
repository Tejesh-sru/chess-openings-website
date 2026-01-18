package com.chessopening.dto;

import java.time.Instant;
import java.util.List;

public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private List<String> favorites;
    private Long gamesCount;
    private Instant latestSavedAt;

    public UserProfileDTO() {}

    public UserProfileDTO(Long id, String username, String email, String displayName, String avatarUrl, String bio) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public List<String> getFavorites() { return favorites; }
    public void setFavorites(List<String> favorites) { this.favorites = favorites; }

    public Long getGamesCount() { return gamesCount; }
    public void setGamesCount(Long gamesCount) { this.gamesCount = gamesCount; }

    public Instant getLatestSavedAt() { return latestSavedAt; }
    public void setLatestSavedAt(Instant latestSavedAt) { this.latestSavedAt = latestSavedAt; }
}
