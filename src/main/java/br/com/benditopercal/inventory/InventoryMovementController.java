package br.com.benditopercal.inventory;

import br.com.benditopercal.inventory.dto.InventoryMovementRequest;
import br.com.benditopercal.inventory.dto.InventoryMovementResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/movements")
public class InventoryMovementController {

    private final InventoryMovementService service;

    public InventoryMovementController(InventoryMovementService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InventoryMovementResponse> create(
            @Valid @RequestBody InventoryMovementRequest request) {
        InventoryMovement movement = service.create(request);
        return ResponseEntity.status(201).body(InventoryMovementResponse.from(movement));
    }

    @GetMapping
    public List<InventoryMovementResponse> findAll(
            @RequestParam(required = false) InventoryItemType itemType,
            @RequestParam(required = false) String itemId) {
        return service.findAll(itemType, itemId).stream()
                .map(InventoryMovementResponse::from)
                .toList();
    }
}
