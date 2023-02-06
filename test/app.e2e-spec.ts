import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { ProductService } from '../src/product/product.service';
import { ProductModule } from '../src/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../src/product/product.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let productService: ProductService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ProductModule, TypeOrmModule.forFeature([Product])],
    }).compile();
    productService = moduleFixture.get<ProductService>(ProductService);

    app = moduleFixture.createNestApplication();
    await app.init();

    await productService.createProduct({
      name: '노트북 킥스탠드',
      description: '모프트 쿨링 랩탑 부착형 노트북 거치대',
      price: '40000',
    });
    await productService.createProduct({
      name: '노트북 무선 청소기',
      description: '모프트 쿨링 랩탑 LG 코드제로 무선 청소기 노트북 거치대',
      price: '540000',
    });
  });

  afterAll(async () => {
    await Product.query(`TRUNCATE TABLE product`);
    // await Product.query(`DELETE FROM product`);
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/product (GET)', () => {
    it('모든 상품의 리스트를 반환한다.', async () => {
      const res = await request(app.getHttpServer()).get('/product');
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      const { body } = res;
      expect(body).toStrictEqual([
        {
          id: expect.any(Number),
          name: '노트북 킥스탠드',
          description: '모프트 쿨링 랩탑 부착형 노트북 거치대',
          price: '40000',
        },
        {
          id: expect.any(Number),
          name: '노트북 무선 청소기',
          description: '모프트 쿨링 랩탑 LG 코드제로 무선 청소기 노트북 거치대',
          price: '540000',
        },
      ]);
    });

    it('특정 id의 상품 정보를 반환한다.', async () => {
      const res = await request(app.getHttpServer()).get('/product/1');
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      const { body } = res;
      expect(body).toStrictEqual({
        id: 1,
        name: '노트북 킥스탠드',
        description: '모프트 쿨링 랩탑 부착형 노트북 거치대',
        price: '40000',
      });
    });

    it('상품을 생성한다.', async () => {
      const res = await request(app.getHttpServer()).post('/product').send({
        name: '멀티 오븐',
        description: '삼성 비스포크 쿠커',
        price: '380000',
      });
      expect(res.status).toBe(201);
      expect(res.type).toBe('application/json');
      const { body } = res;
      expect(body).toStrictEqual({
        id: 3,
        name: '멀티 오븐',
        description: '삼성 비스포크 쿠커',
        price: '380000',
      });
    });

    it('특정 상품을 수정한다.', async () => {
      const res = await request(app.getHttpServer()).patch('/product/3').send({
        name: '아이폰',
        description: '아이폰 14 프로',
        price: '1120000',
      });
      expect(res.status).toBe(200);
      expect(res.type).toBe('application/json');
      const { body } = res;
      expect(body).toStrictEqual({
        id: 3,
        name: '아이폰',
        description: '아이폰 14 프로',
        price: '1120000',
      });
    });

    it('특정 상품을 삭제한다.', async () => {
      const res = await request(app.getHttpServer()).delete('/product/1').send({
        name: '아이폰',
        description: '아이폰 14 프로',
        price: '1120000',
      });
      expect(res.status).toBe(200);
      const product_list = await request(app.getHttpServer()).get('/product');
      const { body } = product_list;
      expect(body).toHaveLength(2);
    });
  });
});
