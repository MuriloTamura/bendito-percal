package br.com.benditopercal.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {

    long countByActiveTrue();

    @Query("""
            select count(p) from Product p
            where p.active = true
              and p.minimumStock is not null
              and p.quantityInStock <= p.minimumStock
            """)
    long countActiveWithLowStock();

    @Query("""
            select p from Product p
            where p.active = true
              and p.minimumStock is not null
              and p.quantityInStock <= p.minimumStock
            order by p.quantityInStock asc, p.name asc
            """)
    List<Product> findActiveWithLowStock(Pageable pageable);
}
