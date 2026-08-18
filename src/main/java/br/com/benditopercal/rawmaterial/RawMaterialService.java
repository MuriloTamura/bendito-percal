package br.com.benditopercal.rawmaterial;

import br.com.benditopercal.category.Category;
import br.com.benditopercal.category.CategoryRepository;
import br.com.benditopercal.rawmaterial.dto.RawMaterialRequest;
import br.com.benditopercal.shared.exception.BusinessException;
import br.com.benditopercal.unit.Unit;
import br.com.benditopercal.unit.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RawMaterialService {

    private final RawMaterialRepository repository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;

    public RawMaterialService(RawMaterialRepository repository,
                              CategoryRepository categoryRepository,
                              UnitRepository unitRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional
    public RawMaterial create(RawMaterialRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException("Categoria não encontrada."));
        Unit unit = unitRepository.findById(request.unitId())
                .orElseThrow(() -> new BusinessException("Unidade não encontrada."));

        return repository.save(new RawMaterial(request.name(), category, unit, request.minimumStock()));
    }

    public List<RawMaterial> findAllActive() {
        return repository.findAll().stream().filter(RawMaterial::isActive).toList();
    }

    @Transactional
    public void deactivate(String id) {
        findByIdOrThrow(id).deactivate();
    }

    @Transactional
    public void increaseStock(String id, BigDecimal quantity) {
        findByIdOrThrow(id).increaseStock(quantity);
    }

    @Transactional
    public void decreaseStock(String id, BigDecimal quantity) {
        try {
            findByIdOrThrow(id).decreaseStock(quantity);
        } catch (IllegalStateException e) {
            throw new BusinessException(e.getMessage());
        }
    }

    private RawMaterial findByIdOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Matéria-prima não encontrada."));
    }
}