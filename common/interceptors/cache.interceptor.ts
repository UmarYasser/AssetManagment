import { 
  Injectable, NestInterceptor,   ExecutionContext,   CallHandler, Inject // Required to inject the CacheManager
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'; // The token to find the cache
import { Observable, of } from 'rxjs'; // 'of' is here
import { tap } from 'rxjs/operators'; // 'tap' is here
import { Reflector } from '@nestjs/core';
 
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, 
    @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    //1.Check if the method is flagged as cachable
    const CACHE_KEY_METADATA = 'cache_key';
    const keyPrefix = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
    if (!keyPrefix) return next.handle();

    //2. Extract the path of the request => folder/getByFolder/Mosques
    const request = context.switchToHttp().getRequest();
    // folder/getOne/123 => modelName = folder, fn = getOne, id= 12
    const modelName = context.getClass().name.replace('Controller', '').toLowerCase() // folder
    const method =  context.getHandler().name // getOne
    
    //3. Create the cache key that will be stored => Either the /mosques or ?mosques
    let cacheKey:string;
    let userSpec:string;

    // if( method is specfic to a user)
    if(request.query && Object.keys(request.query).length > 0){
      const queryKey = Object.keys(request.query).sort().map(k => `${k}=${request.query[k]}`).join('_') // tags=tag1,tag2&other=val
      cacheKey = `${modelName}:${method}:${queryKey}`; // folder:assetByTag:123
    }else
     cacheKey = `${modelName}:${method}:${request.params.id}`; // folder:assetByTag:123

    if (!cacheKey){
      console.log("No cache key found for this route, skipping cache interceptor")
      return next.handle();
    } 

    //If that key was found in redis, return it
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData){
      console.log(`Cache hit for key: ${cacheKey}`)
      return of(cachedData);   
    } 
    
    console.log(`Cache miss for key: ${cacheKey}`)
    // 2. If not, run the route and save it from the response 
    return next.handle().pipe(
      tap( (data) =>  this.cacheManager.set(cacheKey, data, 600000)) // in millisecs
    );      
  }
}