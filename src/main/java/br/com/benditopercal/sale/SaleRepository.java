package br.com.benditopercal.sale;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, String> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Sale> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Sale> findById(String id);
}
