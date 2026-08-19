package br.com.benditopercal.category;

import br.com.benditopercal.category.dto.CategoryRequest;
import br.com.benditopercal.category.dto.CategoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Categorias", description = "Categorias compartilhadas entre produtos e matérias-primas")
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @Operation(summary = "Cadastrar uma categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada"),
            @ApiResponse(responseCode = "422", description = "Já existe uma categoria com esse nome"),
            @ApiResponse(responseCode = "400", description = "Erro de validação (nome vazio)")
    })
    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        Category category = service.create(request);
        return ResponseEntity.status(201).body(CategoryResponse.from(category));
    }

    @Operation(summary = "Listar categorias ativas")
    @GetMapping
    public List<CategoryResponse> findAll() {
        return service.findAllActive().stream().map(CategoryResponse::from).toList();
    }

    @Operation(summary = "Renomear categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria renomeada"),
            @ApiResponse(responseCode = "422", description = "Categoria não encontrada")
    })
    @PutMapping("/{id}")
    public CategoryResponse rename(@PathVariable String id, @Valid @RequestBody CategoryRequest request) {
        return CategoryResponse.from(service.rename(id, request));
    }

    @Operation(summary = "Desativar categoria", description = "Desativação lógica — produtos e matérias-primas já cadastrados nessa categoria não são afetados.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria desativada"),
            @ApiResponse(responseCode = "422", description = "Categoria não encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}