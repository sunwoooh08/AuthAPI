import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    
}