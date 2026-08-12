package br.com.benditopercal.category;

import br.com.benditopercal.category.dto.CategoryRequest;
import br.com.benditopercal.category.dto.CategoryResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        Category category = service.create(request);
        return ResponseEntity.status(201).body(CategoryResponse.from(category));
    }

    @GetMapping
    public List<CategoryResponse> findAll() {
        return service.findAllActive().stream().map(CategoryResponse::from).toList();
    }

    @PutMapping("/{id}")
    public CategoryResponse rename(@PathVariable String id, @Valid @RequestBody CategoryRequest request) {
        return CategoryResponse.from(service.rename(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}