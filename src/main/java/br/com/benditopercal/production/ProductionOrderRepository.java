package br.com.benditopercal.production;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, String> {

    @EntityGraph(attributePaths = {"product", "items", "items.rawMaterial"})
    List<ProductionOrder> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"product", "items", "items.rawMaterial"})
    Optional<ProductionOrder> findById(String id);
}
