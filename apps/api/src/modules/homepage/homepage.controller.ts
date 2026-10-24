import { Controller, Get } from "@nestjs/common";

import { Public } from "../../common/decorators";
import { HomepageService } from "./homepage.service";

@Controller("homepage")
export class HomepageController {
  constructor(private homepage: HomepageService) {}

  @Public()
  @Get()
  get() {
    return this.homepage.get();
  }
}
