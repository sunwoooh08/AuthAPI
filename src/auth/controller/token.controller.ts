import { Controller, Post } from "@nestjs/common";

@Controller('/auth/token/')
export class TokenController {

    @Post('refresh') 
    async refreshToken() {}
}