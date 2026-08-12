package br.com.benditopercal.category;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {
    Optional<Category> findByNameIgnoreCase(String name);
}