package br.com.benditopercal.sale;

import br.com.benditopercal.sale.dto.SaleRequest;
import br.com.benditopercal.sale.dto.SaleResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {

    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody SaleRequest request) {
        Sale sale = service.create(request);
        return ResponseEntity.status(201).body(SaleResponse.from(sale));
    }

    @GetMapping
    public List<SaleResponse> findAll() {
        return service.findAll().stream().map(SaleResponse::from).toList();
    }

    @GetMapping("/{id}")
    public SaleResponse findById(@PathVariable String id) {
        return SaleResponse.from(service.findById(id));
    }
}
