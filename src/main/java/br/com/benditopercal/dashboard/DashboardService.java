package br.com.benditopercal.dashboard;

import br.com.benditopercal.dashboard.dto.DashboardResponse;
import br.com.benditopercal.product.ProductRepository;
import br.com.benditopercal.production.ProductionOrderRepository;
import br.com.benditopercal.rawmaterial.RawMaterialRepository;
import br.com.benditopercal.sale.SaleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final Clock clock;
    private final ZoneId zoneId;

    public DashboardService(SaleRepository saleRepository,
                            ProductRepository productRepository,
                            RawMaterialRepository rawMaterialRepository,
                            ProductionOrderRepository productionOrderRepository,
                            Clock clock,
                            @Value("${app.dashboard.timezone:America/Fortaleza}") String timezone) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productionOrderRepository = productionOrderRepository;
        this.clock = clock;
        this.zoneId = ZoneId.of(timezone);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        Instant now = clock.instant();
        LocalDate today = LocalDate.ofInstant(now, zoneId);
        Instant todayStart = today.atStartOfDay(zoneId).toInstant();
        Instant tomorrowStart = today.plusDays(1).atStartOfDay(zoneId).toInstant();
        Instant thirtyDaysStart = today.minusDays(29).atStartOfDay(zoneId).toInstant();

        Object[] todaySummary = unwrapSummary(saleRepository.summarizeBetween(todayStart, tomorrowStart));
        var salesSummary = new DashboardResponse.SalesSummary(
                ((Number) todaySummary[0]).longValue(),
                decimal(todaySummary[1]),
                decimal(saleRepository.sumItemsQuantityBetween(todayStart, tomorrowStart))
        );

        var inventorySummary = new DashboardResponse.InventorySummary(
                productRepository.countByActiveTrue(),
                rawMaterialRepository.countByActiveTrue(),
                productRepository.countActiveWithLowStock(),
                rawMaterialRepository.countActiveWithLowStock()
        );

        return new DashboardResponse(
                now,
                zoneId.getId(),
                salesSummary,
                inventorySummary,
                productionOrderRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(todayStart, tomorrowStart),
                dailySales(today),
                topProducts(thirtyDaysStart, tomorrowStart),
                recentSales(thirtyDaysStart, tomorrowStart),
                lowStockItems()
        );
    }

    private List<DashboardResponse.DailySales> dailySales(LocalDate today) {
        List<DashboardResponse.DailySales> result = new ArrayList<>();
        for (int daysAgo = 6; daysAgo >= 0; daysAgo--) {
            LocalDate date = today.minusDays(daysAgo);
            Instant start = date.atStartOfDay(zoneId).toInstant();
            Instant end = date.plusDays(1).atStartOfDay(zoneId).toInstant();
            Object[] summary = unwrapSummary(saleRepository.summarizeBetween(start, end));
            result.add(new DashboardResponse.DailySales(
                    date,
                    ((Number) summary[0]).longValue(),
                    decimal(summary[1])
            ));
        }
        return result;
    }

    private List<DashboardResponse.TopProduct> topProducts(Instant start, Instant end) {
        return saleRepository.findTopProductsBetween(start, end, PageRequest.of(0, 5)).stream()
                .map(row -> new DashboardResponse.TopProduct(
                        (String) row[0],
                        (String) row[1],
                        decimal(row[2]),
                        decimal(row[3])
                ))
                .toList();
    }

    private List<DashboardResponse.RecentSale> recentSales(Instant start, Instant end) {
        return saleRepository.findRecentBetween(start, end, PageRequest.of(0, 5)).stream()
                .map(sale -> new DashboardResponse.RecentSale(
                        sale.getId(), sale.getCustomerName(), sale.getTotalAmount(), sale.getCreatedAt()))
                .toList();
    }

    private List<DashboardResponse.LowStockItem> lowStockItems() {
        List<DashboardResponse.LowStockItem> result = new ArrayList<>();
        productRepository.findActiveWithLowStock(PageRequest.of(0, 5)).forEach(product -> result.add(
                new DashboardResponse.LowStockItem("PRODUCT", product.getId(), product.getName(),
                        product.getQuantityInStock(), product.getMinimumStock(), product.getUnit().getAbbreviation())
        ));
        rawMaterialRepository.findActiveWithLowStock(PageRequest.of(0, 5)).forEach(material -> result.add(
                new DashboardResponse.LowStockItem("RAW_MATERIAL", material.getId(), material.getName(),
                        material.getQuantityInStock(), material.getMinimumStock(), material.getUnit().getAbbreviation())
        ));
        return result;
    }

    private Object[] unwrapSummary(Object[] result) {
        if (result.length == 1 && result[0] instanceof Object[] nested) {
            return nested;
        }
        return result;
    }

    private BigDecimal decimal(Object value) {
        return value == null ? BigDecimal.ZERO : (BigDecimal) value;
    }
}
