package com.chessopening.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "json")
    private String moves; // store moves as JSON array string

    @Column(name = "moves_count")
    private Integer movesCount;

    private String title;

    @Column(name = "saved_at")
    private Instant savedAt = Instant.now();

    // getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMoves() { return moves; }
    public void setMoves(String moves) { this.moves = moves; }
    public Integer getMovesCount() { return movesCount; }
    public void setMovesCount(Integer movesCount) { this.movesCount = movesCount; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Instant getSavedAt() { return savedAt; }
    public void setSavedAt(Instant savedAt) { this.savedAt = savedAt; }
}