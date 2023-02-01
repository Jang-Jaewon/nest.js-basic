import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from '../repositories/product.repository';
import { TypeOrmExModule } from '../common/typeorm-ex.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([ProductRepository])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
