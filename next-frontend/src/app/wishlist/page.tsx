"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/src/store/useStore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const Wishlist: React.FC = () => {
  const router = useRouter();
  const wishlist = useStore((state) => state.wishlist);
  const fetchWishlist = useStore((state) => state.fetchWishlist);
  const user = useStore((state) => state.user);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (!user && wishlist?.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <FavoriteIcon className="text-red-500 text-6xl mb-4 opacity-20" />
        <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">
          Your Wishlist is Empty
        </h2>
        <p className="text-text-secondary mb-8">
          Save items you love to your wishlist and they'll show up here.
        </p>
        <button onClick={() => router.push("/products")} className="btn-primary">
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[10rem]">
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4 group"
            >
              <ArrowBackIcon
                fontSize="small"
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm font-bold uppercase tracking-widest">
                Back
              </span>
            </button>
            <h1 className="text-4xl font-serif font-black text-text-primary">
              My Wishlist
              <span className="ml-4 text-lg font-sans font-normal text-text-muted">
                ({wishlist?.length} Items)
              </span>
            </h1>
          </div>
        </div>

        {wishlist?.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center">
            <FavoriteIcon className="text-error text-6xl mb-4 opacity-20" />
            <h3 className="text-xl text-text-primary mb-2">No items found</h3>
            <p className="text-text-secondary mb-6">
              Start adding your favorite pieces to your wishlist.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="btn-outline"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlist.map((product) => (
              <div
                key={product?._id}
                className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row p-4 gap-4"
              >
                <div
                  className="w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => router.push(`/product/${product?._id}`)}
                >
                  <img
                    src={product?.images?.[0]?.url}
                    alt={product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-text-primary capitalize">
                        {product?.name}
                      </h3>
                      <button
                        onClick={() =>
                          removeFromWishlist(product?._id as string)
                        }
                        className="p-2 border border-border text-text-secondary hover:text-red-400 hover:border-error transition-all rounded-lg cursor-pointer"
                      >
                        <DeleteForeverIcon fontSize="small" className="" />
                      </button>
                    </div>

                    <p className="text-accent font-bold">
                      ₹{product?.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
