import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X, ImagePlus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";

const initialForm = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  category: "",
  subcategory: "",
  subcategorySlug: "",
  stock: "",
  isActive: true,
  offerUpi: "",
  offerBank: "",
  offerCombo: "",
};

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useAdminProducts();
  const { categories } = useCategories();

  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Sizes / Colors / Highlights
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("#000000");
  const [highlights, setHighlights] = useState([]);
  const [highlightInput, setHighlightInput] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  // Changing category invalidates whatever subcategory was picked before,
  // since subcategories belong to a single parent category.
  function handleCategoryChange(e) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, category: value, subcategory: "", subcategorySlug: "" }));
  }

  function handleSubcategoryChange(e) {
    const slug = e.target.value;
    const selectedCategory = categories.find((c) => c.slug === form.category);
    const match = selectedCategory?.subcategories?.find((s) => s.slug === slug);
    setForm((prev) => ({
      ...prev,
      subcategorySlug: slug,
      subcategory: match?.name || "",
    }));
  }

  function handleImagesSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...imageFiles, ...files].slice(0, 5 - imageUrls.length);
    setImageFiles(combined);
    setPreviews(combined.map((file) => URL.createObjectURL(file)));
    setErrors((prev) => ({ ...prev, images: undefined }));
    e.target.value = "";
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addImageUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (imageFiles.length + imageUrls.length >= 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    setImageUrls((prev) => [...prev, url]);
    setUrlInput("");
    setErrors((prev) => ({ ...prev, images: undefined }));
  }

  function removeImageUrl(index) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  // Sizes
  function addSize() {
    const val = sizeInput.trim().toUpperCase();
    if (!val || sizes.includes(val)) return;
    setSizes((prev) => [...prev, val]);
    setSizeInput("");
  }
  function removeSize(size) {
    setSizes((prev) => prev.filter((s) => s !== size));
  }

  // Colors
  function addColor() {
    if (colors.includes(colorInput)) return;
    setColors((prev) => [...prev, colorInput]);
  }
  function removeColor(color) {
    setColors((prev) => prev.filter((c) => c !== color));
  }

  // Highlights
  function addHighlight() {
    const val = highlightInput.trim();
    if (!val) return;
    setHighlights((prev) => [...prev, val]);
    setHighlightInput("");
  }
  function removeHighlight(index) {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    if (!form.category) errs.category = "Category is required";
    if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Valid stock is required";
    if (imageFiles.length === 0 && imageUrls.length === 0) {
      errs.images = "At least one image is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      if (form.oldPrice) formData.append("oldPrice", form.oldPrice);
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory.trim());
      formData.append("subcategorySlug", form.subcategorySlug);
      formData.append("stock", form.stock);
      formData.append("isActive", form.isActive);

      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("highlights", JSON.stringify(highlights));
      formData.append("offers", JSON.stringify({
        upi: form.offerUpi.trim(),
        bank: form.offerBank.trim(),
        combo: form.offerCombo.trim(),
      }));

      imageFiles.forEach((file) => formData.append("images", file));
      imageUrls.forEach((url) => formData.append("imageUrls", url));

      await addProduct(formData);
      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  const totalImages = imageFiles.length + imageUrls.length;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate("/admin/products")} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            placeholder="e.g. Wireless Headphones" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            placeholder="Short product description" />
        </div>

        {/* Price + Old price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} step="0.01"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              placeholder="0.00" />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old price (optional)</label>
            <input type="number" name="oldPrice" value={form.oldPrice} onChange={handleChange} step="0.01"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              placeholder="For showing discount" />
          </div>
        </div>

        {/* Category + Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleCategoryChange}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            {(() => {
              const selectedCategory = categories.find((c) => c.slug === form.category);
              const subcats = selectedCategory?.subcategories || [];
              if (!form.category) {
                return (
                  <select disabled className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400">
                    <option>Select a category first</option>
                  </select>
                );
              }
              if (subcats.length === 0) {
                return (
                  <select disabled className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400">
                    <option>No subcategories yet</option>
                  </select>
                );
              }
              return (
                <select name="subcategorySlug" value={form.subcategorySlug} onChange={handleSubcategoryChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                  <option value="">Optional</option>
                  {subcats.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              );
            })()}
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            placeholder="0" />
          {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
        </div>

        {/* ── Sizes ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
          <div className="flex gap-2">
            <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
              placeholder="e.g. S, M, L, XL"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <button type="button" onClick={addSize} className="px-3 h-10 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {s}
                  <button type="button" onClick={() => removeSize(s)}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Colors ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Colors</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
              className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer" />
            <button type="button" onClick={addColor} className="px-3 h-10 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 flex items-center gap-1">
              <Plus size={14} /> Add Color
            </button>
          </div>
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map((c) => (
                <span key={c} className="flex items-center gap-1.5 rounded-full border border-gray-200 pl-1 pr-2 py-1 text-xs">
                  <span className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: c }} />
                  {c}
                  <button type="button" onClick={() => removeColor(c)}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Highlights ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Highlights</label>
          <div className="flex gap-2">
            <input type="text" value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHighlight(); } }}
              placeholder="e.g. Premium build quality"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <button type="button" onClick={addHighlight} className="px-3 h-10 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
          {highlights.length > 0 && (
            <ul className="mt-2 space-y-1">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                  {h}
                  <button type="button" onClick={() => removeHighlight(i)}><X size={13} className="text-gray-400" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Offers ── */}
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-semibold text-gray-800">Offers (optional)</label>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">UPI Offer</label>
            <input type="text" name="offerUpi" value={form.offerUpi} onChange={handleChange}
              placeholder="e.g. Flat 5% cashback on UPI, up to ₹75"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bank Offer</label>
            <input type="text" name="offerBank" value={form.offerBank} onChange={handleChange}
              placeholder="e.g. 10% instant discount on select cards"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Combo Offer</label>
            <input type="text" name="offerCombo" value={form.offerCombo} onChange={handleChange}
              placeholder="e.g. Buy 2, get extra 5% off"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product images (up to 5)</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
            {previews.map((src, i) => (
              <div key={`file-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt={`preview-${i}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Remove image">
                  <X size={12} />
                </button>
              </div>
            ))}
            {imageUrls.map((url, i) => (
              <div key={`url-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={`url-preview-${i}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImageUrl(i)} className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Remove image">
                  <X size={12} />
                </button>
              </div>
            ))}
            {totalImages < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <ImagePlus size={20} className="text-gray-400" />
                <span className="text-[11px] text-gray-400 mt-1">Add image</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesSelect} className="hidden" />
              </label>
            )}
          </div>
          {totalImages < 5 && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Paste image URL"
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <button type="button" onClick={addImageUrl} className="px-3 h-9 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                Add URL
              </button>
            </div>
          )}
          {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="rounded border-gray-300" />
          Active (visible in shop)
        </label>

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => navigate("/admin/products")} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}