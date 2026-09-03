import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { Public } from "../../common/decorators";

@Controller("products")
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Public()
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("size") size?: string,
    @Query("minPrice") minPrice?: number,
    @Query("maxPrice") maxPrice?: number,
    @Query("sort") sort?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
    @Query("search") search?: string,
  ) {
    return this.products.findAll({
      category, size, minPrice, maxPrice, sort,
      page: page ?? 1, pageSize: pageSize ?? 24, search,
    });
  }

  @Public()
  @Get("filters")
  getFilters(@Query("category") category?: string) {
    return this.products.getFilterOptions(category);
  }

  @Public()
  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.products.findBySlug(slug);
  }
}
