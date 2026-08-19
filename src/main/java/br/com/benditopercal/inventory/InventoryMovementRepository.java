package br.com.benditopercal.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, String> {

    List<InventoryMovement> findAllByOrderByCreatedAtDesc();

    List<InventoryMovement> findAllByItemTypeAndItemIdOrderByCreatedAtDesc(
            InventoryItemType itemType,
            String itemId
    );
}
