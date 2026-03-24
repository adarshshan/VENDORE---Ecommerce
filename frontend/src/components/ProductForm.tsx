import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Product } from "../types/Product";
import { getCategories } from "../services/api";

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: FormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [stock, setStock] = useState<number | null>(null);
  const [images, setImages] = useState<(File | string | null | undefined)[]>(
    []
  );
  const [picMessage, setPicMessage] = useState<string | null>(null);

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

    if (product) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product?.description ?? "");
      // Handle both string ID and populated object
      setCategory(typeof product?.category === 'object' ? (product.category as any)._id : product?.category ?? "");
      setStock(product?.stock ?? 0);
      setImages(product.images ?? []);
    } else {
      setName("");
      setPrice(null);
      setDescription("");
      setCategory("");
      setStock(null);
      setImages([]);
    }
  }, [product]);

  const uploadImage = (pic: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!pic) {
        setPicMessage("Please Select an image!");
        return reject("No image selected");
      }
      if (pic.type !== "image/jpeg" && pic.type !== "image/png") {
        setPicMessage("please select a valid image.");
        return reject("Invalid image type");
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
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
          if (data.url) {
            resolve(data.url.toString());
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
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price ? price.toString() : "0");
    formData.append("description", description);
    formData.append("category", category);
    formData.append("stock", stock ? stock.toString() : "0");

    if (images.length > 0) {
      try {
        // Separate existing image URLs from new File objects
        const existingImageUrls = images.filter(
          (img): img is string => typeof img === "string"
        );
        const newImageFiles = images.filter(
          (img): img is File => img instanceof File
        );

        // Upload only the new files
        const newImageUrls = await Promise.all(
          newImageFiles.map((file) => uploadImage(file))
        );

        // Combine old and new URLs
        const allImageUrls = [...existingImageUrls, ...newImageUrls];

        if (allImageUrls.length > 0)
          formData.append("images", JSON.stringify(allImageUrls));
      } catch (error) {
        setPicMessage("Image upload failed. Please try again.");
        return;
      }
    }
    onSave(formData);
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
      className="w-full max-w-lg mx-auto !shadow-none !bg-transparent rounded-xl"
    >
      <Typography
        variant="h5"
        className="font-bold text-gray-800 mb-6 text-center"
      >
        {product ? "Edit Product" : "Add Product"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="name"
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          required
          className="rounded-md"
          InputProps={{
            className: "text-gray-700",
          }}
          InputLabelProps={{
            className: "text-gray-600",
          }}
        />
        <TextField
          id="price"
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          variant="outlined"
          fullWidth
          required
          className="rounded-md"
          InputProps={{
            className: "text-gray-700",
          }}
          InputLabelProps={{
            className: "text-gray-600",
          }}
        />
        <TextField
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          className="rounded-md"
          InputProps={{
            className: "text-gray-700",
          }}
          InputLabelProps={{
            className: "text-gray-600",
          }}
        />
        <TextField
          id="category"
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          fullWidth
          required
          className="rounded-md"
        >
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="stock"
          label="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          variant="outlined"
          fullWidth
          required
          className="rounded-md"
          InputProps={{
            className: "text-gray-700",
          }}
          InputLabelProps={{
            className: "text-gray-600",
          }}
        />
        <Box>
          <Typography
            variant="body1"
            className="text-gray-600 font-semibold mb-2"
          >
            Product Images
          </Typography>
          <input
            id="images"
            type="file"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <div className="flex gap-2 mt-2">
            {images.map((image, index) => {
              const imageUrl =
                typeof image === "string"
                  ? image
                  : URL.createObjectURL(image as Blob);
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
        <Box className="flex justify-between mt-6">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            className="border-gray-500 text-gray-700 hover:bg-gray-100 font-bold py-2 px-4 rounded-md"
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductForm;
