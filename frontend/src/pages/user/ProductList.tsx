import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProducts, getCategories } from "../../services/api";
import type { ProductFilters } from "../../services/api";
import ProductCard from "../../components/ProductCard";
import {
  Box,
  Drawer,
  Slider,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

const ProductList: React.FC = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <Box sx={{ p: 3, width: 250 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Box mb={3}>
        <Typography gutterBottom>Category</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.category || "All"}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box mb={3}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
        />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">${priceRange[0]}</Typography>
          <Typography variant="body2">${priceRange[1]}</Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={applyFilters}
        sx={{ bgcolor: "pink.500", "&:hover": { bgcolor: "pink.600" } }}
      >
        Apply Filters
      </Button>
    </Box>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setMobileOpen(true)}
            variant="outlined"
          >
            Filters
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <FilterContent />
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <FilterContent />
        </Drawer>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Our Collection</h2>

            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
                <SearchIcon
                  className="absolute left-3 top-2.5 text-gray-400"
                  fontSize="small"
                />
              </div>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filters.sort || "newest"}
                  onChange={handleSortChange}
                  displayEmpty
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">Loading products...</div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">
              Error loading products. Please try again.
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
