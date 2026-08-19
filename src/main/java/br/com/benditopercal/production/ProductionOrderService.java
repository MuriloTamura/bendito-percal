package br.com.benditopercal.production;

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

@Service
public class ProductionOrderService {

    private final ProductionOrderRepository repository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;

    public ProductionOrderService(ProductionOrderRepository repository,
                                  ProductRepository productRepository,
                                  RawMaterialRepository rawMaterialRepository,
                                  ProductService productService,
                                  RawMaterialService rawMaterialService) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productService = productService;
        this.rawMaterialService = rawMaterialService;
    }

    @Transactional
    public ProductionOrder create(ProductionOrderRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException("Produto não encontrado."));

        ProductionOrder order = new ProductionOrder(product, request.quantityProduced());

        for (ProductionOrderItemRequest itemRequest : request.items()) {
            RawMaterial rawMaterial = rawMaterialRepository.findById(itemRequest.rawMaterialId())
                    .orElseThrow(() -> new BusinessException("Matéria-prima não encontrada: " + itemRequest.rawMaterialId()));

            // dá baixa na matéria-prima agora — se não tiver estoque, lança BusinessException
            // e a transação inteira sofre rollback (nada é salvo, nenhum outro item é descontado)
            rawMaterialService.decreaseStock(rawMaterial.getId(), itemRequest.quantityConsumed());

            order.addItem(new ProductionOrderItem(order, rawMaterial, itemRequest.quantityConsumed()));
        }

        productService.increaseStock(product.getId(), request.quantityProduced());

        return repository.save(order);
    }
}