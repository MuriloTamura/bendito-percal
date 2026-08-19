package br.com.benditopercal.product;

import br.com.benditopercal.product.dto.ProductRequest;
import br.com.benditopercal.product.dto.ProductResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Product product = service.create(request);
        return ResponseEntity.status(201).body(ProductResponse.from(product));
    }

    @GetMapping
    public List<ProductResponse> findAll() {
        return service.findAllActive().stream().map(ProductResponse::from).toList();
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        service.updatePrice(id, body.get("salePrice"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}