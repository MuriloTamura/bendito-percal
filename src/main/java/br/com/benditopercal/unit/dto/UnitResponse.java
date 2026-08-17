package br.com.benditopercal.unit.dto;

import br.com.benditopercal.unit.Unit;

public record UnitResponse(String id, String name, String abbreviation) {
    public static UnitResponse from(Unit unit) {
        return new UnitResponse(unit.getId(), unit.getName(), unit.getAbbreviation());
    }
}