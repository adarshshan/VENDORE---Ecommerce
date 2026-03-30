import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { getSearchSuggestions } from "../services/api";
import type { Product } from "../types/Product";
import CircularProgress from "@mui/material/CircularProgress";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    products: Product[];
    categories: { name: string; slug: string }[];
    brands: { name: string }[];
  }>({ products: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query?.trim()?.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions({ products: [], categories: [], brands: [] });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSearchSuggestions(query);
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setShowDropdown(false);
    }
  };

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return (
      <span>
        {parts?.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={i} className="text-accent font-bold">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-4" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Search for dresses, categories..."
          className="w-full bg-surface-light border border-border focus:border-accent outline-none rounded-full py-2 px-10 text-sm transition-all"
        />
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          fontSize="small"
        />
        {loading && (
          <CircularProgress
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 !text-accent"
          />
        )}
      </form>

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
          {suggestions?.products?.length === 0 &&
          suggestions?.categories?.length === 0 &&
          suggestions?.brands?.length === 0 &&
          !loading ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {suggestions?.products?.length > 0 && (
                <div className="p-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-1">
                    Products
                  </h3>
                  {suggestions?.products?.map((product) => (
                    <div
                      key={product?._id}
                      onClick={() => {
                        navigate(`/product/${product?._id}`);
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors"
                    >
                      <img
                        src={product?.images?.[0]}
                        alt={product?.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                          {highlightMatch(product?.name, query)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          ₹{product?.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {suggestions?.categories?.length > 0 && (
                <div className="p-2 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-1">
                    Categories
                  </h3>
                  {suggestions?.categories?.map((cat) => (
                    <div
                      key={cat?.slug}
                      onClick={() => {
                        navigate(`/products?category=${cat?.slug}`);
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="p-2 hover:bg-surface-hover rounded-lg cursor-pointer text-sm text-white"
                    >
                      {highlightMatch(cat?.name, query)}
                    </div>
                  ))}
                </div>
              )}

              {suggestions?.brands?.length > 0 && (
                <div className="p-2 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-1">
                    Brands
                  </h3>
                  {suggestions?.brands?.map((brand) => (
                    <div
                      key={brand?.name}
                      onClick={() => {
                        navigate(`/products?brand=${brand?.name}`);
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="p-2 hover:bg-surface-hover rounded-lg cursor-pointer text-sm text-white"
                    >
                      {highlightMatch(brand?.name, query)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
