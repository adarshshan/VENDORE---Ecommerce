import Slider from "react-slick";
import cover01 from "../../src/assets/coverImages/kids-own-01.jpg";
import cover02 from "../../src/assets/coverImages/kids-own-02.jpg";
import cover03 from "../../src/assets/coverImages/kids-own-03.jpg";

interface SlickBannerInterface {}
const SlickBanner: React.FC<SlickBannerInterface> = ({}) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: true,
    cssEase: "linear",
  };

  const slides = [
    {
      id: 1,
      image: cover01,
      title: "New Summer Collection",
      subtitle: "Up to 50% Off on all kids wear",
    },
    {
      id: 2,
      image: cover02,
      title: "Playful Prints",
      subtitle: "Comfortable and stylish for active kids",
    },
    {
      id: 3,
      image: cover03,
      title: "Special Occasion Wear",
      subtitle: "Elegant styles for every celebration",
    },
  ];

  return (
    <div className="w-full">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative h-[400px] md:h-[600px]">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-6">
              <h1 className="text-4xl md:text-7xl font-serif font-black mb-4 text-center drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-lg md:text-2xl font-medium mb-10 text-center drop-shadow-lg text-gray-200 font-sans">
                {slide.subtitle}
              </p>
              <button className="btn-primary btn-lg shadow-2xl hover:scale-105 transition-all duration-300">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlickBanner;
