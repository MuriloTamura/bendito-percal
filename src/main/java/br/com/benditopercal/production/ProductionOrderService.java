package br.com.benditopercal.production;

import br.com.benditopercal.inventory.InventoryItemType;
import br.com.benditopercal.inventory.InventoryMovement;
import br.com.benditopercal.inventory.InventoryMovementRepository;
import br.com.benditopercal.inventory.InventoryMovementType;
import br.com.benditopercal.product.Product;
import br.com.benditopercal.product.ProductRepository;
import br.com.benditopercal.product.ProductService;
import br.com.benditopercal.production.dto.ProductionOrderItemRequest;
import br.com.benditopercal.production.dto.ProductionOrderRequest;
import br.com.benditopercal.rawmaterial.RawMaterial;
import br.com.benditopercal.rawmaterial.RawMaterialRepository;
import br.com.benditopercal.rawmaterial.RawMaterialService;
import br.com.benditopercal.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductionOrderService {

    private final ProductionOrderRepository repository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;
    private final InventoryMovementRepository inventoryMovementRepository;

    public ProductionOrderService(ProductionOrderRepository repository,
                                  ProductRepository productRepository,
                                  RawMaterialRepository rawMaterialRepository,
                                  ProductService productService,
                                  RawMaterialService rawMaterialService,
                                  InventoryMovementRepository inventoryMovementRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productService = productService;
        this.rawMaterialService = rawMaterialService;
        this.inventoryMovementRepository = inventoryMovementRepository;
    }

    @Transactional
    public ProductionOrder create(ProductionOrderRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException("Produto não encontrado."));

        ProductionOrder order = new ProductionOrder(product, request.quantityProduced());
        List<RawMaterial> consumedMaterials = new ArrayList<>();

        for (ProductionOrderItemRequest itemRequest : request.items()) {
            RawMaterial rawMaterial = rawMaterialRepository.findById(itemRequest.rawMaterialId())
                    .orElseThrow(() -> new BusinessException("Matéria-prima não encontrada: " + itemRequest.rawMaterialId()));

            rawMaterialService.decreaseStock(rawMaterial.getId(), itemRequest.quantityConsumed());

            order.addItem(new ProductionOrderItem(order, rawMaterial, itemRequest.quantityConsumed()));
            consumedMaterials.add(rawMaterial);
        }

        productService.increaseStock(product.getId(), request.quantityProduced());

        ProductionOrder savedOrder = repository.save(order);
        registerInventoryMovements(savedOrder, consumedMaterials);
        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<ProductionOrder> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public ProductionOrder findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new BusinessException("Ordem de produção não encontrada."));
    }

    private void registerInventoryMovements(ProductionOrder order, List<RawMaterial> consumedMaterials) {
        List<InventoryMovement> movements = new ArrayList<>();

        for (int i = 0; i < order.getItems().size(); i++) {
            ProductionOrderItem item = order.getItems().get(i);
            RawMaterial rawMaterial = consumedMaterials.get(i);

            movements.add(new InventoryMovement(
                    InventoryItemType.RAW_MATERIAL,
                    rawMaterial.getId(),
                    item.getRawMaterialNameSnapshot(),
                    InventoryMovementType.EXIT,
                    item.getQuantityConsumed(),
                    "Produção " + order.getId(),
                    rawMaterial.getQuantityInStock()
            ));
        }

        movements.add(new InventoryMovement(
                InventoryItemType.PRODUCT,
                order.getProduct().getId(),
                order.getProductNameSnapshot(),
                InventoryMovementType.ENTRY,
                order.getQuantityProduced(),
                "Produção " + order.getId(),
                order.getProduct().getQuantityInStock()
        ));

        inventoryMovementRepository.saveAll(movements);
    }
}