package br.com.benditopercal.production;

import br.com.benditopercal.production.dto.ProductionOrderRequest;
import br.com.benditopercal.production.dto.ProductionOrderResponse;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "Produção", description = "Transformação de matéria-prima em produto acabado")
@RestController
@RequestMapping("/api/v1/production-orders")
public class ProductionOrderController {

    private final ProductionOrderService service;

    public ProductionOrderController(ProductionOrderService service) {
        this.service = service;
    }

    @Operation(
            summary = "Registrar uma produção",
            description = """
                    Registra a transformação de uma ou mais matérias-primas em um produto acabado. \
                    A operação é atômica e consumada no ato: dá baixa em cada matéria-prima \
                    informada e dá alta no produto resultante, gerando as movimentações de \
                    estoque correspondentes. Se qualquer matéria-prima não tiver saldo suficiente, \
                    a produção inteira é cancelada e nenhum estoque é alterado (rollback)."""
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Produção registrada, estoques atualizados"),
            @ApiResponse(
                    responseCode = "422",
                    description = "Produto ou matéria-prima não encontrados, ou estoque de "
                            + "matéria-prima insuficiente para a quantidade solicitada",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(value = """
                                    {
                                      "timestamp": "2026-08-19T21:12:26Z",
                                      "message": "Estoque insuficiente de matéria-prima: Tecido Azul"
                                    }"""))
            ),
            @ApiResponse(responseCode = "400", description = "Erro de validação (lista de itens vazia, quantidade zero ou negativa)"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    @PostMapping
    public ResponseEntity<ProductionOrderResponse> create(@Valid @RequestBody ProductionOrderRequest request) {
        ProductionOrder order = service.create(request);
        return ResponseEntity.status(201).body(ProductionOrderResponse.from(order));
    }

    @Operation(summary = "Listar todas as produções", description = "Retorna as ordens de produção ordenadas da mais recente para a mais antiga.")
    @GetMapping
    public List<ProductionOrderResponse> findAll() {
        return service.findAll().stream().map(ProductionOrderResponse::from).toList();
    }

    @Operation(summary = "Buscar produção por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produção encontrada"),
            @ApiResponse(responseCode = "422", description = "Produção não encontrada")
    })
    @GetMapping("/{id}")
    public ProductionOrderResponse findById(@PathVariable String id) {
        return ProductionOrderResponse.from(service.findById(id));
    }
}