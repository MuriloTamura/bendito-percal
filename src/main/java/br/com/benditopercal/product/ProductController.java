package br.com.benditopercal.product;

import br.com.benditopercal.product.dto.ProductRequest;
import br.com.benditopercal.product.dto.ProductResponse;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "Produtos", description = "Itens de enxoval prontos para venda")
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @Operation(summary = "Cadastrar um produto", description = "Cria um novo produto com estoque inicial zerado. Use produção ou movimentação de estoque para dar entrada.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Produto criado"),
            @ApiResponse(responseCode = "422", description = "Categoria ou unidade não encontrada"),
            @ApiResponse(responseCode = "400", description = "Erro de validação (nome vazio, preço zero ou negativo)")
    })
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        Product product = service.create(request);
        return ResponseEntity.status(201).body(ProductResponse.from(product));
    }

    @Operation(summary = "Listar produtos ativos")
    @GetMapping
    public List<ProductResponse> findAll() {
        return service.findAllActive().stream().map(ProductResponse::from).toList();
    }

    @Operation(
            summary = "Atualizar preço de venda",
            description = "Atualiza somente o preço de venda do produto. Vendas já registradas mantêm o preço praticado na época (não são afetadas)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Preço atualizado"),
            @ApiResponse(
                    responseCode = "422",
                    description = "Produto não encontrado",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            examples = @ExampleObject(value = """
                                    {
                                      "timestamp": "2026-08-19T21:12:26Z",
                                      "message": "Produto não encontrado."
                                    }"""))
            )
    })
    @PatchMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        service.updatePrice(id, body.get("salePrice"));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Desativar produto", description = "Desativação lógica — o produto deixa de aparecer nas listagens ativas, mas o histórico de vendas e movimentações é preservado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Produto desativado"),
            @ApiResponse(responseCode = "422", description = "Produto não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}