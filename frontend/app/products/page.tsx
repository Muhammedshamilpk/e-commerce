
"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

import {
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  X,
  Upload,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Product Type
type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
};

// Backend Response Type
type ProductApiResponse = {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  price: number | null;
  stock: number | null;
  status: string | null;
  image: string | null;
};

// Product Form Type
type ProductForm = {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  image: string;
};

// Convert Backend Data into Frontend Product Format
const formatProduct = (data: ProductApiResponse): Product => ({
  id: data.id,
  name: data.name,
  sku: data.sku ?? "",
  category: data.category ?? "",
  price: data.price ?? 0,
  stock: data.stock ?? 0,
  status:
    data.status ??
    ((data.stock ?? 0) > 0 ? "Active" : "Out of Stock"),
  image: data.image || "📦",
});

// Empty Product Form
const emptyProduct: ProductForm = {
  name: "",
  sku: "",
  category: "Water Purifier",
  price: "",
  stock: "",
  image: "",
};

export default function ProductsPage() {
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(
    null
  );

  const [newProduct, setNewProduct] = useState<ProductForm>({
    ...emptyProduct,
  });

  const [error, setError] = useState("");

  // Load Products from Backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setApiError("");

        if (!API_URL) {
          throw new Error(
            "API URL is missing. Check your frontend .env.local file."
          );
        }

        const response = await fetch(`${API_URL}/product/`);

        if (!response.ok) {
          throw new Error("Failed to load products from the server.");
        }

        const data: ProductApiResponse[] = await response.json();

        setProducts(data.map(formatProduct));
      } catch (err) {
        setApiError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Reset Form
  const resetForm = () => {
    setNewProduct({ ...emptyProduct });
    setEditingProductId(null);
    setError("");
  };

  // Open Add Modal
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Search and Category Filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  // Image Upload Function
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PNG, JPG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewProduct((previous) => ({
          ...previous,
          image: reader.result as string,
        }));

        setError("");
      }
    };

    reader.readAsDataURL(file);
  };

  // Add or Update Product through Backend API
  const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const name = newProduct.name.trim();
    const sku = newProduct.sku.trim();

    if (!name || !sku) {
      setError("Please enter product name and SKU.");
      return;
    }

    // Check Duplicate SKU
    const duplicateSKU = products.some(
      (product) =>
        product.sku.toLowerCase() === sku.toLowerCase() &&
        product.id !== editingProductId
    );

    if (duplicateSKU) {
      setError("This SKU already exists. Please enter a different SKU.");
      return;
    }

    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);

    if (
      newProduct.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(price)
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      newProduct.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    const productData = {
      name,
      sku,
      category: newProduct.category,
      price,
      stock,
      image: newProduct.image || "📦",
    };

    try {
      if (!API_URL) {
        throw new Error("API URL is missing. Check your .env.local file.");
      }

      setSaving(true);

      const isEditing = editingProductId !== null;

      const response = await fetch(
        isEditing
          ? `${API_URL}/product/${editingProductId}`
          : `${API_URL}/product/`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.detail || "Unable to save the product.");
      }

      const savedProduct: ProductApiResponse = await response.json();
      const formattedProduct = formatProduct(savedProduct);

      if (isEditing) {
        setProducts((previous) =>
          previous.map((product) =>
            product.id === editingProductId ? formattedProduct : product
          )
        );
      } else {
        setProducts((previous) => [...previous, formattedProduct]);
      }

      setApiError("");
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit Product
  const handleEdit = (product: Product) => {
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
    });

    setEditingProductId(product.id);
    setError("");
    setShowModal(true);
  };

  // Delete Product through Backend API
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      if (!API_URL) {
        throw new Error("API URL is missing. Check your .env.local file.");
      }

      const response = await fetch(`${API_URL}/product/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.detail || "Unable to delete product.");
      }

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );

      setApiError("");
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  // ==========================
  // MAIN UI
  // ==========================

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Products
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Manage your store products and inventory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* API Error */}
      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {apiError}
        </p>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Total Products</p>
          <h3 className="text-2xl font-bold mt-3 text-slate-800">
            {products.length}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Active Products</p>
          <h3 className="text-2xl font-bold mt-3 text-green-600">
            {products.filter((p) => p.status === "Active").length}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <h3 className="text-2xl font-bold mt-3 text-red-600">
            {products.filter((p) => p.status === "Out of Stock").length}
          </h3>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Search and Filter */}
        <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Water Purifier">Water Purifier</option>
              <option value="Water Softener">Water Softener</option>
              <option value="Filters">Filters</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.image.startsWith("data:image/") ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl">
                            {product.image}
                          </span>
                        )}
                      </div>

                      <span className="font-medium text-slate-800 whitespace-nowrap">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {product.sku}
                  </td>

                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {product.stock}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit product"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete product"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    {loading ? "Loading products..." : "No products found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add New Product"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {editingProductId !== null
                    ? "Update the product information."
                    : "Enter the details of your new product."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Product Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">

              {/* Product Name */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Product Name
                </label>

                <input
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  SKU
                </label>

                <input
                  required
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      sku: e.target.value,
                    })
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SKU"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Water Purifier">Water Purifier</option>
                  <option value="Water Softener">Water Softener</option>
                  <option value="Filters">Filters</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Product Image
                </label>

                <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50">
                  {newProduct.image.startsWith("data:image/") ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={newProduct.image}
                        alt="Product preview"
                        className="w-32 h-32 object-contain rounded-lg bg-white border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            image: "",
                          })
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        size={35}
                        className="mx-auto text-slate-400 mb-2"
                      />

                      <p className="text-sm text-slate-600">
                        Upload product image
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG or WEBP (Maximum 2 MB)
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="w-full mt-4 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:font-medium hover:file:bg-blue-200"
                  />
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Price (₹)
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: e.target.value,
                      })
                    }
                    className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Price"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Stock
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: e.target.value,
                      })
                    }
                    className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quantity"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProductId !== null
                      ? "Save Changes"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
