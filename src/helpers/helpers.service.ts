import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ShortUniqueId from 'short-unique-id';
import { supabase } from '../supabase/supabase-client';

@Injectable()
export class HelpersService {
  constructor(private readonly prisma: PrismaService) {}

  logger = new Logger(HelpersService.name);

  bucketName = 'Glauk';

  //async helper method to check if a user exists
  async userExist(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    //send an error if user does not exist
    if (user) {
      return {
        user,
        exists: true,
      };
    } else {
      return {
        user: null,
        exists: false,
      };
    }
  }

  async userEmailVerified(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    //send an error if user does not exist
    if (user?.isEmailVerified === true) {
      return true;
    } else {
      return false;
    }
  }

  async generateRandomCode(length: number) {
    const uid = new ShortUniqueId({ length: length, dictionary: 'hex' });
    return uid.rnd();
  }

  async parseFileToSupabase(file: Express.Multer.File, email?: string) {
    try {
      const fileBuffer = file.buffer;

      if (!fileBuffer.buffer) {
        throw new BadRequestException('File buffer is empty');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      const userName = user?.name;
      const randomCode = await this.generateRandomCode(5);

      const ext = file.originalname.split('.').pop()?.toLowerCase();
      const fileName = `${userName}-${randomCode}.${ext}`;
      const pdfFilePath = `glauk-pdfs/${fileName}`;
      const pptxFilePath = `glauk-pptx/${fileName}`;

      if (ext == 'pdf') {
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(pdfFilePath, fileBuffer);

        if (error) {
          throw new BadRequestException('There was an error uploading pdf.');
        }

        const { data: publicData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(pdfFilePath);

        return {
          publicUrl: publicData.publicUrl,
          path: data.path,
        };
      } else {
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(pptxFilePath, fileBuffer);

        if (error) {
          throw new BadRequestException('There was an error uploading pdf.');
        }

        const { data: publicdData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(pptxFilePath);

        return {
          publicUrl: publicdData.publicUrl,
          path: data.path,
        };
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async parseFileToText() {
    
  }
}
