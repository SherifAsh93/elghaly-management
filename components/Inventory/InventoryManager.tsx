import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, X, ShoppingCart } from "lucide-react";
import { ProductItem, UserRole, Client, Sale } from "../../types";
import {
  formatCurrency,
  toArabicDigits,
  formatStockDisplay,
} from "../../utils/calculations";

interface InventoryManagerProps {
  products: ProductItem[];
  clients: Client[];
  onAddProduct: (p: Omit<ProductItem, "id">) => void;
  onUpdateProduct: (id: string, p: Partial<ProductItem>) => void;
  onDeleteProduct: (id: string) => void;
  onSellProduct: (
    productId: string,
    quantity: number,
    unitPrice: number,
    clientId: string,
    paidAmount: number,
    discount: number,
  ) => void;
  onAddSale: (sale: Omit<Sale, "id" | "date">) => void;
  role: UserRole;
  openAddModal?: boolean;
  refreshData: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  clients,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSellProduct,
  onAddSale,
  role,
  openAddModal,
  refreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [sellDiscount, setSellDiscount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Shopping cart state
  const [sellCart, setSellCart] = useState<ProductItem[]>([]);
  const [showQuickAddPopup, setShowQuickAddPopup] = useState(false);
  const [showSellCartPopup, setShowSellCartPopup] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<ProductItem | null>(
    null,
  );
  const [quickAddBundles, setQuickAddBundles] = useState("");
  const [quickAddBoards, setQuickAddBoards] = useState("");
  const [quickAddPrice, setQuickAddPrice] = useState("");
  const [cartData, setCartData] = useState<{
    [key: string]: { bundles: string; boards: string; unitPrice: string };
  }>({});

  // Reset cart to empty for fresh start
  const resetCart = useCallback(() => {
    setSellCart([]);
    setCartData({});
  }, []);

  const isAdmin = role === "ADMIN";

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    origin: null as string | null,
    length: "",
    width: "",
    thickness: "",
    bundles: "",
    boardsPerBundle: "",
    remainingBoards: "",
    buyPrice: "",
    sellPrice: "",
    code: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        // Validation for remainingBoards consistency
        const maxRemainingBoards = formData.bundles * formData.boardsPerBundle;
        if (formData.remainingBoards > maxRemainingBoards) {
          alert(
            `عدد الألواح المتبقية (${formData.remainingBoards}) لا يمكن أن يتجاوز سعة الربط (${maxRemainingBoards} لوح)`,
          );
          setIsLoading(false);
          return;
        }

        const calculatedRemainingBoards = editingId
          ? formData.remainingBoards
          : 0;

        const submitData = {
          name: formData.name,
          type: formData.type,
          origin: formData.origin,
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          thickness: parseFloat(formData.thickness) || 0,
          bundles: parseFloat(formData.bundles) || 0,
          boardsPerBundle: parseFloat(formData.boardsPerBundle) || 0,
          remainingBoards: calculatedRemainingBoards,
          buyPrice: parseFloat(formData.buyPrice) || 0,
          sellPrice: parseFloat(formData.sellPrice) || 0,
          code: formData.code,
        };

        if (editingId) {
          await onUpdateProduct(editingId, submitData);
        } else {
          await onAddProduct(submitData);
        }

        // Refresh data to update home page
        refreshData();

        // Reset form
        setFormData({
          name: "",
          type: "",
          origin: null as string | null,
          length: "",
          width: "",
          thickness: "",
          bundles: "",
          boardsPerBundle: "",
          remainingBoards: "",
          buyPrice: "",
          sellPrice: "",
          code: "",
        });
        setIsModalOpen(false);
        setEditingId(null);
      } catch (error) {
        console.error("Error saving product:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, editingId, onAddProduct, onUpdateProduct],
  );

  // Shopping cart functions
  const openQuickAddPopup = (product: ProductItem) => {
    setQuickAddProduct(product);
    setQuickAddBundles("");
    setQuickAddBoards("");
    setQuickAddPrice(product.sellPrice.toString());
    setShowQuickAddPopup(true);
  };

  const addToCart = useCallback(() => {
    if (quickAddProduct) {
      const requestedBundles = parseFloat(quickAddBundles || "0");
      const requestedBoards = parseFloat(quickAddBoards || "0");

      if (requestedBundles === 0 && requestedBoards === 0) {
        alert("رجاء إضافة كمية");
        return;
      }

      // Inventory availability validation
      const availableBundles = quickAddProduct.bundles;
      const availableRemainingBoards = quickAddProduct.remainingBoards;
      const totalAvailableBoards =
        availableBundles * quickAddProduct.boardsPerBundle +
        availableRemainingBoards;
      const totalRequestedBoards =
        requestedBundles * quickAddProduct.boardsPerBundle + requestedBoards;

      if (requestedBundles > availableBundles) {
        alert(`لا يوجد ربط كافي للبيع. المتاح: ${availableBundles} ربط`);
        return;
      }

      if (totalRequestedBoards > totalAvailableBoards) {
        alert(
          `الكمية المطلوبة غير متوفرة في المخزن. المتاح: ${totalAvailableBoards} لوح`,
        );
        return;
      }

      // Add to cart if not already there
      if (!sellCart.find((p) => p.id === quickAddProduct.id)) {
        setSellCart((prev) => [...prev, quickAddProduct]);
      }

      // Update cart data - use functional update to avoid stale state
      setCartData((prev) => {
        const newData = {
          ...prev,
          [quickAddProduct.id]: {
            bundles: requestedBundles.toString(),
            boards: requestedBoards.toString(),
            unitPrice: quickAddPrice,
          },
        };
        return newData;
      });

      // Close popup and reset
      setShowQuickAddPopup(false);
      setQuickAddProduct(null);
      setQuickAddBundles("");
      setQuickAddBoards("");
      setQuickAddPrice("");
    }
  }, [
    quickAddProduct,
    quickAddBundles,
    quickAddBoards,
    quickAddPrice,
    sellCart,
  ]);

  const removeFromCart = useCallback(
    (productId: string) => {
      setSellCart(sellCart.filter((p) => p.id !== productId));
      const newCartData = { ...cartData };
      delete newCartData[productId];
      setCartData(newCartData);
    },
    [sellCart, cartData],
  );

  const updateCartItem = useCallback(
    (
      productId: string,
      field: "bundles" | "boards" | "unitPrice",
      value: string,
    ) => {
      // Find the product in inventory
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      // Get current cart data
      const currentCartData = cartData[productId] || {
        bundles: "0",
        boards: "0",
        unitPrice: product.sellPrice.toString(),
      };

      // Calculate new values
      const newBundles =
        field === "bundles"
          ? parseFloat(value || "0")
          : parseFloat(currentCartData.bundles || "0");
      const newBoards =
        field === "boards"
          ? parseFloat(value || "0")
          : parseFloat(currentCartData.boards || "0");

      // Inventory availability validation
      const availableBundles = product.bundles;
      const availableRemainingBoards = product.remainingBoards;
      const totalAvailableBoards =
        availableBundles * product.boardsPerBundle + availableRemainingBoards;
      const totalRequestedBoards =
        newBundles * product.boardsPerBundle + newBoards;

      if (newBundles > availableBundles) {
        alert(`لا يوجد ربط كافي للبيع. المتاح: ${availableBundles} ربط`);
        return;
      }

      if (totalRequestedBoards > totalAvailableBoards) {
        alert(
          `الكمية المطلوبة غير متوفرة في المخزن. المتاح: ${totalAvailableBoards} لوح`,
        );
        return;
      }

      setCartData((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: value,
        },
      }));
    },
    [products, cartData],
  );

  const processSellCart = useCallback(async () => {
    if (sellCart.length === 0) return;
    if (!selectedClient) return;

    // Validate that at least one item has quantities
    const hasValidItems = sellCart.some((product) => {
      const bundles = parseFloat(cartData[product.id]?.bundles || "0");
      const boards = parseFloat(cartData[product.id]?.boards || "0");
      return bundles > 0 || boards > 0;
    });

    if (!hasValidItems) {
      alert("رجاء إضافة كميات للمنتجات في السلة");
      return;
    }

    setIsLoading(true);

    try {
      // Calculate totals for all items in cart
      let totalAmount = 0;
      const totalDiscount =
        sellDiscount && sellDiscount.trim() !== ""
          ? parseFloat(sellDiscount)
          : 0;
      const saleItems = [];

      sellCart.forEach((product) => {
        const bundles = parseFloat(cartData[product.id]?.bundles || "0");
        const boards = parseFloat(cartData[product.id]?.boards || "0");
        const unitPrice = parseFloat(
          cartData[product.id]?.unitPrice || product.sellPrice.toString(),
        );
        const productBoards = bundles * product.boardsPerBundle + boards;
        const productAmount = productBoards * unitPrice;
        totalAmount += productAmount;

        saleItems.push({
          productId: product.id,
          productName: product.name,
          bundlesQuantity: bundles,
          boardsQuantity: boards,
          boardsPerBundle: product.boardsPerBundle,
          unitPrice: unitPrice,
          totalPrice: productAmount,
        });
      });

      const finalAmount = Math.max(0, totalAmount - totalDiscount);
      const client = clients.find((c) => c.id === selectedClient);
      if (!client) return;

      let paid = parseFloat(paidAmount || "0");
      // Don't auto-set paid amount - use what user entered or 0

      // Create single sale record with all items
      await onAddSale({
        clientId: selectedClient,
        clientName: client.name,
        items: saleItems,
        totalAmount: totalAmount,
        discount: totalDiscount,
        finalAmount: finalAmount,
        paidAmount: paid,
        status: paid >= finalAmount ? "PAID" : "PARTIAL",
      });

      // Update inventory quantities for each product
      const updatePromises = sellCart.map((product) => {
        const bundles = parseFloat(cartData[product.id]?.bundles || "0");
        const boards = parseFloat(cartData[product.id]?.boards || "0");

        // Update inventory quantities only (no individual sales)
        const updatedProduct = {
          ...product,
          bundles: product.bundles - bundles,
          remainingBoards: product.remainingBoards - boards,
        };

        return onUpdateProduct(product.id, updatedProduct);
      });

      await Promise.all(updatePromises);

      // Refresh data to update home page
      refreshData();

      // Reset cart
      setShowSellCartPopup(false);
      resetCart();
      setSelectedClient("");
      setSellDiscount("0");
      setPaidAmount("");
    } catch (error) {
      console.error("Error processing sale:", error);
      alert("حدث خطأ أثناء معالجة البيع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }, [
    sellCart,
    cartData,
    selectedClient,
    sellDiscount,
    paidAmount,
    clients,
    onAddSale,
    onUpdateProduct,
    resetCart,
  ]);

  const openSellModal = (p: any) => {
    setSelectedClient("");
    setSellDiscount("0");
    setPaidAmount("");
  };

  const openModal = (p?: ProductItem) => {
    if (p) {
      setEditingId(p.id);
      // Load product data into form for editing
      setFormData({
        name: p.name,
        type: p.type,
        origin: p.origin,
        length: p.length.toString(),
        width: p.width.toString(),
        thickness: p.thickness.toString(),
        bundles: p.bundles.toString(),
        boardsPerBundle: p.boardsPerBundle.toString(),
        remainingBoards: p.remainingBoards.toString(),
        buyPrice: p.buyPrice.toString(),
        sellPrice: p.sellPrice.toString(),
        code: p.code,
      });
    } else {
      setEditingId(null);
      // Reset form for new product
      setFormData({
        name: "",
        type: "",
        origin: null,
        length: "",
        width: "",
        thickness: "",
        bundles: "",
        boardsPerBundle: "",
        remainingBoards: "",
        buyPrice: "",
        sellPrice: "",
        code: "",
      });
    }
    setIsModalOpen(true);
  };

  // Remove automatic modal opening - only open when user clicks button

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute right-3 top-3 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mr-4">
            {/* Shopping Cart Button */}
            <button
              onClick={() => setShowSellCartPopup(true)}
              className="relative bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>سلة البيع</span>
              {sellCart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {sellCart.length}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                إضافة منتج
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
        <table className="w-full text-right text-sm compact-table">
          <thead className="bg-slate-50 text-sm font-black text-slate-400 border-b-2 border-slate-300">
            <tr>
              <th className="px-6 py-5">كود</th>
              <th className="px-6 py-5">اسم الصنف</th>
              <th className="px-6 py-5">النوع</th>
              <th className="text-center px-6 py-5">الكمية الحالية</th>
              <th className="px-6 py-5">سعر البيع</th>
              {isAdmin && <th className="text-center px-6 py-5">إجراء</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                <td className="font-mono text-[10px] px-4 py-3">{p.code}</td>
                <td className="font-bold text-slate-700 px-6 py-3">{p.name}</td>
                <td className="text-slate-500 text-sm px-6 py-3">{p.type}</td>
                <td className="text-center text-slate-500 px-6 py-3">
                  <span className="font-bold text-lg text-slate-900">
                    {formatStockDisplay(p)}
                  </span>
                </td>
                <td className="font-bold text-emerald-600 px-6 py-3">
                  {formatCurrency(p.sellPrice)}
                </td>
                {isAdmin && (
                  <td className="text-center px-6 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openQuickAddPopup(p)}
                        className="p-1.5 bg-emerald-500 text-white rounded-md"
                      >
                        <ShoppingCart size={14} />
                      </button>
                      <button
                        onClick={() => openModal(p)}
                        className="p-1.5 bg-blue-500 text-white rounded-md"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `هل أنت متأكد من حذف المنتج "${p.name}"؟`,
                            )
                          ) {
                            onDeleteProduct(p.id);
                            // Refresh data to update home page
                            refreshData();
                          }
                        }}
                        className="p-1.5 bg-red-500 text-white rounded-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl p-5 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 text-slate-300 hover:text-red-500"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-black mb-6">
              {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    اسم الصنف
                  </label>
                  <input
                    type="text"
                    placeholder="اسم الصنف"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    النوع
                  </label>
                  <input
                    type="text"
                    placeholder="النوع"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    البلد
                  </label>
                  <input
                    type="text"
                    placeholder="البلد"
                    value={formData.origin || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, origin: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الكود
                  </label>
                  <input
                    type="text"
                    placeholder="الكود"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الطول
                  </label>
                  <input
                    type="number"
                    placeholder="الطول"
                    value={formData.length}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        length: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    العرض
                  </label>
                  <input
                    type="number"
                    placeholder="العرض"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        width: e.target.value ? parseFloat(e.target.value) : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    السماكة
                  </label>
                  <input
                    type="number"
                    placeholder="السماكة"
                    value={formData.thickness}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thickness: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الربط
                  </label>
                  <input
                    type="number"
                    placeholder="الربط"
                    value={formData.bundles}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bundles: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    لوح في الربطة
                  </label>
                  <input
                    type="number"
                    placeholder="لوح في الربطة"
                    value={formData.boardsPerBundle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        boardsPerBundle: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    سعر الشراء
                  </label>
                  <input
                    type="number"
                    placeholder="سعر الشراء"
                    value={formData.buyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    سعر البيع
                  </label>
                  <input
                    type="number"
                    placeholder="سعر البيع"
                    value={formData.sellPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : "",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : editingId ? (
                  "تحديث المنتج"
                ) : (
                  "إضافة المنتج"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Popup */}
      {showQuickAddPopup && quickAddProduct && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowQuickAddPopup(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQuickAddPopup(false)}
              className="absolute left-4 top-4 text-slate-300 hover:text-red-500"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">إضافة للسلة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">المنتج</label>
                <div className="p-2 bg-slate-50 rounded">
                  {quickAddProduct.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الربط
                  </label>
                  <input
                    type="number"
                    placeholder="الربط"
                    onChange={(e) => setQuickAddBundles(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    اللوح
                  </label>
                  <input
                    type="number"
                    placeholder="اللوح"
                    onChange={(e) => setQuickAddBoards(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  سعر الوحدة
                </label>
                <input
                  type="number"
                  placeholder="سعر الوحدة"
                  value={quickAddPrice}
                  onChange={(e) => setQuickAddPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addToCart}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700"
              >
                إضافة للسلة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Cart Popup */}
      {showSellCartPopup && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowSellCartPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSellCartPopup(false)}
              className="absolute left-4 top-4 text-slate-300 hover:text-red-500"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold mb-6">سلة البيع</h3>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {console.log("Cart popup opened:", { sellCart, cartData })}
              {sellCart.map((product) => (
                <div
                  key={product.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold">{product.name}</h4>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        الربط
                      </label>
                      <input
                        type="number"
                        placeholder="الربط"
                        value={cartData[product.id]?.bundles || ""}
                        onChange={(e) =>
                          updateCartItem(product.id, "bundles", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        اللوح
                      </label>
                      <input
                        type="number"
                        placeholder="اللوح"
                        value={cartData[product.id]?.boards || ""}
                        onChange={(e) =>
                          updateCartItem(product.id, "boards", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        سعر الوحدة
                      </label>
                      <input
                        type="number"
                        placeholder="سعر الوحدة"
                        value={cartData[product.id]?.unitPrice || ""}
                        onChange={(e) =>
                          updateCartItem(
                            product.id,
                            "unitPrice",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        الإجمالي
                      </label>
                      <div className="p-2 bg-slate-50 rounded font-bold">
                        {(() => {
                          const bundles = parseFloat(
                            cartData[product.id]?.bundles || "0",
                          );
                          const boards = parseFloat(
                            cartData[product.id]?.boards || "0",
                          );
                          const unitPrice = parseFloat(
                            cartData[product.id]?.unitPrice ||
                              product.sellPrice.toString(),
                          );
                          const productBoards =
                            bundles * product.boardsPerBundle + boards;
                          const productAmount = productBoards * unitPrice;
                          return productAmount.toFixed(2);
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer and Payment */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العميل</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">اختر العميل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    الخصم
                  </label>
                  <input
                    type="number"
                    placeholder="الخصم"
                    value={sellDiscount}
                    onChange={(e) => setSellDiscount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    المبلغ المدفوع
                  </label>
                  <input
                    type="number"
                    placeholder="المبلغ المدفوع"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-slate-700">
                    المبلغ الإجمالي:
                  </div>
                  <div className="text-lg font-bold text-emerald-600">
                    {(() => {
                      if (sellCart.length === 0) return "0.00";
                      let totalAmount = 0;

                      sellCart.forEach((product) => {
                        const bundles = parseFloat(
                          cartData[product.id]?.bundles || "0",
                        );
                        const boards = parseFloat(
                          cartData[product.id]?.boards || "0",
                        );
                        const unitPrice = parseFloat(
                          cartData[product.id]?.unitPrice ||
                            product.sellPrice.toString(),
                        );
                        const productBoards =
                          bundles * product.boardsPerBundle + boards;
                        const productAmount = productBoards * unitPrice;
                        totalAmount += productAmount;
                      });
                      return totalAmount.toFixed(2);
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-slate-700">
                    المبلغ النهائي:
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      if (sellCart.length === 0) return "0.00";
                      let totalAmount = 0;

                      sellCart.forEach((product) => {
                        const bundles = parseFloat(
                          cartData[product.id]?.bundles || "0",
                        );
                        const boards = parseFloat(
                          cartData[product.id]?.boards || "0",
                        );
                        const unitPrice = parseFloat(
                          cartData[product.id]?.unitPrice ||
                            product.sellPrice.toString(),
                        );
                        const productBoards =
                          bundles * product.boardsPerBundle + boards;
                        const productAmount = productBoards * unitPrice;
                        totalAmount += productAmount;
                      });
                      const totalDiscount = parseFloat(sellDiscount || "0");
                      const finalAmount = Math.max(
                        0,
                        totalAmount - totalDiscount,
                      );
                      return finalAmount.toFixed(2);
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={processSellCart}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري معالجة البيع...
                  </>
                ) : (
                  "إتمام البيع"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
function setIsModalOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setFormData(arg0: any) {
  throw new Error("Function not implemented.");
}

function setShowQuickAddPopup(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setQuickAddBundles(value: any) {
  throw new Error("Function not implemented.");
}

function setQuickAddBoards(value: any) {
  throw new Error("Function not implemented.");
}

function setQuickAddPrice(value: any) {
  throw new Error("Function not implemented.");
}

function setShowSellCartPopup(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function removeFromCart(id: any) {
  throw new Error("Function not implemented.");
}

function updateCartItem(id: any, arg1: string, value: any) {
  throw new Error("Function not implemented.");
}

function setSelectedClient(value: any) {
  throw new Error("Function not implemented.");
}

function setSellDiscount(value: any) {
  throw new Error("Function not implemented.");
}

function setPaidAmount(value: any) {
  throw new Error("Function not implemented.");
}
