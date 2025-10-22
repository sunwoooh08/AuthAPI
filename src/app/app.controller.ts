import { Controller, Get } from "@nestjs/common";

@Controller('/')
export class LandingController {

    @Get()
    landing() {
        return {
            landing: "Hello, world!"
        }
    }

    @Get('/health') 
    health() {
        return { 
            status: "Healthy!"
        }
    }
}