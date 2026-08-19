package br.com.benditopercal.sale;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(length = 150)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Sale() {}

    public Sale(String customerName) {
        this.customerName = customerName == null || customerName.isBlank() ? null : customerName.trim();
        this.status = SaleStatus.COMPLETED;
    }

    public void addItem(SaleItem item) {
        items.add(item);
        totalAmount = totalAmount.add(item.getSubtotal());
    }

    public String getId() { return id; }
    public String getCustomerName() { return customerName; }
    public SaleStatus getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public List<SaleItem> getItems() { return items; }
    public Instant getCreatedAt() { return createdAt; }
}
