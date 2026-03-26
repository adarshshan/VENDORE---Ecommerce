import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProducts, getCategories } from "../../services/api";
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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "var(--color-surface)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
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
  color: "white",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
    "&::placeholder": {
      color: "var(--color-text-secondary)", // or any color you want
      opacity: 1, // important for some browsers
    },
  },
}));

const ProductList: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchQuery.trim() || undefined,
      }));
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      search: searchQuery || undefined,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === "All" ? undefined : category,
    }));
  };

  const handleSortChange = (event: any) => {
    setFilters((prev) => ({
      ...prev,
      sort: event.target.value,
    }));
  };

  const FilterContent = () => (
    <div className="p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-6 text-white border-b border-border pb-4">
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
                ? "bg-accent text-black font-bold"
                : "text-text-secondary hover:bg-surface-light hover:text-white"
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
                    ? "bg-accent text-black font-bold"
                    : "text-text-secondary hover:bg-surface-light hover:text-white"
                }`}
              >
                {cat?.name}
              </button>
            ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="label uppercase tracking-wider text-xs font-bold mb-3 block text-[var(--color-text-light)]">
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
                bgcolor: "white",
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
        className="border border-[var(--color-border)] hover:border-[var(--color-border-light)] opacity-80 hover:opacity-95 btn-primary w-full mt-auto text-[var(--color-text-light)] py-2"
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem]">
      <div className="container-custom py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-white mb-2">
              Our Collection
            </h1>
            <p className="text-text-secondary max-w-lg">
              Discover our latest styles and seasonal favorites designed for
              comfort and play.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Search className="bg-surface !border-border focus:!border-accent placeholder:text-text-secondary">
              <SearchIconWrapper>
                <SearchIcon className="text-text-secondary" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  e.key === "Enter" && applyFilters();
                }}
              />
              {/* Clear Button - appears only when there is text */}
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery(""); // clear local state
                    setFilters((prev) => ({
                      // immediately clear search in filters
                      ...prev,
                      search: undefined,
                    }));
                  }}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-secondary)",
                    "&:hover": {
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Search>

            <div className="w-full sm:w-auto">
              <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
                <Select
                  value={filters.sort || "newest"}
                  onChange={handleSortChange}
                  displayEmpty
                  IconComponent={ExpandMoreIcon}
                  sx={{
                    bgcolor: "var(--color-surface)",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    "& .MuiSelect-icon": { color: "white" },
                    "& fieldset": { border: "none" },
                  }}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </div>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden btn-secondary px-4 py-2.5 flex items-center justify-center gap-2"
            >
              <FilterListIcon fontSize="small" />
              Filters
            </button>
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
                    className="card h-[400px] animate-pulse bg-surface-light"
                  ></div>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4">
                {products?.map((product) => (
                  <ProductCard key={product?._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-surface rounded-xl border border-border border-dashed">
                <p className="text-text-muted text-lg">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setFilters({});
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
