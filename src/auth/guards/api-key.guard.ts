import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] ?? req.query.api_key;
    const isValid = this.validateApiKey(key);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return true;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    return apiKey === process.env.API_KEY;
  }
}
