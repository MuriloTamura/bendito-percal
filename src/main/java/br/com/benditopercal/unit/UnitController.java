package br.com.benditopercal.unit;

import br.com.benditopercal.unit.dto.UnitRequest;
import br.com.benditopercal.unit.dto.UnitResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Unidades de Medida", description = "Unidades usadas por produtos e matérias-primas (metro, rolo, kg, etc.)")
@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    private final UnitRepository repository;

    public UnitController(UnitRepository repository) {
        this.repository = repository;
    }

    @Operation(summary = "Cadastrar uma unidade de medida")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Unidade criada"),
            @ApiResponse(responseCode = "400", description = "Erro de validação (nome ou abreviação vazios)")
    })
    @PostMapping
    public ResponseEntity<UnitResponse> create(@Valid @RequestBody UnitRequest request) {
        Unit unit = repository.save(new Unit(request.name(), request.abbreviation()));
        return ResponseEntity.status(201).body(UnitResponse.from(unit));
    }

    @Operation(summary = "Listar unidades de medida")
    @GetMapping
    public List<UnitResponse> findAll() {
        return repository.findAll().stream().map(UnitResponse::from).toList();
    }
}