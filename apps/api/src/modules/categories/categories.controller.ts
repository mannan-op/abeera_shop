import { Controller, Get, Param } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Public } from "../../common/decorators";

@Controller("categories")
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categories.findAll();
  }

  @Public()
  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.categories.findBySlug(slug);
  }
}
