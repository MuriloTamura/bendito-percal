package br.com.benditopercal.production;

import br.com.benditopercal.production.dto.ProductionOrderRequest;
import br.com.benditopercal.production.dto.ProductionOrderResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/production-orders")
public class ProductionOrderController {

    private final ProductionOrderService service;

    public ProductionOrderController(ProductionOrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductionOrderResponse> create(@Valid @RequestBody ProductionOrderRequest request) {
        ProductionOrder order = service.create(request);
        return ResponseEntity.status(201).body(ProductionOrderResponse.from(order));
    }
}