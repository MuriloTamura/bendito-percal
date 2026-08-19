package br.com.benditopercal.dashboard.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DashboardResponse(
        Instant generatedAt,
        String timezone,
        SalesSummary today,
        InventorySummary inventory,
        long productionsToday,
        List<DailySales> salesLastSevenDays,
        List<TopProduct> topProductsLastThirtyDays,
        List<RecentSale> recentSales,
        List<LowStockItem> lowStockItems
) {
    public record SalesSummary(long salesCount, BigDecimal revenue, BigDecimal itemsSold) {}

    public record InventorySummary(
            long activeProducts,
            long activeRawMaterials,
            long lowStockProducts,
            long lowStockRawMaterials
    ) {}

    public record DailySales(LocalDate date, long salesCount, BigDecimal revenue) {}

    public record TopProduct(
            String productId,
            String productName,
            BigDecimal quantitySold,
            BigDecimal revenue
    ) {}

    public record RecentSale(
            String id,
            String customerName,
            BigDecimal totalAmount,
            Instant createdAt
    ) {}

    public record LowStockItem(
            String itemType,
            String id,
            String name,
            BigDecimal quantityInStock,
            BigDecimal minimumStock,
            String unit
    ) {}
}
