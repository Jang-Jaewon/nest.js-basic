import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDTO } from './dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, ProductRepository],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  // it('should be 4', () => {
  //   expect(2 + 2).toEqual(4);
  // });

  describe('ProductService', () => {
    describe('editProduct', () => {
      it('생성되지 않은 상품의 id로 수정하려한다면 찾을 수 없다는 예외를 발생시킨다.', async () => {
        const ProductId = 1;
        const createProductDto: CreateProductDTO = {
          name: 'dfsdf',
          description: 'addsad',
          price: '12132',
        };
        jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
        const result = async () => {
          await service.editProduct(ProductId, createProductDto);
        };
        await expect(result).rejects.toThrowError(
          new NotFoundException('Product not found'),
        );
      });
    });
  });
});
