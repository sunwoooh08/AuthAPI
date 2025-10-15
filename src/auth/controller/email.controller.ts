import { Body, Controller, Post } from "@nestjs/common";
import { ResendEmailDTO, ResetPasswordDTO, ResetProcessDTO, ResetRequestDTO } from "./dto";

@Controller('/auth/email')
export class EmailController {

    @Post('resend')
    async resendEmail(@Body() body: ResendEmailDTO) {}

    @Post('reset')
    async resetPassword(@Body() body: ResetRequestDTO | ResetProcessDTO | ResetPasswordDTO) {}
}