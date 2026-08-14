package br.com.benditopercal.auth.dto;

import br.com.benditopercal.auth.User;
import br.com.benditopercal.auth.UserRole;

public record UserResponse(String id, String email, String name, UserRole role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}