import { Controller, Post } from "@nestjs/common";

@Controller('/auth/')
export class AuthController {

    @Post('signup')
    async signUp() {}

    @Post('signin')
    async signIn() {}

    @Post('signout')
    async signOut() {}
}