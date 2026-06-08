/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Wallet, ShoppingBag, Star, Phone, Check, CreditCard, ChevronRight, ArrowLeft, Trash2, Plus, Minus, Home } from 'lucide-react';
import { Merchant, MenuItem, CartItem, Order, UserProfile } from '../types';
import { CATEGORIES } from '../data';

interface CustomerRoleProps {
  merchants: Merchant[];
  menuItems: MenuItem[];
  orders: Order[];
  profile: UserProfile;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  updateProfile: (p: UserProfile) => void;
  placeOrder: (o: Order) => boolean;
}

export default function CustomerRole({
  merchants,
  menuItems,
  orders,
  profile,
  cart,
  setCart,
  updateProfile,
  placeOrder
}: CustomerRoleProps) {
  // Navigation states
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [activeTab, setActiveTab] = useState<'index' | 'history'>('index');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState(profile.address);
  const [editedPhone, setEditedPhone] = useState(profile.phone);
  const [editedName, setEditedName] = useState(profile.name);

  // Active Merchant object
  const activeMerchant = merchants.find(m => m.id === selectedMerchantId);

  // Calculated distance-based shipping fee
  const getDeliveryFee = (distance: number) => {
    return distance <= 1.0 ? 10 : 20;
  };

  // Add to cart logical checks
  const handleAddToCart = (item: MenuItem, merchant: Merchant) => {
    // Check if cart has items from another merchant
    const hasOtherMerchantItems = cart.some(cartItem => cartItem.merchantId !== merchant.id);

    if (hasOtherMerchantItems) {
      if (confirm(`คุณมีสินค้าจากร้านอื่นอยู่ในตระกร้าแล้ว ต้องการเคลียร์ตะกร้าเพื่อสั่งอาหารจากร้าน "${merchant.name}" ใช่หรือไม่?`)) {
        setCart([{
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          merchantId: merchant.id,
          merchantName: merchant.name
        }]);
      }
      return;
    }

    // Add item or increment quantity
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        merchantId: merchant.id,
        merchantName: merchant.name
      }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, increment: boolean) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = increment ? i.quantity + 1 : i.quantity - 1;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  // Wallet top-up handler
  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(topUpAmount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      updateProfile({
        ...profile,
        walletBalance: profile.walletBalance + parsedAmount
      });
      setIsWalletModalOpen(false);
      setTopUpAmount('');
    }
  };

  // Profile Save
  const handleSaveProfile = () => {
    updateProfile({
      ...profile,
      name: editedName,
      phone: editedPhone,
      address: editedAddress
    });
    setIsEditingAddress(false);
  };

  // Totals for Checkout
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const activeCartMerchant = cart.length > 0 ? merchants.find(m => m.id === cart[0].merchantId) : null;
  const deliveryDistance = activeCartMerchant ? activeCartMerchant.distance : 0;
  const deliveryFee = activeCartMerchant ? getDeliveryFee(deliveryDistance) : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  // Checkout Execution
  const handleCheckout = () => {
    if (!profile.name || !profile.phone || !profile.address) {
      alert('กรุณากรอกข้อมูลส่วนตัวและที่อยู่จัดส่งให้ครบถ้วนก่อนสั่งซื้อค่ะ!');
      setIsEditingAddress(true);
      return;
    }

    if (paymentMethod === 'wallet' && profile.walletBalance < cartTotal) {
      alert('ยอดเงินในวอลเลทของคุณไม่เพียงพอ กรุณาเติมเงินหรือเลือกช่องทางจ่ายเงินสดค่ะ');
      return;
    }

    if (!activeCartMerchant) return;

    // Build the order object
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      customerName: profile.name,
      customerPhone: profile.phone,
      customerAddress: profile.address,
      merchantId: activeCartMerchant.id,
      merchantName: activeCartMerchant.name,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal: cartSubtotal,
      deliveryFee: deliveryFee,
      commissionDeducted: parseFloat((cartSubtotal * 0.03).toFixed(2)), // 3% commission
      total: cartTotal,
      distanceValue: deliveryDistance,
      status: 'pending',
      paymentMethod: paymentMethod === 'wallet' ? 'วอลเลทสะเล้ง (Sa-laeng Wallet)' : 'เงินสดเมื่อส่งถึง (Cash on Delivery)',
      timestamp: new Date().toISOString()
    };

    const success = placeOrder(newOrder);
    if (success) {
      // Deduct wallet balance if chosen
      if (paymentMethod === 'wallet') {
        updateProfile({
          ...profile,
          walletBalance: parseFloat((profile.walletBalance - cartTotal).toFixed(2))
        });
      }
      setCart([]);
      setIsCheckoutOpen(false);
      setActiveTab('history');
      alert('สั่งสินค้าสำเร็จแล้ว! คุณสามารถติดตามสถานะการจัดส่งได้จากประวัติสั่งซื้อค่ะ');
    }
  };

  // Filter approved merchants by search or category
  const filteredMerchants = merchants.filter(merchant => {
    if (merchant.status !== 'approved') return false;
    const matchesSearch = merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          merchant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || merchant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category statistics counts
  const getCategoryCount = (catName: string) => {
    if (catName === 'ทั้งหมด') return merchants.filter(m => m.status === 'approved').length;
    return merchants.filter(m => m.status === 'approved' && m.category === catName).length;
  };

  return (
    <div className="min-h-screen bg-earth-sand pb-24 text-earth-bark" id="customer-role-root">
      {/* Search Header */}
      <div className="bg-brand text-earth-sand px-4 pt-6 pb-8 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto">
          {/* Top Address block */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="text-white w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-brand-light font-medium">ส่งไปที่</p>
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="font-bold text-sm text-white hover:underline line-clamp-1 max-w-[200px]"
                >
                  {profile.address || 'เพิ่มที่ตั้งสำหรับจัดส่ง...'}
                </button>
              </div>
            </div>

            {/* Wallet Quick display */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm py-1.5 px-3 rounded-full text-xs font-semibold border border-white/10"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>฿{profile.walletBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-black/15 p-1 rounded-lg mb-4">
            <button
              onClick={() => { setActiveTab('index'); setSelectedMerchantId(null); }}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all ${activeTab === 'index' ? 'bg-white text-brand shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              ค้นหาร้านอาหาร
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all relative ${activeTab === 'history' ? 'bg-white text-brand shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              ติดตามและประวัติสั่งซื้อ
              {orders.filter(o => ['pending', 'preparing', 'ready_for_pickup', 'in_delivery'].includes(o.status)).length > 0 && (
                <span className="absolute top-1 right-2 inline-block w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
              )}
            </button>
          </div>

          {/* Search Bar only on Index */}
          {activeTab === 'index' && !selectedMerchantId && (
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-neutral-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="ค้นหาร้านค้าหรือเมนูดัง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none shadow-sm placeholder:text-neutral-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-4 mt-4">
        {activeTab === 'index' ? (
          <>
            {/* Index: List of Merchant Shops */}
            {!selectedMerchantId ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Horizontal Category Slider */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-neutral-900 mb-3">หมวดหมู่ยอดนิยม</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            isActive
                              ? 'bg-brand text-earth-sand shadow-xs'
                              : 'bg-white text-earth-moss border border-earth-linen hover:border-earth-moss/30 hover:bg-earth-sand/30'
                          }`}
                        >
                          {cat} ({getCategoryCount(cat)})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Restaurant Merchants Grid */}
                <h3 className="text-sm font-bold text-neutral-900 mb-3">ร้านค้าในกลุ่มของคุณ</h3>
                {filteredMerchants.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center border border-neutral-100 shadow-xs">
                    <p className="text-neutral-500 text-sm">ไม่พบร้านค้าที่เปิดอยู่ตามหมวดหมู่นี้</p>
                    <button
                      onClick={() => { setSelectedCategory('ทั้งหมด'); setSearchQuery(''); }}
                      className="mt-2 text-xs font-bold text-brand hover:underline"
                    >
                      แสดงร้านค้าทั้งหมด
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMerchants.map((merchant) => {
                      const dFee = getDeliveryFee(merchant.distance);
                      return (
                        <div
                          key={merchant.id}
                          onClick={() => setSelectedMerchantId(merchant.id)}
                          className="bg-white rounded-xl p-3 border border-earth-linen shadow-xs hover:shadow-md hover:border-brand/20 transition-all cursor-pointer flex gap-4"
                          id={`merchant-card-${merchant.id}`}
                        >
                          <div className="w-16 h-16 rounded-xl bg-brand-light flex items-center justify-center text-3xl font-semibold select-none flex-shrink-0">
                            {merchant.image || '🏪'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm text-neutral-900 truncate">{merchant.name}</h4>
                              <div className="flex items-center text-yellow-500 gap-1 flex-shrink-0 ml-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-500" />
                                <span className="text-xs font-bold text-earth-bark/80">{merchant.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-earth-moss line-clamp-1 mt-1">{merchant.description}</p>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs font-medium text-earth-moss">
                              <span className="bg-earth-linen px-2 py-0.5 rounded text-[10px] text-earth-bark font-bold">
                                {merchant.category}
                              </span>
                              <span className="flex items-center text-earth-moss gap-1">
                                <MapPin className="w-3 h-3 text-brand" />
                                {merchant.distance} กม.
                              </span>
                              <span className="text-neutral-500">
                                ค่าส่ง: <strong className="text-neutral-800">฿{dFee}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Restaurant Menu Detail View */
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-20"
              >
                <button
                  onClick={() => setSelectedMerchantId(null)}
                  className="flex items-center text-xs font-bold text-earth-moss mb-4 hover:text-brand"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> ย้อนกลับไปหน้าร้านทั้งหมด
                </button>

                {activeMerchant && (
                  <div className="space-y-4">
                    {/* Store Card Header */}
                    <div className="bg-white rounded-xl p-4 border border-earth-linen shadow-xs">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-brand-light flex items-center justify-center text-4xl select-none flex-shrink-0">
                          {activeMerchant.image}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-black text-earth-bark">{activeMerchant.name}</h2>
                          <div className="flex items-center text-xs text-earth-moss gap-3 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <strong className="text-earth-bark font-bold">{activeMerchant.rating}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center text-brand gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand" />
                              ห่างออกไป {activeMerchant.distance} กม. (ค่าส่ง ฿{getDeliveryFee(activeMerchant.distance)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-earth-linen mt-4 pt-3 text-xs text-earth-moss">
                        <p className="font-bold text-earth-bark">แนะนำร้าน:</p>
                        <p className="mt-1 leading-relaxed">{activeMerchant.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-earth-moss">
                          <Phone className="w-3.5 h-3.5" />
                          <span>ติดต่อ: {activeMerchant.phone}</span>
                        </div>
                        <p className="mt-2 text-xs text-earth-moss/85 bg-earth-sand p-2 rounded border border-earth-linen/40">
                          📌 พิกัดร้าน: {activeMerchant.address}
                        </p>
                      </div>
                    </div>

                    {/* Menu list for this merchant only */}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3">รายการอาหารแนะนำ</h3>
                      <div className="space-y-3">
                        {menuItems
                          .filter(item => item.merchantId === selectedMerchantId)
                          .map(item => (
                            <div
                              key={item.id}
                              className="bg-white rounded-xl p-3 border border-earth-linen flex gap-3 shadow-xs hover:border-brand/10 transition-all"
                            >
                              <div className="w-14 h-14 rounded-lg bg-earth-linen flex items-center justify-center text-2xl select-none flex-shrink-0">
                                {item.image}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <h4 className="font-bold text-sm text-earth-bark truncate">{item.name}</h4>
                                  <span className="text-sm font-extrabold text-brand flex-shrink-0">฿{item.price}</span>
                                </div>
                                <p className="text-xs text-earth-moss line-clamp-2 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                                
                                <div className="flex justify-between items-center mt-3">
                                  {!item.available ? (
                                    <span className="text-[10px] font-bold bg-earth-linen text-earth-moss/50 px-2 py-1 rounded">
                                      สินค้าหมดคลัง
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-brand-light text-brand font-bold px-2 py-0.5 rounded">
                                      พร้อมส่งทันที
                                    </span>
                                  )}

                                  {item.available && (
                                    <button
                                      onClick={() => handleAddToCart(item, activeMerchant)}
                                      className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                      id={`add-to-cart-${item.id}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" /> เพิ่มลงตะกร้า
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        ) : (
          /* Tracker & Order History Tab */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="text-brand w-5 h-5" />
              <h2 className="text-base font-black text-earth-bark">คำสั่งซื้อและสถานะนำส่ง</h2>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-earth-linen shadow-xs">
                <div className="w-12 h-12 bg-earth-linen rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="text-earth-moss w-6 h-6" />
                </div>
                <p className="text-sm text-earth-moss font-medium">คุณยังไม่มีประวัติชำระเงินหรือสั่งซื้อในขณะนี้ค่ะ</p>
                <button
                  onClick={() => setActiveTab('index')}
                  className="mt-3 text-xs bg-brand text-white font-bold py-2 px-4 rounded-full hover:bg-brand-hover cursor-pointer"
                >
                  เริ่มช้อปอาหารอร่อย
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .slice()
                  .reverse()
                  .map((order) => {
                    // Status Badge translator
                    const getStatusDetails = (status: Order['status']) => {
                      switch (status) {
                        case 'pending':
                          return { text: 'รอยืนยันคำรับสั่ง', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
                        case 'preparing':
                          return { text: 'กำลังปรุงอาหาร', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                        case 'ready_for_pickup':
                          return { text: 'ปรุงเสร็จแล้ว รอสะเล้งไรเดอร์', color: 'bg-pink-50 text-pink-700 border-pink-200' };
                        case 'in_delivery':
                          return { text: 'ไรเดอร์กำลังนำส่งอาหาร', color: 'bg-orange-50 text-orange-700 border-orange-200' };
                        case 'completed':
                          return { text: 'จัดส่งสำเร็จ อร่อยฟิน!', color: 'bg-brand-light text-brand border-brand/20 font-bold' };
                        case 'cancelled':
                          return { text: 'คำสั่งถูกยกเลิก', color: 'bg-red-50 text-red-700 border-red-200' };
                      }
                    };

                    const statusDetail = getStatusDetails(order.status);

                    return (
                      <div key={order.id} className="bg-white rounded-xl p-4 border border-earth-linen shadow-sm">
                        <div className="flex justify-between items-start border-b border-earth-linen pb-3">
                          <div>
                            <p className="text-xs text-earth-moss/70 font-mono">ID: {order.id.slice(-8).toUpperCase()}</p>
                            <h4 className="font-extrabold text-sm text-earth-bark mt-1">{order.merchantName}</h4>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded border font-semibold ${statusDetail.color}`}>
                            {statusDetail.text}
                          </span>
                        </div>

                        {/* Order food detail items */}
                        <div className="py-3 text-xs text-neutral-700 space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-neutral-600">
                                {it.name} <strong className="text-neutral-800 font-semibold">x{it.quantity}</strong>
                              </span>
                              <span className="font-mono text-neutral-700">฿{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Progress visual tracker for active orders */}
                        {['pending', 'preparing', 'ready_for_pickup', 'in_delivery'].includes(order.status) && (
                          <div className="bg-earth-sand rounded-xl p-2.5 my-2 text-xs border border-earth-linen/60">
                            <div className="flex items-center gap-2 font-bold text-earth-bark">
                              <span className="animate-pulse inline-block w-2.5 h-2.5 bg-brand rounded-full" />
                              <span>สถานะพิกัดสะเล้ง:</span>
                            </div>
                            <p className="text-earth-moss mt-1">
                              {order.status === 'pending' && '📍 รอระบบระบุแอดมินหรือไรเดอร์คู่สัญญาเพื่อรับออเดอร์คิวแรกค่ะ'}
                              {order.status === 'preparing' && '🍳 ร้านค้าสวมผ้ากันเปื้อนกำลังผัดอาหารสูตรพรีเมียมให้เสร็จสมบูรณ์'}
                              {order.status === 'ready_for_pickup' && '🛵 แพ็กของลงกล่องเรียบร้อย แอดมินไรเดอร์สตาร์ตรถวิ่งมารับแล้ว'}
                              {order.status === 'in_delivery' && '🏎️ กำลังเร่งความเร็วเฉลี่ยนำส่งไปที่ที่อยู่จัดส่งของคุณอย่างปลอดภัย'}
                            </p>
                          </div>
                        )}

                        <div className="border-t border-earth-linen pt-3 flex justify-between items-center text-xs text-earth-moss">
                          <div>
                            <p>ค่าส่ง (ระยะทาง {order.distanceValue} กม.): ฿{order.deliveryFee}</p>
                            <p className="mt-1">จ่ายแบบ: {order.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-earth-moss/70">ยอดชำระสุทธิ</p>
                            <p className="text-md font-extrabold text-brand">฿{order.total}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-earth-linen px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20 flex justify-between items-center whitespace-normal select-none">
          <div className="flex items-center gap-3">
            <div className="relative bg-brand/10 p-2.5 rounded-full text-brand">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold rounded-full px-1.5 py-0.5 text-[9px]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div>
              <p className="text-xs text-earth-moss">สินค้าจากร้าน {cart[0].merchantName}</p>
              <p className="text-sm font-extrabold text-earth-bark">
                ฿{cartSubtotal.toLocaleString('th-TH')} <span className="text-[10px] font-normal text-earth-moss/70">(ยังไม่รวมค่าส่ง ฿{deliveryFee})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            id="checkout-trigger-button"
          >
            สั่งซื้ออาหาร <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Checkout Dialog Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-end justify-center">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-md rounded-t-xl p-4 max-h-[85vh] overflow-y-auto pb-10"
              id="checkout-dialog"
            >
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="font-extrabold text-neutral-900 text-base">สรุปรายการคำสั่งซื้อของคุณ</h3>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-600 py-1"
                >
                  ปิดหน้านี้
                </button>
              </div>

              {/* Delivery info */}
              <div className="bg-earth-sand p-3 rounded-xl my-3 border border-earth-linen text-xs text-earth-bark">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-earth-bark">ส่งไปที่: {profile.name}</span>
                  <button onClick={() => setIsEditingAddress(true)} className="text-brand hover:underline font-bold">
                    แก้ไขข้อมูล
                  </button>
                </div>
                <p className="text-earth-moss mt-1">📞 โทร: {profile.phone}</p>
                <p className="text-earth-moss mt-0.5">📍 ที่อยู่จัดส่ง: {profile.address}</p>
              </div>

              {/* Items Summary list */}
              <div className="space-y-2 mb-3">
                <p className="text-xs font-bold text-earth-moss/70">รายการอาหารในตะกร้า</p>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-earth-linen/50">
                    <div className="flex-1">
                      <p className="font-bold text-earth-bark">{item.name}</p>
                      <p className="text-earth-moss/70">฿{item.price} ชิ้น/ห่อ</p>
                    </div>
                    {/* Item control */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5 border border-earth-linen rounded-md p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, false)}
                          className="p-1 text-earth-moss hover:bg-earth-linen rounded-md cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-earth-bark text-xs min-w-[12px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, true)}
                          className="p-1 text-brand hover:bg-earth-linen rounded-md cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-extrabold w-12 text-right text-earth-bark">฿{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment selector */}
              <div className="mb-4 bg-earth-sand p-3 rounded-xl border border-earth-linen">
                <p className="text-xs font-bold text-earth-bark mb-2">ช่องทางชำระเงิน</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'border-brand bg-brand-light text-brand font-bold'
                        : 'border-earth-linen bg-white text-earth-moss'
                    }`}
                  >
                    <div>
                      <p className="font-bold">E-Wallet ตลาดสะเล้ง</p>
                      <p className="text-[10px] text-earth-moss/70">คงเหลือ: ฿{profile.walletBalance}</p>
                    </div>
                    {paymentMethod === 'wallet' && <Check className="w-4 h-4 text-brand" />}
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-brand bg-brand-light text-brand font-bold'
                        : 'border-earth-linen bg-white text-earth-moss'
                    }`}
                  >
                    <div>
                      <p className="font-bold">เงินสดปลายทาง</p>
                      <p className="text-[10px] text-earth-moss/70">จ่ายเมื่อไรเดอร์ส่งถึง</p>
                    </div>
                    {paymentMethod === 'cash' && <Check className="w-4 h-4 text-brand" />}
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-earth-sand p-3 rounded-xl space-y-1.5 border border-earth-linen text-xs text-earth-bark mb-4 font-medium">
                <div className="flex justify-between">
                  <span>ราคารวมสินค้า (Subtotal)</span>
                  <span>฿{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าบริการขนส่งสะเล้ง ({deliveryDistance} กม.)</span>
                  <span>฿{deliveryFee}</span>
                </div>
                {paymentMethod === 'wallet' && (
                  <div className="flex justify-between text-brand">
                    <span>ชำระผ่านวอลเลทคงเหลือหลังซื้อ</span>
                    <span>฿{parseFloat((profile.walletBalance - cartTotal).toFixed(2))}</span>
                  </div>
                )}
                <div className="border-t border-earth-linen pt-2 flex justify-between font-extrabold text-sm text-earth-bark">
                  <span>ยอดสุทธิทั้งหมด</span>
                  <span className="text-brand">฿{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-brand hover:bg-brand-hover text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                id="place-order-button"
              >
                <CreditCard className="w-4 h-4" /> ยืนยันชำระค่าอาหารและส่งใบสั่งซื้อ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Address Setup Dialog */}
      <AnimatePresence>
        {isEditingAddress && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-xl p-4 shadow-xl border border-earth-linen"
              id="profile-address-editor"
            >
              <h3 className="font-extrabold text-earth-bark text-sm mb-3">แก้ไขข้อมูลจัดส่งอาหาร</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-earth-moss/80 mb-1 pointer-events-none">ชื่อผู้สั่ง</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full p-2 border border-earth-linen rounded-lg text-xs focus:outline-none focus:border-brand"
                    placeholder="ใส่ชื่อสำหรับส่งอาหาร"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-earth-moss/80 mb-1 pointer-events-none">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    className="w-full p-2 border border-earth-linen rounded-lg text-xs focus:outline-none focus:border-brand"
                    placeholder="ตัวอย่าง 08X-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-earth-moss/80 mb-1 pointer-events-none">ที่อยู่จัดส่งและปักหมุด</label>
                  <textarea
                    rows={3}
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    className="w-full p-2 border border-earth-linen rounded-lg text-xs focus:outline-none focus:border-brand"
                    placeholder="บ้านเลขที่, ซอย, ถนน หรืออาคารจุดส่งสินค้า"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="flex-1 border border-earth-linen text-earth-moss rounded-lg text-xs font-bold py-2 hover:bg-earth-sand/50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 bg-brand text-white rounded-lg text-xs font-bold py-2 hover:bg-brand-hover cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Deposit Dialog Modals */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-sm rounded-xl p-5 shadow-xl border border-earth-linen"
              id="wallet-topup-modal"
            >
              <h3 className="font-extrabold text-earth-bark text-sm mb-2">💰 เติมเงินเข้า E-Wallet สะเล้ง</h3>
              <p className="text-xs text-earth-moss leading-normal mb-4">
                สะดวก ปลอดภัย จ่ายและหักยอดเงินทันทีเพื่อสนับสนุนค่าเดินทางและกระจายงานให้กับร้านอาหารในตลาดชุมชน
              </p>
              
              <form onSubmit={handleTopUp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-earth-moss/80 mb-1 pointer-events-none">
                    จำนวนเงินที่จะฝากเข้าระบบ (บาท)
                  </label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full p-2.5 border border-earth-linen rounded-xl text-sm text-center font-extrabold text-brand focus:outline-none focus:border-brand"
                    placeholder="ใส่จำนวนเงิน (เช่น 100, 200, 500)"
                    min="1"
                    required
                  />
                  
                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[50, 100, 300, 500].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setTopUpAmount(preset.toString())}
                        className="bg-earth-linen hover:bg-earth-linen/80 text-earth-bark text-xs rounded py-1 font-semibold cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWalletModalOpen(false)}
                    className="flex-1 border border-earth-linen text-earth-moss rounded-xl text-xs font-bold py-2.5 hover:bg-earth-sand/50"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer"
                  >
                    ยืนยันการเติมเงิน
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
