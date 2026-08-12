package br.com.benditopercal.category;

import br.com.benditopercal.category.dto.CategoryRequest;
import br.com.benditopercal.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Category create(CategoryRequest request) {
        repository.findByNameIgnoreCase(request.name()).ifPresent(c -> {
            throw new BusinessException("Já existe uma categoria com esse nome.");
        });
        return repository.save(new Category(request.name()));
    }

    public List<Category> findAllActive() {
        return repository.findAll().stream().filter(Category::isActive).toList();
    }

    @Transactional
    public Category rename(String id, CategoryRequest request) {
        Category category = findByIdOrThrow(id);
        category.rename(request.name());
        return category;
    }

    @Transactional
    public void deactivate(String id) {
        Category category = findByIdOrThrow(id);
        category.deactivate();
    }

    private Category findByIdOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Categoria não encontrada."));
    }
}