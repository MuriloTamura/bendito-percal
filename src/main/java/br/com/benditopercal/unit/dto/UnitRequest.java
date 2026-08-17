package br.com.benditopercal.unit.dto;

import jakarta.validation.constraints.NotBlank;

public record UnitRequest(@NotBlank String name, @NotBlank String abbreviation) {}