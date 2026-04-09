import { BannerRepository } from '../repositories/BannerRepository';
import { IBanner } from '../models/BannerSchema';
import cloudinary from '../config/cloudinary';

export class BannerService {
  private bannerRepository: BannerRepository;

  constructor() {
    this.bannerRepository = new BannerRepository();
  }

  async getAllBanners(): Promise<IBanner[]> {
    return await this.bannerRepository.findAll();
  }

  async getActiveBanners(): Promise<IBanner[]> {
    return await this.bannerRepository.findActive();
  }

  async getBannerById(id: string): Promise<IBanner | null> {
    return await this.bannerRepository.findById(id);
  }

  async createBanner(bannerData: Partial<IBanner>, file?: Express.Multer.File): Promise<IBanner> {
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'banners' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      bannerData.image = (uploadResult as any).secure_url;
    }
    return await this.bannerRepository.create(bannerData);
  }

  async updateBanner(id: string, bannerData: Partial<IBanner>, file?: Express.Multer.File): Promise<IBanner | null> {
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'banners' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      bannerData.image = (uploadResult as any).secure_url;
    }
    return await this.bannerRepository.update(id, bannerData);
  }

  async deleteBanner(id: string): Promise<IBanner | null> {
    return await this.bannerRepository.delete(id);
  }

  async toggleBannerVisibility(id: string): Promise<IBanner | null> {
    const banner = await this.bannerRepository.findById(id);
    if (!banner) return null;
    return await this.bannerRepository.update(id, { isActive: !banner.isActive });
  }
}
