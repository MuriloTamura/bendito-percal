package br.com.benditopercal.rawmaterial;

import br.com.benditopercal.rawmaterial.dto.RawMaterialRequest;
import br.com.benditopercal.rawmaterial.dto.RawMaterialResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Matérias-primas", description = "Insumos usados na produção de itens de enxoval")
@RestController
@RequestMapping("/api/v1/raw-materials")
public class RawMaterialController {

    private final RawMaterialService service;

    public RawMaterialController(RawMaterialService service) {
        this.service = service;
    }

    @Operation(summary = "Cadastrar uma matéria-prima", description = "Cria um novo insumo com estoque inicial zerado. Use movimentação de estoque para dar entrada.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Matéria-prima criada"),
            @ApiResponse(responseCode = "422", description = "Categoria ou unidade não encontrada"),
            @ApiResponse(responseCode = "400", description = "Erro de validação (nome vazio, quantidade mínima negativa)")
    })
    @PostMapping
    public ResponseEntity<RawMaterialResponse> create(@Valid @RequestBody RawMaterialRequest request) {
        RawMaterial rawMaterial = service.create(request);
        return ResponseEntity.status(201).body(RawMaterialResponse.from(rawMaterial));
    }

    @Operation(summary = "Listar matérias-primas ativas")
    @GetMapping
    public List<RawMaterialResponse> findAll() {
        return service.findAllActive().stream().map(RawMaterialResponse::from).toList();
    }

    @Operation(summary = "Desativar matéria-prima", description = "Desativação lógica — deixa de aparecer nas listagens ativas e nas opções disponíveis para produção, mas o histórico é preservado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Matéria-prima desativada"),
            @ApiResponse(responseCode = "422", description = "Matéria-prima não encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}