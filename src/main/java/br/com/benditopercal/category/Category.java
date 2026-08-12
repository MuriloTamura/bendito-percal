package br.com.benditopercal.category;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Category() {}

    public Category(String name) {
        this.name = name;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void rename(String name) { this.name = name; }
    public void deactivate() { this.active = false; }
}