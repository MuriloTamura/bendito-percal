package br.com.benditopercal.production;

import br.com.benditopercal.product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_orders")
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityProduced;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductionStatus status;

    @OneToMany(mappedBy = "productionOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductionOrderItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ProductionOrder() {}

    public ProductionOrder(Product product, BigDecimal quantityProduced) {
        this.product = product;
        this.productNameSnapshot = product.getName();
        this.quantityProduced = quantityProduced;
        this.status = ProductionStatus.COMPLETED;
    }

    public void addItem(ProductionOrderItem item) {
        this.items.add(item);
    }

    public String getId() { return id; }
    public Product getProduct() { return product; }
    public String getProductNameSnapshot() { return productNameSnapshot; }
    public BigDecimal getQuantityProduced() { return quantityProduced; }
    public ProductionStatus getStatus() { return status; }
    public List<ProductionOrderItem> getItems() { return items; }
    public Instant getCreatedAt() { return createdAt; }
}