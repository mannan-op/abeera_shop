import { BadRequestException, Body, Controller, Get, Put } from "@nestjs/common";
import { homepageContentSchema, homepageIssueMessage } from "@abeera/shared";

import { Roles } from "../../common/decorators";
import { HomepageService } from "./homepage.service";

@Controller("admin/homepage")
@Roles("ADMIN")
export class HomepageAdminController {
  constructor(private homepage: HomepageService) {}

  @Get()
  get() {
    return this.homepage.get();
  }

  @Put()
  save(@Body() body: unknown) {
    const parsed = homepageContentSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(homepageIssueMessage(parsed.error));
    }
    return this.homepage.save(parsed.data);
  }
}
