import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { decryptData } from '../utils/';

@Injectable()
export class DecodeBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value.data !== 'string') {
      throw new BadRequestException('Invalid request format. Expected { data: string }');
    }

    try {
      const decoded = decryptData(value.data);
      return decoded as unknown as object;
    } catch (error) {
      throw new BadRequestException('Failed to decode data');
    }
  }
}
