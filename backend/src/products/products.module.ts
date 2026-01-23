import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/product.entity';
import { ProductsController } from './infrastructure/products.controller';
import { ProductRepository, MarketConfigRepository } from './infrastructure/repositories';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { MARKET_CONFIG_REPOSITORY } from './domain/repositories/market-config.repository.interface';
import {
  GetProductsUseCase,
  GetSuggestionsUseCase,
  GetMarketsUseCase,
  AssignToMarketUseCase,
  ChangeMarketUseCase,
  RemoveFromMarketUseCase,
} from './application/use-cases';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    forwardRef(() => SolicitudesModule),
    EmailModule,
  ],
  controllers: [ProductsController],
  providers: [
    // Repositories
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: MARKET_CONFIG_REPOSITORY,
      useClass: MarketConfigRepository,
    },
    // Use Cases
    GetProductsUseCase,
    GetSuggestionsUseCase,
    GetMarketsUseCase,
    AssignToMarketUseCase,
    ChangeMarketUseCase,
    RemoveFromMarketUseCase,
  ],
  exports: [
    AssignToMarketUseCase,
    ChangeMarketUseCase,
    RemoveFromMarketUseCase,
    PRODUCT_REPOSITORY,
    MARKET_CONFIG_REPOSITORY,
  ],
})
export class ProductsModule {}
