package br.com.benditopercal.production;

import br.com.benditopercal.rawmaterial.RawMaterial;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "production_order_items")
public class ProductionOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @ManyToOne(optional = false)
    @JoinColumn(name = "raw_material_id")
    private RawMaterial rawMaterial;

    @Column(name = "raw_material_name_snapshot", nullable = false)
    private String rawMaterialNameSnapshot;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityConsumed;

    protected ProductionOrderItem() {}

    public ProductionOrderItem(ProductionOrder productionOrder, RawMaterial rawMaterial, BigDecimal quantityConsumed) {
        this.productionOrder = productionOrder;
        this.rawMaterial = rawMaterial;
        this.rawMaterialNameSnapshot = rawMaterial.getName();
        this.quantityConsumed = quantityConsumed;
    }

    public String getId() { return id; }
    public RawMaterial getRawMaterial() { return rawMaterial; }
    public String getRawMaterialNameSnapshot() { return rawMaterialNameSnapshot; }
    public BigDecimal getQuantityConsumed() { return quantityConsumed; }
}