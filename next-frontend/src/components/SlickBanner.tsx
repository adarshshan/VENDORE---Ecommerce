"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { getActiveBanners } from "@/src/services/api";
import { type Banner } from "@/src/types/Banner";
import { useRouter } from "next/navigation";

import Image from "next/image";

const SlickBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: true,
    cssEase: "linear",
    pauseOnHover: false,
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        if (data.success) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[250px] md:h-[600px] bg-surface-light animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className="relative h-[250px] md:h-[600px] outline-none"
          >
            <Image
              src={banner.image}
              alt={banner.title || "Banner image"}
              fill
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-6 text-center">
              <h1 className="text-[#ffffff] text-4xl md:text-7xl font-serif font-black mb-4 drop-shadow-2xl max-w-4xl">
                {banner.title}
              </h1>
              {banner.link && (
                <button
                  onClick={() => router.push(banner.link)}
                  className="mt-6 btn-lg shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 bg-white/10 backdrop-blur-sm rounded-xl px-8 py-3 text-[#ffffff] font-bold"
                >
                  Shop Now
                </button>
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlickBanner;

