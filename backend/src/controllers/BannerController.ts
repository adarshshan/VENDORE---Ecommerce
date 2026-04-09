import { Request, Response } from "express";
import { BannerService } from "../services/BannerService";

export class BannerController {
  private bannerService: BannerService;

  constructor() {
    this.bannerService = new BannerService();
  }

  async getAllBanners(req: Request, res: Response): Promise<void> {
    try {
      const banners = await this.bannerService.getAllBanners();
      res.status(200).json({ success: true, banners });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActiveBanners(req: Request, res: Response): Promise<void> {
    try {
      const banners = await this.bannerService.getActiveBanners();
      res.status(200).json({ success: true, banners });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createBanner(req: Request, res: Response): Promise<void> {
    try {
      const bannerData = req.body;
      const file = req.file;
      const banner = await this.bannerService.createBanner(bannerData, file);
      res.status(201).json({ success: true, banner });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bannerData = req.body;
      const file = req.file;
      const banner = await this.bannerService.updateBanner(
        id,
        bannerData,
        file,
      );
      if (!banner) {
        res.status(404).json({ success: false, message: "Banner not found" });
        return;
      }
      res.status(200).json({ success: true, banner });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteBanner(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const banner = await this.bannerService.deleteBanner(id);
      if (!banner) {
        res.status(404).json({ success: false, message: "Banner not found" });
        return;
      }
      res
        .status(200)
        .json({ success: true, message: "Banner deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleBannerVisibility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const banner = await this.bannerService.toggleBannerVisibility(id);
      if (!banner) {
        res.status(404).json({ success: false, message: "Banner not found" });
        return;
      }
      res.status(200).json({ success: true, banner });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
