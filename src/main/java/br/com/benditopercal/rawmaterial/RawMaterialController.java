package br.com.benditopercal.rawmaterial;

import br.com.benditopercal.rawmaterial.dto.RawMaterialRequest;
import br.com.benditopercal.rawmaterial.dto.RawMaterialResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/raw-materials")
public class RawMaterialController {

    private final RawMaterialService service;

    public RawMaterialController(RawMaterialService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RawMaterialResponse> create(@Valid @RequestBody RawMaterialRequest request) {
        RawMaterial rawMaterial = service.create(request);
        return ResponseEntity.status(201).body(RawMaterialResponse.from(rawMaterial));
    }

    @GetMapping
    public List<RawMaterialResponse> findAll() {
        return service.findAllActive().stream().map(RawMaterialResponse::from).toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}