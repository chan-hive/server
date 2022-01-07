import { Global, Module } from "@nestjs/common";

import { ConfigService } from "@config/config.service";
import { ConfigResolver } from "@config/config.resolver";

@Global()
@Module({
    providers: [ConfigService, ConfigResolver],
})
export class ConfigModule {}
