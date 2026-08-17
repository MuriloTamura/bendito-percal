package br.com.benditopercal.unit;

import jakarta.persistence.*;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true, length = 10)
    private String abbreviation;

    protected Unit() {}

    public Unit(String name, String abbreviation) {
        this.name = name;
        this.abbreviation = abbreviation;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getAbbreviation() { return abbreviation; }
}