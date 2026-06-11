import { SetMetadata } from "@nestjs/common"
const CACHE_KEY_METADATA = 'cache_key'
export const Cachable = (key?:string) => SetMetadata(CACHE_KEY_METADATA, key || true)
