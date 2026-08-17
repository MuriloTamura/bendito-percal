package br.com.benditopercal.unit;

import br.com.benditopercal.unit.dto.UnitRequest;
import br.com.benditopercal.unit.dto.UnitResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    private final UnitRepository repository;

    public UnitController(UnitRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<UnitResponse> create(@Valid @RequestBody UnitRequest request) {
        Unit unit = repository.save(new Unit(request.name(), request.abbreviation()));
        return ResponseEntity.status(201).body(UnitResponse.from(unit));
    }

    @GetMapping
    public List<UnitResponse> findAll() {
        return repository.findAll().stream().map(UnitResponse::from).toList();
    }
}