package br.com.benditopercal.inventory;

import br.com.benditopercal.inventory.dto.InventoryMovementRequest;
import br.com.benditopercal.product.Product;
import br.com.benditopercal.product.ProductRepository;
import br.com.benditopercal.rawmaterial.RawMaterial;
import br.com.benditopercal.rawmaterial.RawMaterialRepository;
import br.com.benditopercal.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryMovementService {

    private final InventoryMovementRepository repository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public InventoryMovementService(InventoryMovementRepository repository,
                                    ProductRepository productRepository,
                                    RawMaterialRepository rawMaterialRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    @Transactional
    public InventoryMovement create(InventoryMovementRequest request) {
        try {
            return switch (request.itemType()) {
                case PRODUCT -> moveProduct(request);
                case RAW_MATERIAL -> moveRawMaterial(request);
            };
        } catch (IllegalStateException exception) {
            throw new BusinessException(exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<InventoryMovement> findAll(InventoryItemType itemType, String itemId) {
        if ((itemType == null) != (itemId == null || itemId.isBlank())) {
            throw new BusinessException("Informe itemType e itemId juntos para filtrar as movimentações.");
        }

        if (itemType == null) {
            return repository.findAllByOrderByCreatedAtDesc();
        }

        return repository.findAllByItemTypeAndItemIdOrderByCreatedAtDesc(itemType, itemId);
    }

    private InventoryMovement moveProduct(InventoryMovementRequest request) {
        Product product = productRepository.findById(request.itemId())
                .orElseThrow(() -> new BusinessException("Produto não encontrado."));

        ensureActive(product.isActive(), "Produto inativo não pode ter o estoque movimentado.");
        applyMovement(request.movementType(), request.quantity(), product::increaseStock, product::decreaseStock);

        return saveMovement(request, product.getName(), product.getQuantityInStock());
    }

    private InventoryMovement moveRawMaterial(InventoryMovementRequest request) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(request.itemId())
                .orElseThrow(() -> new BusinessException("Matéria-prima não encontrada."));

        ensureActive(rawMaterial.isActive(), "Matéria-prima inativa não pode ter o estoque movimentado.");
        applyMovement(request.movementType(), request.quantity(), rawMaterial::increaseStock, rawMaterial::decreaseStock);

        return saveMovement(request, rawMaterial.getName(), rawMaterial.getQuantityInStock());
    }

    private void applyMovement(InventoryMovementType movementType,
                               BigDecimal quantity,
                               StockOperation entry,
                               StockOperation exit) {
        if (movementType == InventoryMovementType.ENTRY) {
            entry.apply(quantity);
        } else {
            exit.apply(quantity);
        }
    }

    private InventoryMovement saveMovement(InventoryMovementRequest request,
                                            String itemName,
                                            BigDecimal balanceAfterMovement) {
        return repository.save(new InventoryMovement(
                request.itemType(),
                request.itemId(),
                itemName,
                request.movementType(),
                request.quantity(),
                request.reason(),
                balanceAfterMovement
        ));
    }

    private void ensureActive(boolean active, String message) {
        if (!active) {
            throw new BusinessException(message);
        }
    }

    @FunctionalInterface
    private interface StockOperation {
        void apply(BigDecimal quantity);
    }
}
