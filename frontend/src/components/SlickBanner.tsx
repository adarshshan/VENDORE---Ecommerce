import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { getActiveBanners } from "../services/api";
import { type Banner } from "../types/Banner";
import { useNavigate } from "react-router-dom";

const SlickBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="relative h-[250px] md:h-[600px] outline-none"
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-6 text-center">
              <h1 className="text-[#ffffff] text-4xl md:text-7xl font-serif font-black mb-4 drop-shadow-2xl max-w-4xl">
                {banner.title}
              </h1>
              {banner.link && (
                <button
                  onClick={() => navigate(banner.link)}
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
