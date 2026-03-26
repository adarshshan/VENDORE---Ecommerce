import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto py-12 px-[1rem] sm:px-[5rem]">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 text-center md:text-left">
            <h3 className="text-xl font-serif font-bold text-white mb-4 tracking-wider">
              KIDS-OWN
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Premium quality clothing for your little ones. Comfort meets style
              in every stitch.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Shop
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-text-secondary">
              <Link
                to="/products"
                className="hover:text-accent transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/products"
                className="hover:text-accent transition-colors"
              >
                Best Sellers
              </Link>
              <Link
                to="/products"
                className="hover:text-accent transition-colors"
              >
                Sale
              </Link>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Support
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-text-secondary">
              <Link
                to="/contact"
                className="hover:text-accent transition-colors"
              >
                Contact Us
              </Link>
              <Link to="#" className="hover:text-accent transition-colors">
                Shipping & Returns
              </Link>
              <Link to="#" className="hover:text-accent transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Newsletter
            </h4>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="input py-2 text-sm"
              />
              <button className="btn-primary py-2 text-sm w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-text-muted">
          <p>
            &copy; {new Date().getFullYear()} KIDS-OWN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
