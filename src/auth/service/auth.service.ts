import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { SignUpDTO } from "../controller/dto";

@Injectable()
export class UserService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    
    async signUp(signUpDTO: SignUpDTO) {
        
    }
}