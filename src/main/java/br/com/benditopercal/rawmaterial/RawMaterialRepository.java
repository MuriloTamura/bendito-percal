package br.com.benditopercal.rawmaterial;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, String> {

    long countByActiveTrue();

    @Query("""
            select count(r) from RawMaterial r
            where r.active = true
              and r.minimumStock is not null
              and r.quantityInStock <= r.minimumStock
            """)
    long countActiveWithLowStock();

    @Query("""
            select r from RawMaterial r
            where r.active = true
              and r.minimumStock is not null
              and r.quantityInStock <= r.minimumStock
            order by r.quantityInStock asc, r.name asc
            """)
    List<RawMaterial> findActiveWithLowStock(Pageable pageable);
}
