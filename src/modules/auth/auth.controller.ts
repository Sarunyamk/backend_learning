import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // @Public()
  // @ResponseMessage('Registration successful')
  // register(@Body() dto: RegisterDto) {
  //   return this.authService.register(dto);
  // }

  // @Post('login')
  // @Public()
  // @ResponseMessage('Login successful')
  // login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto);
  // }

  // @Get('profile')
  // @ApiBearerAuth()
  // @ResponseMessage('Profile retrieved')
  // getProfile(@CurrentUser('sub') userId: string) {
  //   return this.authService.getProfile(userId);
  // }
}
