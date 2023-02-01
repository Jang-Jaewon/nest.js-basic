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
  });
});
