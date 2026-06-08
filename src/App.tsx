/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Store, ShieldCheck, Heart, Sparkles, HelpCircle } from 'lucide-react';
import { Merchant, MenuItem, Order, UserProfile, CartItem } from './types';
import { INITIAL_MERCHANTS, INITIAL_MENU_ITEMS } from './data';
import CustomerRole from './components/CustomerRole';
import MerchantRole from './components/MerchantRole';
import AdminRole from './components/AdminRole';

export default function App() {
  // Load State from LocalStorage or Default
  const [role, setRole] = useState<'customer' | 'merchant' | 'admin'>(() => {
    const cached = localStorage.getItem('sa-laeng:role');
    return (cached as 'customer' | 'merchant' | 'admin') || 'customer';
  });

  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    const cached = localStorage.getItem('sa-laeng:merchants');
    return cached ? JSON.parse(cached) : INITIAL_MERCHANTS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const cached = localStorage.getItem('sa-laeng:menu-items');
    return cached ? JSON.parse(cached) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem('sa-laeng:orders');
    return cached ? JSON.parse(cached) : [];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('sa-laeng:profile');
    if (cached) return JSON.parse(cached);
    return {
      name: 'สหัสชัย มีโชค',
      phone: '081-345-6789',
      address: '123 ซอยเอกมัย 10 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ',
      walletBalance: 650.0 // Default demo wallet value
    };
  });

  // Track the logged-in merchant ID for the Merchant Portal (default to first merchant for instant demo experience)
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(() => {
    const cached = localStorage.getItem('sa-laeng:active-merchant-id');
    return cached || 'mer-1';
  });

  // Cart resides persistently in client session
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('sa-laeng:cart');
    return cached ? JSON.parse(cached) : [];
  });

  // Write changes persistently to localStorage
  useEffect(() => {
    localStorage.setItem('sa-laeng:role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('sa-laeng:merchants', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('sa-laeng:menu-items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('sa-laeng:orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sa-laeng:profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (activeMerchantId) {
      localStorage.setItem('sa-laeng:active-merchant-id', activeMerchantId);
    } else {
      localStorage.removeItem('sa-laeng:active-merchant-id');
    }
  }, [activeMerchantId]);

  useEffect(() => {
    localStorage.setItem('sa-laeng:cart', JSON.stringify(cart));
  }, [cart]);


  // MERCHANTS APPLICATION & WORKFLOW HANDLERS
  const submitApplication = (appDraft: Partial<Merchant>) => {
    const merchantId = `mer-${Date.now()}`;
    const fullMerchant: Merchant = {
      ...(appDraft as Merchant),
      id: merchantId
    };
    
    setMerchants(prev => [...prev, fullMerchant]);
    setActiveMerchantId(merchantId); // Log them into this draft shop automatically
  };

  const approveMerchant = (merchantId: string) => {
    setMerchants(prev =>
      prev.map(m => m.id === merchantId ? { ...m, status: 'approved' } : m)
    );
  };

  const rejectMerchant = (merchantId: string) => {
    setMerchants(prev =>
      prev.map(m => m.id === merchantId ? { ...m, status: 'rejected' } : m)
    );
  };

  const payMonthlyFee = (merchantId: string) => {
    setMerchants(prev =>
      prev.map(m => {
        if (m.id === merchantId) {
          // Add 30 days to due date
          const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...m,
            monthlyFeePaid: true,
            monthlyFeeDueDate: nextDueDate
          };
        }
        return m;
      })
    );
  };


  // MENU HANDLERS
  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(it => it.id === item.id ? item : it));
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(it => it.id !== itemId));
  };


  // ORDER PROCESSING HANDLERS
  const placeOrder = (order: Order): boolean => {
    setOrders(prev => [...prev, order]);
    return true;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
  };

  const updateProfile = (p: UserProfile) => {
    setProfile(p);
  };

  // Helper helper to clear demo state to let reviewers reset and start clean
  const handleResetDemoData = () => {
    if (confirm('ต้องการล้างข้อมูลเพื่อเริ่มจำลองทดสอบใหม่ใช่หรือไม่? (การประมวลผลคำสั่งซื้อและร้านค้าใหม่จะกลับสู่ค่าตั้งต้น)')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="bg-earth-linen min-h-screen flex flex-col items-center justify-start py-0 sm:py-8 font-sans antialiased selection:bg-brand-light selection:text-brand-hover" id="sa-laeng-master-root">
      
      {/* Outer Banner / Header for Desktops with beautiful instructions */}
      <header className="hidden sm:flex flex-col items-center max-w-md text-center text-earth-bark mb-6 select-none" id="platform-desktop-header">
        <div className="flex items-center gap-1.5 bg-brand py-1 px-3 rounded-full text-xs font-bold text-earth-sand mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" /> <span className="font-semibold">3-Sided Food Marketplace Simulation</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-brand-hover">ตลาดสะเล้ง (Sa-laeng Market)</h1>
        <p className="text-xs text-earth-moss mt-1.5 leading-relaxed font-medium">
          จำลองระบบจับจ่ายแบบครบวงจร: สั่งซื้ออาหาร (<b>ลูกค้า</b>) &rarr; จัดการครัวและยอดขาย (<b>ร้านค้า</b>) &rarr; และขับสะเล้งไรเดอร์นำส่งสิ่งของ (<b>แอดมิน</b>)
        </p>
      </header>

      {/* Persistent Multi-role Control Center Switcher (Stick to Top on desktop/mobile frames) */}
      <div className="w-full max-w-md bg-earth-forest text-earth-linen px-4 py-2.5 sm:rounded-t-xl border-b border-[#2d4c3c] sticky top-0 z-20 flex justify-between items-center select-none" id="role-panel-control-center">
        <span className="text-[10px] uppercase font-bold text-teal-100 tracking-wider">
          ตัวเลือกจำลองบทบาท:
        </span>
        <div className="flex bg-[#121c17] p-1 rounded-lg gap-1 border border-[#2d4c3c]/50">
          <button
            onClick={() => setRole('customer')}
            className={`flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all ${
              role === 'customer'
                ? 'bg-brand text-earth-sand shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            id="role-switch-customer"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ลูกค้า (UI)</span>
            <span className="sm:hidden">ลูกค้า</span>
          </button>
          <button
            onClick={() => setRole('merchant')}
            className={`flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all ${
              role === 'merchant'
                ? 'bg-brand text-earth-sand shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            id="role-switch-merchant"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ร้านค้า (UI)</span>
            <span className="sm:hidden">ร้านค้า</span>
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-md text-xs font-bold transition-all relative ${
              role === 'admin'
                ? 'bg-brand text-earth-sand shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
            id="role-switch-admin"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">แอดมิน (UI)</span>
            <span className="sm:hidden">แอดมิน</span>
            {/* Notify admin of pending audits or active Rider delivery queues */}
            {(merchants.filter(m => m.status === 'pending').length > 0 || orders.filter(o => o.status === 'ready_for_pickup').length > 0) && (
              <span className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Sandbox Iframe Frame Emulator Container */}
      <main className="w-full max-w-md bg-earth-sand sm:rounded-b-xl overflow-hidden shadow-2xl relative border-x border-[#e3dacd]" id="sandbox-viewport-emulator">
        <AnimatePresence mode="wait">
          {role === 'customer' && (
            <motion.div
              key="customer-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CustomerRole
                merchants={merchants}
                menuItems={menuItems}
                orders={orders}
                profile={profile}
                cart={cart}
                setCart={setCart}
                updateProfile={updateProfile}
                placeOrder={placeOrder}
              />
            </motion.div>
          )}

          {role === 'merchant' && (
            <motion.div
              key="merchant-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MerchantRole
                merchants={merchants}
                menuItems={menuItems}
                orders={orders}
                activeMerchantId={activeMerchantId}
                setActiveMerchantId={setActiveMerchantId}
                submitApplication={submitApplication}
                payMonthlyFee={payMonthlyFee}
                addMenuItem={addMenuItem}
                updateMenuItem={updateMenuItem}
                deleteMenuItem={deleteMenuItem}
                updateOrderStatus={updateOrderStatus}
              />
            </motion.div>
          )}

          {role === 'admin' && (
            <motion.div
              key="admin-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminRole
                merchants={merchants}
                orders={orders}
                approveMerchant={approveMerchant}
                rejectMerchant={rejectMerchant}
                updateOrderStatus={updateOrderStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom control hints for sandbox reviewers */}
      <footer className="w-full max-w-md py-4 px-4 text-center text-earth-moss text-[11px] leading-relaxed select-none" id="sa-laeng-sandbox-footer">
        <p>
          💡 <b>วิธีการสลับทดสอบ:</b> เมื่อสั่งสินค้าใน <b>"ลูกค้า"</b> แล้ว สามารถสลับแท็บไปที่ <b>"ร้านค้า"</b> เพื่อกดปรุงอาหาร และแท็บ <b>"แอดมิน"</b> เพื่อทำหน้าที่เป็นสะเล้งไรเดอร์ส่งของได้ทันที!
        </p>
        <div className="mt-2 text-center text-earth-moss/80">
          <p>© 2569 Sa-laeng Market Platform • พัฒนาโดย AI Studio</p>
          <button
            onClick={handleResetDemoData}
            className="text-earth-clay hover:text-earth-clay/80 mt-2 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            🔄 รีเซ็ตข้อมูลทั้งหมดเป็นค่าตั้งต้นสระว่ายน้ำ
          </button>
        </div>
      </footer>
    </div>
  );
}
