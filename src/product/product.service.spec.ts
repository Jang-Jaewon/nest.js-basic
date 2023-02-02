import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDTO } from './dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { DeleteResult } from 'typeorm';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, ProductRepository],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  // it('should be 4', () => {
  //   expect(2 + 2).toEqual(4);
  // });

  describe('ProductService', () => {
    const ProductId = 1;
    const createProductDto: CreateProductDTO = {
      name: '아이폰 12 케이스',
      description: '엘라고 아이폰 12 가족 케이스',
      price: '480000',
    };

    // 상품 생성 Unit Test
    describe('createProduct', () => {
      it('상품을 생성하고, 생성한 상품을 반환한다.', async () => {
        const createProduct = new Product();
        Object.assign(createProduct, {
          ...createProductDto,
        });
        const productRepositoryCreateSpy = jest
          .spyOn(productRepository, 'createProduct')
          .mockResolvedValue(createProduct);
        const result = await productService.createProduct(createProductDto);

        expect(productRepositoryCreateSpy).toBeCalledWith(createProduct);
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual(createProduct);
      });
    });

    // 상품 List 조회 Unit Test
    describe('findAll', () => {
      it('생성된 모든 상품을 반환한다.', async () => {
        const existingProductList = [];
        const existingProduct1 = new Product();
        Object.assign(existingProduct1, {
          id: ProductId,
          name: '아이패드 미니 거치대',
          description: '오주주 아이패드 미니3 마그네틱 거치대',
          price: '29000',
        });
        const existingProduct2 = new Product();
        Object.assign(existingProduct2, {
          id: ProductId,
          name: 'LG 무선 청소기',
          description: 'LG 코드 제로 무선 청소기',
          price: '780000',
        });
        existingProductList.push(existingProduct1, existingProduct2);
        const productRepositoryFindAllSpy = jest
          .spyOn(productRepository, 'find')
          .mockResolvedValue(existingProductList);
        const result = await productService.getProducts();

        expect(productRepositoryFindAllSpy).toBeCalled();
        expect(result).toStrictEqual(existingProductList);
      });
    });

    // 특정 상품 조회 Unit Test
    describe('findById', () => {
      it('존재하지 않은 상품 id로 조회를 요청한다면, 찾을 수 없다는 예외를 반환한다.', async () => {
        const notExistProductId = 100;
        jest.spyOn(productRepository, 'findOne').mockResolvedValue(undefined);
        const result = async () => {
          await productService.getProduct(notExistProductId);
        };
        await expect(result).rejects.toThrowError(
          new NotFoundException('Product not found'),
        );
      });
      it('존재하는 상품 id로 조회를 요청한다면, 해당 id의 상품을 반환한다.', async () => {
        const existingProduct = new Product();
        Object.assign(existingProduct, {
          id: ProductId,
          name: '아이패드 미니 거치대',
          description: '오주주 아이패드 미니3 마그네틱 거치대',
          price: '29000',
        });
        const productRepositoryFindOneSpy = jest
          .spyOn(productRepository, 'findOne')
          .mockResolvedValue(existingProduct);
        const result = await productService.getProduct(ProductId);
        expect(productRepositoryFindOneSpy).toHaveBeenCalledWith({
          where: { id: ProductId },
        });
        expect(result.name).toBe('아이패드 미니 거치대');
        expect(result.price).toBe('29000');
      });
    });

    // 상품 수정 Unit Test
    describe('editProduct', () => {
      it('생성되지 않은 상품의 id로 수정하려한다면 찾을 수 없다는 예외를 발생시킨다.', async () => {
        jest.spyOn(productRepository, 'findOne').mockResolvedValue(undefined);
        const result = async () => {
          await productService.editProduct(ProductId, createProductDto);
        };
        await expect(result).rejects.toThrowError(
          new NotFoundException('Product not found'),
        );
      });
      it('해당 id의 상품을 수정하고 수정된 객체를 반환한다.', async () => {
        const existingProduct = new Product();
        Object.assign(existingProduct, {
          id: ProductId,
          name: '아이패드 미니 거치대',
          description: '오주주 아이패드 미니3 마그네틱 거치대',
          price: '29000',
        });
        const updateProduct = new Product();
        Object.assign(updateProduct, {
          id: ProductId,
          ...createProductDto,
        });
        const productRepositoryFindOneSpy = jest
          .spyOn(productRepository, 'findOne')
          .mockResolvedValue(existingProduct);
        const productRepositoryUpdateSpy = jest
          .spyOn(productRepository, 'editProduct')
          .mockResolvedValue(updateProduct);

        const result = await productService.editProduct(
          ProductId,
          createProductDto,
        );

        expect(productRepositoryFindOneSpy).toHaveBeenCalledWith({
          where: {
            id: ProductId,
          },
        });
        expect(productRepositoryUpdateSpy).toHaveBeenCalledWith(
          createProductDto,
          existingProduct,
        );
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual(updateProduct);
      });
    });

    // 상품 삭제 Unit Test
    describe('deleteProduct', () => {
      it('상품 id가 주어진다면 생성된 상품을 삭제한다', async () => {
        const productRepositoryDeleteSpy = jest
          .spyOn(productRepository, 'delete')
          .mockResolvedValue({} as DeleteResult);
        const result = await productService.deleteProduct(ProductId);

        expect(productRepositoryDeleteSpy).toHaveBeenCalledWith(ProductId);
        expect(result).toBeUndefined();
      });
    });
  });
});
