package br.com.benditopercal.inventory;

import br.com.benditopercal.inventory.dto.InventoryMovementRequest;
import br.com.benditopercal.inventory.dto.InventoryMovementResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Movimentações de Estoque", description = "Entradas e saídas manuais de estoque (produto ou matéria-prima), além do histórico gerado automaticamente por vendas e produções")
@RestController
@RequestMapping("/api/v1/inventory/movements")
public class InventoryMovementController {

    private final InventoryMovementService service;

    public InventoryMovementController(InventoryMovementService service) {
        this.service = service;
    }

    @Operation(
            summary = "Registrar movimentação manual de estoque",
            description = """
                    Registra uma entrada ou saída manual de estoque para um produto ou matéria-prima \
                    (ex: compra de insumo, perda, quebra, ajuste de inventário). Vendas e produções \
                    já geram suas próprias movimentações automaticamente — este endpoint é para \
                    ajustes que não se encaixam nesses fluxos."""
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Movimentação registrada, estoque atualizado"),
            @ApiResponse(
                    responseCode = "422",
                    description = "Item não encontrado, item inativo, ou saldo insuficiente para uma saída",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(value = """
                                    {
                                      "timestamp": "2026-08-19T21:12:26Z",
                                      "message": "Estoque insuficiente de matéria-prima: Tecido Azul"
                                    }"""))
            ),
            @ApiResponse(responseCode = "400", description = "Erro de validação (quantidade zero ou negativa)")
    })
    @PostMapping
    public ResponseEntity<InventoryMovementResponse> create(
            @Valid @RequestBody InventoryMovementRequest request) {
        InventoryMovement movement = service.create(request);
        return ResponseEntity.status(201).body(InventoryMovementResponse.from(movement));
    }

    @Operation(
            summary = "Listar movimentações",
            description = "Sem filtros, retorna todo o histórico (mais recente primeiro). Informando itemType e itemId juntos, filtra o histórico de um item específico."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de movimentações"),
            @ApiResponse(responseCode = "422", description = "Informado apenas um dos dois filtros (itemType e itemId devem vir juntos)")
    })
    @GetMapping
    public List<InventoryMovementResponse> findAll(
            @Parameter(description = "Tipo do item a filtrar (deve vir junto com itemId)")
            @RequestParam(required = false) InventoryItemType itemType,
            @Parameter(description = "ID do item a filtrar (deve vir junto com itemType)")
            @RequestParam(required = false) String itemId) {
        return service.findAll(itemType, itemId).stream()
                .map(InventoryMovementResponse::from)
                .toList();
    }
}