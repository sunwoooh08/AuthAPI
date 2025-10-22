import { Body, Controller, Post } from "@nestjs/common";
import { SignInDTO, SignUpDTO } from "./dto";

@Controller('/auth/')
export class AuthController {

    @Post('signup')
    async signUp(@Body() body: SignUpDTO) {

    }

    @Post('signin')
    async signIn(@Body() body: SignInDTO) {
        
    }

    @Post('signout')
    async signOut(@Body() body: {}) {

    }
}