package br.com.benditopercal.product;

import br.com.benditopercal.category.Category;
import br.com.benditopercal.unit.Unit;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityInStock = BigDecimal.ZERO;

    @Column(precision = 12, scale = 3)
    private BigDecimal minimumStock;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Product() {}

    public Product(String name, Category category, Unit unit, BigDecimal salePrice, BigDecimal minimumStock) {
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.salePrice = salePrice;
        this.minimumStock = minimumStock;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public Category getCategory() { return category; }
    public Unit getUnit() { return unit; }
    public BigDecimal getSalePrice() { return salePrice; }
    public BigDecimal getQuantityInStock() { return quantityInStock; }
    public BigDecimal getMinimumStock() { return minimumStock; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void rename(String name) { this.name = name; }
    public void deactivate() { this.active = false; }
    public void updatePrice(BigDecimal newPrice) { this.salePrice = newPrice; }

    public void increaseStock(BigDecimal quantity) {
        this.quantityInStock = this.quantityInStock.add(quantity);
    }

    public void decreaseStock(BigDecimal quantity) {
        if (this.quantityInStock.compareTo(quantity) < 0) {
            throw new IllegalStateException("Estoque insuficiente de produto: " + this.name);
        }
        this.quantityInStock = this.quantityInStock.subtract(quantity);
    }
}