import Banner, { IBanner } from '../models/BannerSchema';

export class BannerRepository {
  async findAll(): Promise<IBanner[]> {
    return await Banner.find().sort({ priority: 1, createdAt: -1 });
  }

  async findActive(): Promise<IBanner[]> {
    return await Banner.find({ isActive: true }).sort({ priority: 1, createdAt: -1 });
  }

  async findById(id: string): Promise<IBanner | null> {
    return await Banner.findById(id);
  }

  async create(bannerData: Partial<IBanner>): Promise<IBanner> {
    const banner = new Banner(bannerData);
    return await banner.save();
  }

  async update(id: string, bannerData: Partial<IBanner>): Promise<IBanner | null> {
    return await Banner.findByIdAndUpdate(id, bannerData, { new: true });
  }

  async delete(id: string): Promise<IBanner | null> {
    return await Banner.findByIdAndDelete(id);
  }
}
