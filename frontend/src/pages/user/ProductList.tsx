import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Product } from "../../types/Product";
import {
  getProducts,
  getCategories,
  getSearchSuggestions,
} from "../../services/api";
import type { ProductFilters } from "../../services/api";
import ProductCard from "../../components/ProductCard";
import {
  Drawer,
  Slider,
  FormControl,
  Select,
  MenuItem,
  styled,
  InputBase,
  alpha,
  IconButton,
  CircularProgress,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../utils/cn";
import { getCategoryBySlug } from "../../services/api";
import SEO from "../../components/SEO";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "var(--color-surface)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.05),
  },
  marginLeft: 0,
  width: "100%",
  border: "1px solid var(--color-border)",
  transition: "all 0.2s ease-in-out",
  "&:focus-within": {
    borderColor: "var(--color-accent)",
    boxShadow: "0 0 0 2px rgba(56, 189, 248, 0.1)",
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "var(--text-primary)",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    fontSize: "0.875rem",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
    "&::placeholder": {
      color: "var(--color-text-secondary)",
      opacity: 1,
    },
  },
}));

const ProductList: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  // ... rest of state
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<{
    products: Product[];
    categories: { name: string; slug: string }[];
    brands: { name: string }[];
  }>({ products: [], categories: [], brands: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Infinite Scroll States
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories("Active");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCats();
  }, []);

  // Handle slug changes
  useEffect(() => {
    const handleSlug = async () => {
      if (slug) {
        try {
          const category = await getCategoryBySlug(slug);
          if (category) {
            setActiveCategory(category);
            setFilters((prev) => ({
              ...prev,
              category: category._id,
              page: 1,
            }));
          }
        } catch (error) {
          console.error("Error fetching category by slug", error);
        }
      } else {
        setActiveCategory(null);
        setFilters((prev) => ({ ...prev, category: undefined, page: 1 }));
      }
    };
    handleSlug();
  }, [slug]);

  // Main fetch effect
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        if (filters.page === 1) setIsLoading(true);
        else setIsFetchingMore(true);

        setIsError(false);
        const data = await getProducts(filters);

        if (filters.page === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setHasMore(data?.hasMore);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    };

    fetchProductsData();
  }, [filters]);

  // Debounce logic for suggestions and main filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions({ products: [], categories: [], brands: [] });
      }

      setFilters((prev) => ({
        ...prev,
        page: 1,
        search: searchQuery.trim() || undefined,
      }));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    setLoadingSuggestions(true);
    try {
      const data = await getSearchSuggestions(searchQuery);
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      search: searchQuery || undefined,
    }));
    setShowDropdown(false);
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      category: category === "All" ? undefined : category,
    }));
  };

  const handleSortChange = (event: any) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sort: event.target.value,
    }));
  };

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
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

  const FilterContent = () => (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-6 text-text-primary border-b border-border pb-4">
        Filters
      </h3>

      <div className="mb-8">
        <label className="label uppercase tracking-wider text-xs font-bold mb-3 block">
          Category
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters?.category
                ? "bg-accent text-text-inverse font-bold"
                : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
            }`}
          >
            All Categories
          </button>
          {categories &&
            categories?.length > 0 &&
            categories?.map((cat) => (
              <button
                key={cat?._id}
                onClick={() => handleCategoryChange(cat?._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters?.category === cat?._id
                    ? "bg-accent text-text-inverse font-bold"
                    : "text-text-secondary hover:bg-surface-light hover:text-text-primary"
                }`}
              >
                {cat?.name}
              </button>
            ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="label uppercase tracking-wider text-xs font-bold mb-3 block text-text-primary">
          Price Range
        </label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            sx={{
              color: "var(--color-accent)",
              "& .MuiSlider-thumb": {
                bgcolor: "var(--text-primary)",
              },
              "& .MuiSlider-rail": {
                bgcolor: "var(--color-border-light)",
              },
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-text-secondary font-mono">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="border border-border hover:border-border-light opacity-80 hover:opacity-95 btn-primary w-full mt-auto text-text-primary py-2"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem] transition-colors">
      <SEO
        title={
          activeCategory
            ? `${activeCategory.name} Collection`
            : "Our Collection"
        }
        description={
          activeCategory
            ? `Explore our ${activeCategory.name} collection. High-quality and stylish products for Men and Women.`
            : "Discover the latest trends in men's fashion and stylish clothing for women."
        }
        url={slug ? `/category/${slug}` : "/products"}
      />
      <div className="container-custom py-2 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black mb-2 text-text-primary">
              Our Collection
            </h1>
            <p className="text-text-secondary max-w-lg">
              Discover our latest styles and seasonal favorites designed for
              comfort and play.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative" ref={dropdownRef}>
              <SearchContainer>
                <SearchIconWrapper>
                  <SearchIcon className="text-text-secondary" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    e.key === "Enter" && applyFilters();
                  }}
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
                  {loadingSuggestions && (
                    <CircularProgress size={16} className="!text-accent" />
                  )}
                </div>
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery("");
                      setFilters((prev) => ({
                        ...prev,
                        search: undefined,
                      }));
                    }}
                    sx={{
                      position: "absolute",
                      right: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-secondary)",
                      "&:hover": {
                        color: "var(--text-primary)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </SearchContainer>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchQuery.trim()?.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[100] min-w-[300px] max-h-[400px] overflow-y-auto">
                  {suggestions?.products?.length === 0 &&
                  suggestions?.categories?.length === 0 &&
                  suggestions?.brands?.length === 0 &&
                  !loadingSuggestions ? (
                    <div className="p-4 text-center text-text-secondary text-sm">
                      No results found for "{searchQuery}"
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
                                navigate(
                                  `/product/${product?.slug || product?._id}`,
                                );
                                setShowDropdown(false);
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors"
                            >
                              <img
                                src={product?.images?.[0]?.url}
                                alt={product?.name}
                                className="w-8 h-8 object-cover rounded-md"
                              />
                              <div className="flex-grow overflow-hidden">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {highlightMatch(product?.name, searchQuery)}
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
                                handleCategoryChange(cat?.slug);
                                const categoryObj = categories?.find(
                                  (c) => c?.slug === cat?.slug,
                                );
                                if (categoryObj)
                                  handleCategoryChange(categoryObj?._id);

                                setSearchQuery("");
                                setShowDropdown(false);
                              }}
                              className="p-2 hover:bg-surface-hover rounded-lg cursor-pointer text-sm text-text-primary"
                            >
                              {highlightMatch(cat?.name, searchQuery)}
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
                                setFilters((prev) => ({
                                  ...prev,
                                  brand: brand?.name,
                                }));
                                setSearchQuery("");
                                setShowDropdown(false);
                              }}
                              className="p-2 hover:bg-surface-hover rounded-lg cursor-pointer text-sm text-text-primary"
                            >
                              {highlightMatch(brand.name, searchQuery)}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="hidden md:flex btn-secondary px-4 py-2.5 items-center justify-center gap-2 border border-border rounded-md text-text-primary opacity-80 hover:opacity-95"
              >
                <FilterListIcon fontSize="small" />
                Filters
              </button>
              <div className="w-full sm:w-auto menuitems">
                <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
                  <Select
                    value={filters.sort || "newest"}
                    onChange={handleSortChange}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    sx={{
                      bgcolor: "var(--color-surface)",
                      color: "var(--text-primary)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--color-border)",
                      "& .MuiSelect-icon": { color: "var(--text-primary)" },
                      "& fieldset": { border: "none" },
                    }}
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills (Mobile Only) */}
        <div className="md:hidden sticky top-[64px] z-40 bg-background/80 backdrop-blur-md -mx-4 px-4 py-3 mb-6 border-b border-border/50">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide scroll-smooth">
            <button
              onClick={() => handleCategoryChange("All")}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                !filters?.category
                  ? "bg-text-primary text-text-inverse border-text-primary shadow-md active:scale-95"
                  : "bg-surface text-text-secondary border-border hover:border-accent/50",
              )}
            >
              All Categories
            </button>
            {categories?.map((cat) => (
              <button
                key={cat?._id}
                onClick={() => handleCategoryChange(cat?._id)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  filters?.category === cat?._id
                    ? "bg-text-primary text-text-inverse border-text-primary shadow-md active:scale-95"
                    : "bg-surface text-text-secondary border-border hover:border-accent/50",
                )}
              >
                {cat?.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24">
            <div className="card bg-surface p-0 border border-border">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
              sx: {
                bgcolor: "var(--color-surface)",
                backgroundImage: "none",
                width: 300,
                borderRight: "1px solid var(--color-border)",
              },
            }}
          >
            <FilterContent />
          </Drawer>

          {/* Product Grid */}
          <div className="flex-grow w-full">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="card h-[260px] sm:h-[350px] animate-pulse bg-surface-light"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-surface rounded-xl border border-border">
                <p className="text-error text-lg mb-2">
                  Error loading products
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary btn-sm"
                >
                  Try Again
                </button>
              </div>
            ) : products && products?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4">
                  {products?.map((product) => (
                    <ProductCard key={product?._id} product={product} />
                  ))}
                </div>

                {/* Sentinel for Infinite Scroll */}
                <div
                  ref={lastElementRef}
                  className="h-20 flex items-center justify-center mt-8"
                >
                  {isFetchingMore && (
                    <CircularProgress size={24} className="!text-accent" />
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
                      You've reached the end
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-32 bg-surface rounded-xl border border-border border-dashed">
                <p className="text-text-muted text-lg">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setFilters({ page: 1, limit: 12 });
                    setSearchQuery("");
                    setPriceRange([0, 1000]);
                  }}
                  className="mt-4 btn-primary btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
