package br.com.benditopercal.sale;

import br.com.benditopercal.sale.dto.SaleRequest;
import br.com.benditopercal.sale.dto.SaleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Vendas", description = "Registro de vendas de produtos, com baixa automática de estoque")
@RestController
@RequestMapping("/api/v1/sales")
public class SaleController {

    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    @Operation(
            summary = "Registrar uma venda",
            description = """
                    Registra uma venda de um ou mais produtos e dá baixa automática no estoque.
                    O preço unitário é congelado no momento da venda (mudanças futuras no preço \
                    do produto não afetam vendas já registradas). A operação é atômica: se \
                    qualquer item falhar (produto não encontrado, inativo, ou sem estoque \
                    suficiente), nenhum item da venda é processado."""
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Venda registrada com sucesso"),
            @ApiResponse(
                    responseCode = "422",
                    description = "Regra de negócio violada: produto não encontrado, inativo, "
                            + "estoque insuficiente, ou produto repetido na mesma venda",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(value = """
                                    {
                                      "timestamp": "2026-08-19T21:12:26Z",
                                      "message": "Estoque insuficiente de produto: Lençol Casal Branco"
                                    }"""))
            ),
            @ApiResponse(responseCode = "400", description = "Erro de validação (campo obrigatório ausente, formato inválido)"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    @PostMapping
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody SaleRequest request) {
        Sale sale = service.create(request);
        return ResponseEntity.status(201).body(SaleResponse.from(sale));
    }

    @Operation(summary = "Listar todas as vendas", description = "Retorna as vendas ordenadas da mais recente para a mais antiga.")
    @GetMapping
    public List<SaleResponse> findAll() {
        return service.findAll().stream().map(SaleResponse::from).toList();
    }

    @Operation(summary = "Buscar venda por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venda encontrada"),
            @ApiResponse(responseCode = "422", description = "Venda não encontrada")
    })
    @GetMapping("/{id}")
    public SaleResponse findById(@PathVariable String id) {
        return SaleResponse.from(service.findById(id));
    }
}