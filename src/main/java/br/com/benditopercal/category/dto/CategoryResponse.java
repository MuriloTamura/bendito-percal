package br.com.benditopercal.category.dto;

import br.com.benditopercal.category.Category;
import java.time.Instant;

public record CategoryResponse(String id, String name, boolean active, Instant createdAt) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(), category.getName(), category.isActive(), category.getCreatedAt());
    }
}