"use client";
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Product, ProductSize, ProductImage } from "@/src/types/Product";
import { getCategories, getSellers } from "@/src/services/api";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: FormData) => void | Promise<void>;
  onCancel: () => void;
  handleDeleteProduct?: (id: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  handleDeleteProduct,
}) => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [sellers, setSellers] = useState<any[]>([]);
  const [stock, setStock] = useState<number>(0);
  const [weight, setWeight] = useState<number>(100);
  const [hasSizes, setHasSizes] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);
  const [images, setImages] = useState<
    (File | ProductImage | null | undefined)[]
  >([]);
  const [picMessage, setPicMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCatsAndSellers = async () => {
      try {
        const [catsData, sellersData] = await Promise.all([
          getCategories("Active"),
          getSellers(),
        ]);
        setAvailableCategories(catsData);
        if (sellersData.success) {
          setSellers(sellersData.sellers);
        }
      } catch (error) {
        console.error("Failed to fetch categories or sellers", error);
      }
    };
    fetchCatsAndSellers();

    if (product) {
      setName(product?.name);
      setPrice(product?.price);
      setDescription(product?.description ?? "");

      // Handle multiple categories
      if (product?.categories && Array.isArray(product?.categories)) {
        setSelectedCategoryIds(
          product?.categories?.map((cat: any) =>
            typeof cat === "object" ? cat?._id : cat,
          ),
        );
      } else if (product.category) {
        const categoryId =
          typeof product?.category === "object"
            ? (product?.category as any)?._id
            : product?.category;
        setSelectedCategoryIds([categoryId]);
      } else {
        setSelectedCategoryIds([]);
      }

      const sellerIdStr =
        typeof product?.sellerId === "object"
          ? (product?.sellerId as any)?._id
          : (product?.sellerId ?? "");
      setSellerId(sellerIdStr);

      setStock(product?.stock ?? 0);
      setWeight(product?.weight ?? 100);
      setHasSizes(product?.hasSizes ?? false);

      const normalizedSizes = (product?.sizes ?? [])?.map((s: any) => {
        if (typeof s === "string") return { size: s, stock: 0 };
        return { size: s?.size, stock: s?.stock ?? 0 };
      });
      setSelectedSizes(normalizedSizes);

      setImages(product?.images ?? []);
    } else {
      setName("");
      setPrice(null);
      setDescription("");
      setSelectedCategoryIds([]);
      setSellerId("");
      setStock(0);
      setWeight(100);
      setHasSizes(false);
      setSelectedSizes([]);
      setImages([]);
    }
  }, [product]);

  const handleCategoryChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setSelectedCategoryIds(
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) {
        return prev.filter((s) => s.size !== size);
      } else {
        return [...prev, { size: size, stock: 0 }];
      }
    });
  };

  const handleSizeStockChange = (size: string, stock: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock } : s)),
    );
  };

  const uploadImage = (pic: File): Promise<ProductImage> => {
    return new Promise((resolve, reject) => {
      if (!pic) {
        setPicMessage("Please Select an image!");
        return reject("No image selected");
      }
      if (pic.type !== "image/jpeg" && pic.type !== "image/png") {
        setPicMessage("please select a valid image.");
        return reject("Invalid image type");
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", uploadPreset);
      data.append("cloud_name", cloudName);

      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.url && data?.public_id) {
            resolve({
              url: data?.url.toString(),
              public_id: data?.public_id.toString(),
            });
          } else {
            reject("Cloudinary upload failed");
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPicMessage(null);

    if (hasSizes && selectedSizes.length === 0) {
      setPicMessage("Please select at least one size.");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setPicMessage("Please select at least one category.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price ? price.toString() : "0");
    formData.append("description", description);
    formData.append("categories", JSON.stringify(selectedCategoryIds));
    formData.append("sellerId", sellerId);
    formData.append("weight", weight.toString());
    formData.append("hasSizes", hasSizes.toString());

    if (hasSizes) {
      formData.append("sizes", JSON.stringify(selectedSizes));
      formData.append("stock", "0");
    } else {
      formData.append("stock", stock ? stock.toString() : "0");
      formData.append("sizes", "[]");
    }

    if (images.length > 0) {
      try {
        const existingImages = images.filter(
          (img): img is ProductImage =>
            typeof img === "object" && img !== null && "url" in img,
        );
        const newImageFiles = images.filter(
          (img): img is File => img instanceof File,
        );

        const newImageObjects = await Promise.all(
          newImageFiles.map((file) => uploadImage(file)),
        );

        const allImages = [...existingImages, ...newImageObjects];

        if (allImages?.length > 0)
          formData.append("images", JSON.stringify(allImages));
      } catch (error) {
        setPicMessage("Image upload failed. Please try again.");
        setLoading(false);
        return;
      }
    }
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <Paper
      elevation={3}
      className="w-full max-h-[90vh] overflow-y-scroll !shadow-none !bg-transparent rounded-xl !text-[var(--color-text-light)] px-5"
    >
      <Typography variant="h5" className="font-bold mb-6 text-center">
        {product ? "Edit Product" : "Add Product"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} className="!space-y-4">
        <TextField
          id="name"
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          required
          className="rounded-md"
          slotProps={{
            input: {
              className:
                "!text-[var(--color-text-light)] border border-[var(--color-border)]",
            },
          }}
        />
        <div className="flex gap-4 items-center">
          <TextField
            id="price"
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            variant="outlined"
            fullWidth
            required
            slotProps={{
              input: {
                className:
                  "!text-[var(--color-text-light)] border border-[var(--color-border)]",
              },
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={hasSizes}
                onChange={(e) => setHasSizes(e.target.checked)}
                color="primary"
              />
            }
            label="Has Sizes?"
            className="text-[var(--color-text-light)] min-w-fit"
          />
        </div>

        {!hasSizes ? (
          <TextField
            id="stock"
            label="Global Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            variant="outlined"
            fullWidth
            required
            slotProps={{
              input: {
                className:
                  "!text-[var(--color-text-light)] border border-[var(--color-border)]",
              },
            }}
          />
        ) : (
          <Box className="p-4 border border-border rounded-lg bg-surface-light/30">
            <Typography
              variant="subtitle2"
              className="mb-3 font-bold uppercase tracking-wider text-accent"
            >
              Size-Specific Stock
            </Typography>
            <FormGroup row className="mb-4">
              {AVAILABLE_SIZES.map((size) => (
                <FormControlLabel
                  key={size}
                  control={
                    <Checkbox
                      checked={!!selectedSizes.find((s) => s.size === size)}
                      onChange={() => handleSizeToggle(size)}
                      size="small"
                      sx={{
                        color: "var(--color-border-light)",
                        "&.Mui-checked": { color: "var(--color-accent)" },
                      }}
                    />
                  }
                  label={size}
                  className="text-[var(--color-text-light)]"
                />
              ))}
            </FormGroup>

            <div className="grid grid-cols-2 gap-3">
              {selectedSizes.map((s) => (
                <TextField
                  key={s.size}
                  label={`Stock for ${s.size}`}
                  type="number"
                  size="small"
                  value={s.stock}
                  onChange={(e) =>
                    handleSizeStockChange(s.size, Number(e.target.value))
                  }
                  variant="outlined"
                  slotProps={{
                    input: {
                      className:
                        "!text-[var(--color-text-light)] border border-[var(--color-border)]",
                    },
                  }}
                />
              ))}
            </div>
          </Box>
        )}

        <div className="flex flex-col gap-4">
          <FormControl fullWidth required>
            <InputLabel
              id="categories-label"
              className="!text-[var(--color-text-muted)]"
            >
              Categories
            </InputLabel>
            <Select
              labelId="categories-label"
              id="categories"
              multiple
              value={selectedCategoryIds}
              onChange={handleCategoryChange}
              input={
                <OutlinedInput
                  label="Categories"
                  className="!text-[var(--color-text-light)] border border-[var(--color-border)]"
                />
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected?.map((value) => {
                    const cat = availableCategories.find(
                      (c) => c._id === value,
                    );
                    return (
                      <Chip
                        key={value}
                        label={cat?.name || value}
                        size="small"
                        className="!bg-accent/20 !text-accent font-bold"
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      bgcolor: "var(--color-surface)",
                      color: "var(--color-text-light)",
                    },
                  },
                },
              }}
            >
              {availableCategories?.map((cat) => (
                <MenuItem key={cat?._id} value={cat?._id}>
                  <Checkbox
                    checked={selectedCategoryIds.indexOf(cat?._id) > -1}
                  />
                  {cat?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id="seller"
            select
            label="Seller"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            variant="outlined"
            fullWidth
            className="rounded-md"
            slotProps={{
              input: {
                className:
                  "!text-[var(--color-text-light)] border border-[var(--color-border)]",
              },
            }}
          >
            <MenuItem value="">
              <em>None (Admin)</em>
            </MenuItem>
            {sellers?.map((seller) => (
              <MenuItem key={seller?._id} value={seller?._id}>
                {seller?.name} ({seller?.email})
              </MenuItem>
            ))}
          </TextField>
        </div>

        <TextField
          id="weight"
          label="Product Weight (grams)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          variant="outlined"
          fullWidth
          required
          slotProps={{
            input: {
              className:
                "!text-[var(--color-text-light)] border border-[var(--color-border)]",
            },
          }}
          helperText="Used for delivery charge calculation"
        />

        <TextField
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          slotProps={{
            input: {
              className:
                "!text-[var(--color-text-light)] border border-[var(--color-border)]",
            },
          }}
        />
        <Box>
          <Typography variant="body1" className="font-semibold mb-2">
            Product Images
          </Typography>
          <input
            id="images"
            type="file"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm !text-[var(--color-text-light)]
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <div className="flex gap-2 mt-2">
            {images?.map((image, index) => {
              const imageUrl =
                image instanceof File
                  ? URL.createObjectURL(image)
                  : (image as ProductImage)?.url;
              return (
                <Box key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`preview ${index}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white hover:bg-red-700 p-0.5"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </div>
          <Typography variant="body1" className="text-red-600 font-normal mb-2">
            {picMessage}
          </Typography>
        </Box>

        <Box className="flex justify-between mt-3 gap-3">
          {product && handleDeleteProduct ? (
            <button
              onClick={() => handleDeleteProduct(String(product?._id))}
              className="!border-gray-500 !text-red-500 hover:!bg-red-50 !font-bold !py-2 !px-4 !rounded-md"
            >
              Delete
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              className="!border-[var(--color-border)] !text-[var(--color-text-light)] hover:!text-[#000000] hover:!bg-gray-100 !font-bold !py-2 !px-4 !rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className="!border-[var(--color-border)] !bg-transparent hover:!bg-accent hover:!text-white !text-[var(--color-text-light)] !font-bold !py-2 !px-4 !rounded-md"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};
export default ProductForm;

