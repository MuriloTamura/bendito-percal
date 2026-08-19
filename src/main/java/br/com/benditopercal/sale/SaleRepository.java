package br.com.benditopercal.sale;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleRepository extends JpaRepository<Sale, String> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Sale> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Sale> findById(String id);

    @Query("""
            select s from Sale s
            where s.createdAt >= :start and s.createdAt < :end
            order by s.createdAt desc
            """)
    List<Sale> findRecentBetween(@Param("start") Instant start,
                                 @Param("end") Instant end,
                                 Pageable pageable);

    @Query("""
            select count(s), coalesce(sum(s.totalAmount), 0)
            from Sale s
            where s.createdAt >= :start and s.createdAt < :end
            """)
    Object[] summarizeBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("""
            select coalesce(sum(i.quantity), 0)
            from SaleItem i
            where i.sale.createdAt >= :start and i.sale.createdAt < :end
            """)
    java.math.BigDecimal sumItemsQuantityBetween(@Param("start") Instant start,
                                                  @Param("end") Instant end);

    @Query("""
            select i.product.id, i.productNameSnapshot, sum(i.quantity), sum(i.subtotal)
            from SaleItem i
            where i.sale.createdAt >= :start and i.sale.createdAt < :end
            group by i.product.id, i.productNameSnapshot
            order by sum(i.quantity) desc
            """)
    List<Object[]> findTopProductsBetween(@Param("start") Instant start,
                                          @Param("end") Instant end,
                                          Pageable pageable);
}
