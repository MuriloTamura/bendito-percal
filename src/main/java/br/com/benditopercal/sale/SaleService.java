package br.com.benditopercal.sale;

import br.com.benditopercal.inventory.InventoryItemType;
import br.com.benditopercal.inventory.InventoryMovement;
import br.com.benditopercal.inventory.InventoryMovementRepository;
import br.com.benditopercal.inventory.InventoryMovementType;
import br.com.benditopercal.product.Product;
import br.com.benditopercal.product.ProductRepository;
import br.com.benditopercal.sale.dto.SaleItemRequest;
import br.com.benditopercal.sale.dto.SaleRequest;
import br.com.benditopercal.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SaleService {

    private final SaleRepository repository;
    private final ProductRepository productRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    public SaleService(SaleRepository repository,
                       ProductRepository productRepository,
                       InventoryMovementRepository inventoryMovementRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
    }

    @Transactional
    public Sale create(SaleRequest request) {
        ensureProductsAreUnique(request.items());
        Sale sale = new Sale(request.customerName());

        try {
            for (SaleItemRequest itemRequest : request.items()) {
                Product product = productRepository.findById(itemRequest.productId())
                        .orElseThrow(() -> new BusinessException(
                                "Produto não encontrado: " + itemRequest.productId()));

                if (!product.isActive()) {
                    throw new BusinessException("Produto inativo não pode ser vendido: " + product.getName());
                }

                product.decreaseStock(itemRequest.quantity());
                sale.addItem(new SaleItem(sale, product, itemRequest.quantity()));
            }
        } catch (IllegalStateException exception) {
            throw new BusinessException(exception.getMessage());
        }

        Sale savedSale = repository.save(sale);
        registerInventoryMovements(savedSale);
        return savedSale;
    }

    @Transactional(readOnly = true)
    public List<Sale> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Sale findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Venda não encontrada."));
    }

    private void ensureProductsAreUnique(List<SaleItemRequest> items) {
        Set<String> productIds = new HashSet<>();
        boolean hasDuplicate = items.stream().anyMatch(item -> !productIds.add(item.productId()));
        if (hasDuplicate) {
            throw new BusinessException("Cada produto deve aparecer apenas uma vez na venda.");
        }
    }

    private void registerInventoryMovements(Sale sale) {
        List<InventoryMovement> movements = sale.getItems().stream()
                .map(item -> new InventoryMovement(
                        InventoryItemType.PRODUCT,
                        item.getProduct().getId(),
                        item.getProductNameSnapshot(),
                        InventoryMovementType.EXIT,
                        item.getQuantity(),
                        "Venda " + sale.getId(),
                        item.getProduct().getQuantityInStock()
                ))
                .toList();

        inventoryMovementRepository.saveAll(movements);
    }
}
