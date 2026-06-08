/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, BarChart3, ListCollapse, PlusCircle, AlertCircle, CircleCheck, ClipboardList, Wallet, ToggleLeft, ToggleRight, Trash2, Edit3, Settings, DollarSign, Calendar, RefreshCcw } from 'lucide-react';
import { Merchant, MenuItem, Order } from '../types';
import { CATEGORIES } from '../data';

interface MerchantRoleProps {
  merchants: Merchant[];
  menuItems: MenuItem[];
  orders: Order[];
  activeMerchantId: string | null;
  setActiveMerchantId: (id: string | null) => void;
  submitApplication: (application: Partial<Merchant>) => void;
  payMonthlyFee: (id: string) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export default function MerchantRole({
  merchants,
  menuItems,
  orders,
  activeMerchantId,
  setActiveMerchantId,
  submitApplication,
  payMonthlyFee,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateOrderStatus
}: MerchantRoleProps) {
  // Navigation states within Merchant Role
  const [merchantTab, setMerchantTab] = useState<'dashboard' | 'menu' | 'profile'>('dashboard');

  // Application onboarding states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [appName, setAppName] = useState('');
  const [appCategory, setAppCategory] = useState('อาหารคาว');
  const [appPhone, setAppPhone] = useState('');
  const [appAddress, setAppAddress] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appOwner, setAppOwner] = useState('');
  const [appOwnerId, setAppOwnerId] = useState('');
  const [appDocName, setAppDocName] = useState('');

  // Editing Menus
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuIcon, setMenuIcon] = useState('🍔');

  // Find active merchant profile if selected
  const activeMerchant = merchants.find(m => m.id === activeMerchantId);

  // Filter orders addressed to this merchant
  const merchantOrders = orders.filter(o => o.merchantId === activeMerchantId);

  // Statistics
  const totalRawSales = merchantOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.subtotal, 0);

  // Balance calculations: 3% commission deduction per order item
  const calculatedCommission = parseFloat((totalRawSales * 0.03).toFixed(2));
  const merchantNetBalance = totalRawSales - calculatedCommission;

  // Handler for multi-step onboarding
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
      return;
    }

    // Prepare draft merchant profile
    const newApp: Partial<Merchant> = {
      name: appName,
      category: appCategory,
      phone: appPhone,
      address: appAddress,
      description: appDesc,
      ownerName: appOwner,
      documentName: appDocName || 'ไฟล์สำเนาจดทะเบียนร้านค้า.jpg',
      status: 'pending', // subject to Administrator role approval
      image: appCategory === 'อาหารคาว' ? '🍲' : appCategory === 'เครื่องดื่ม' ? '🥤' : appCategory === 'ของหวาน' ? '🥭' : '🥗',
      distance: parseFloat((Math.random() * 2.8 + 0.2).toFixed(1)), // Simulate a distance in cultural block
      rating: 5.0,
      balance: 0,
      monthlyFeePaid: false,
      monthlyFeeDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    submitApplication(newApp);
    alert('ส่งใบสมัครพาร์ทเนอร์สำเร็จแล้ว! กรุณาสลับบทบาทเป็น "ผู้ดูแลระบบ (Admin)" เพื่อกดตรวจสอบและอนุมัติร้านค้าของคุณเข้าสู่ระบบการทำงานค่ะ');
    setOnboardingStep(1);
    // Reset inputs
    setAppName('');
    setAppPhone('');
    setAppAddress('');
    setAppDesc('');
    setAppOwner('');
    setAppOwnerId('');
    setAppDocName('');
  };

  // Submit Menu Item form
  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMerchantId) return;

    const priceNum = parseFloat(menuPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('กรุณากรอกราคาเมนูอาหารให้ถูกต้องค่ะ');
      return;
    }

    if (editingMenuItem) {
      // Edit mode
      updateMenuItem({
        ...editingMenuItem,
        name: menuName,
        price: priceNum,
        description: menuDesc,
        image: menuIcon
      });
      alert('อัปเดตเมนูสำเร็จ!');
    } else {
      // Add mode
      const newItem: MenuItem = {
        id: `menu-${Date.now()}`,
        merchantId: activeMerchantId,
        name: menuName,
        price: priceNum,
        description: menuDesc,
        image: menuIcon,
        available: true
      };
      addMenuItem(newItem);
      alert('เพิ่มเมนูอาหารใหม่สำเร็จ!');
    }

    // Reset Form
    setIsMenuFormOpen(false);
    setEditingMenuItem(null);
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuIcon('🍔');
  };

  // Pre-fill Menu Form for editing
  const handleStartEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuName(item.name);
    setMenuPrice(item.price.toString());
    setMenuDesc(item.description);
    setMenuIcon(item.image);
    setIsMenuFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-earth-sand pb-24 text-earth-bark" id="merchant-role-root">
      {/* Merchant Section Header */}
      <div className="bg-brand text-earth-sand px-4 py-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 p-1.5 bg-white/10 rounded-xl text-white border border-white/10" />
            <div>
              <h1 className="text-base font-black tracking-tight text-white">ศูนย์ควบคุมพาร์ทเนอร์ร้านค้า</h1>
              <p className="text-[11px] text-brand-light font-bold">Sa-laeng Merchant Portal</p>
            </div>
          </div>

          {/* Quick shop switcher if user is logged in */}
          {activeMerchantId && activeMerchant && (
            <div className="text-right">
              <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full inline-block">
                กำลังจัดการ: {activeMerchant.name.replace(/[^\u0E00-\u0E7F ]/g, '')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 mt-5">
        
        {/* CASE 1: No active session OR no merchants under this role selection */}
        {!activeMerchantId ? (
          <div className="space-y-6">
            
            {/* Quick selector of existing shops for easier local review */}
            <div className="bg-white rounded-lg p-4 border border-neutral-100 shadow-xs">
              <span className="text-[11px] font-bold text-[#06c755] uppercase tracking-wider block mb-2 pointer-events-none">
                ลงชื่อเข้าใช้ร้านค้าที่มีอยู่ (Quick Switch):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {merchants.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => {
                      setActiveMerchantId(shop.id);
                      setMerchantTab('dashboard');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-left hover:border-[#06c755] transition-all flex items-center justify-between group ${
                      shop.status === 'pending'
                        ? 'bg-amber-50/40 border-amber-200'
                        : shop.status === 'rejected'
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-white border-neutral-100 shadow-xs'
                    }`}
                  >
                    <div>
                      <p className="text-neutral-800 line-clamp-1">{shop.name}</p>
                      <p className="text-[10px] text-neutral-400 font-normal">
                        สถานะ: {shop.status === 'approved' ? '🟢 อนุมัติแล้ว' : shop.status === 'pending' ? '🟡 รอแอดมินตรวจ' : '🔴 ถูกปฏิเสธ'}
                      </p>
                    </div>
                    {shop.status === 'approved' && <CircleCheck className="w-4 h-4 text-[#06c755] flex-shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant Application Registration Flow Slider */}
            <div className="bg-white rounded-lg p-5 border border-neutral-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <PlusCircle className="text-[#06c755] w-5 h-5" />
                <h2 className="text-sm font-bold text-neutral-900 pointer-events-none">ใบสมัครเปิดพาร์ทเนอร์ร้านค้าใหม่ (3 ขั้นตอน)</h2>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4 pointer-events-none">
                ร่วมขายอาหารกับตลาดสะเล้ง ยอดขายพุ่ง รับออเดอร์สะดวด คอมมิชชั่นแบนด์ 3% และค่าธรรมเนียมบำรุงแพลตฟอร์มเพียง 50 บาทต่อเดือน
              </p>

              {/* Steps Progress Indicator */}
              <div className="flex items-center justify-between mb-6 px-1 text-center font-bold">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border transition-all ${
                      onboardingStep === step
                        ? 'bg-[#06c755] text-white border-[#06c755] scale-110 shadow-xs'
                        : onboardingStep > step
                        ? 'bg-green-100 text-[#06c755] border-[#06c755]'
                        : 'bg-white text-neutral-400 border-neutral-200'
                    }`}>
                      {step}
                    </div>
                    <div className="text-[10px] ml-1.5 font-medium text-neutral-600">
                      {step === 1 && 'ข้อมูลทั่วไป'}
                      {step === 2 && 'ข้อมูลเจ้าบ้าน'}
                      {step === 3 && 'ส่งเอกสารสำคัญ'}
                    </div>
                    {step < 3 && <div className="flex-1 h-[2px] bg-neutral-200 mx-1.5" />}
                  </div>
                ))}
              </div>

              {/* Step Forms */}
              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                {onboardingStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">ชื่อร้านอาหารค้า (ภาษาไทย)</label>
                      <input
                        type="text"
                        required
                        placeholder="ตัวอย่างเช่น หมูปิ้งสะเล้งทองพูน"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">หมวดหมู่อาหาร</label>
                      <select
                        value={appCategory}
                        onChange={(e) => setAppCategory(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      >
                        {CATEGORIES.filter(c => c !== 'ทั้งหมด').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">เบอร์โทรศัพท์ติดต่อพาร์ทเนอร์</label>
                        <input
                          type="tel"
                          required
                          placeholder="ตัวอย่าง 089-XXX-XXXX"
                          value={appPhone}
                          onChange={(e) => setAppPhone(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">บทแนะนำร้านสั้นๆ</label>
                      <input
                        type="text"
                        placeholder="แนะนำรสเด็ดหรือเมนูชูโรงประดับประชาร้าน"
                        value={appDesc}
                        onChange={(e) => setAppDesc(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">พิกัดที่ตั้งร้านในการเรียกไรเดอร์</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="เลขที่อาคารชั้นซอยถนนจุดสังเกตเพื่อคำนวนระยะทางสะเล้งบีบแตร"
                        value={appAddress}
                        onChange={(e) => setAppAddress(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      />
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">ชื่อ-นามสกุล ผู้ขอจดสิทธิ์พาร์ทเนอร์</label>
                      <input
                        type="text"
                        required
                        placeholder="นายสมชาย พาร์ทเนอร์ไทยใจงาม"
                        value={appOwner}
                        onChange={(e) => setAppOwner(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">เลขประจำตัวประชาชน (13 หลัก)</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{13}"
                        placeholder="13099XXXXXXXXXXXXXXXX"
                        value={appOwnerId}
                        onChange={(e) => setAppOwnerId(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-200 rounded-md focus:outline-none focus:border-[#06c755]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">ใช้เฉพาะในระบบตรวจสอบคุณสมบัติระบบรักษาความปลอดภัยแอดมินส่วนควบคุม</p>
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center bg-neutral-50/50">
                      <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-neutral-700 pointer-events-none">แนบชื่อเอกสารสำคัญตรวจสอบสิทธิ์พาร์ทเนอร์</p>
                      <p className="text-[10px] text-neutral-400 mt-1 mb-3 pointer-events-none">รองรับการจำลองใบอนุญาตพาณิชย์ หรือสำเนาบัตรเจ้าบ้าน (Mock format)</p>
                      
                      <input
                        type="text"
                        required
                        placeholder="ชื่อไฟล์ตัวอย่าง: ใบทะเบียนพานิช_หมูปิ้ง.pdf"
                        value={appDocName}
                        onChange={(e) => setAppDocName(e.target.value)}
                        className="w-full text-xs p-2 border border-neutral-200 rounded bg-white text-center text-neutral-700"
                      />
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-[10px] text-amber-800 leading-normal">
                      🛡️ ความยินยอม: ข้าพเจ้าขอตกลงยินยอมจ่ายค่าบำรุงแพลตฟอร์ม 50 บาทต่อรอบบิล 30 วัน และตกลงรับนโยบายหักค่าคอมมิชชั่น 3% เพื่อใช้ในการจัดการสิทธิประโยชน์สะเล้งไรเดอร์ขนส่ง
                    </div>
                  </motion.div>
                )}

                {/* Control Footer Onboarding Buttons */}
                <div className="flex gap-2 pt-3">
                  {onboardingStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(prev => prev - 1)}
                      className="px-4 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                    >
                      ย้อนกลับ
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-[#06c755] hover:bg-[#05b04b] text-white text-xs font-bold py-2 rounded-md shadow-xs"
                  >
                    {onboardingStep === 3 ? 'ส่งใบสมัครรับคำขอ' : 'ขั้นตอนถัดไป'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          
          /* CASE 2: Active merchant logged in! */
          <div className="space-y-4">
            
            {/* If merchant is pending or rejected */}
            {activeMerchant.status !== 'approved' ? (
              <div className="bg-white rounded-lg p-8 text-center border shadow-xs">
                {activeMerchant.status === 'pending' ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
                    <h3 className="font-extrabold text-neutral-800 text-base pointer-events-none">⚠️ ใบสมัครขอรับสิทธิ์อยู่ระหว่างการพิจารณา</h3>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-[300px] mx-auto pointer-events-none">
                      สิทธิ์ร้านค้า <strong className="text-neutral-800 font-bold">"{activeMerchant.name}"</strong> ได้รับการบันทึกในระบบแล้ว กรุณาสลับสัญลักษณ์สิทธิ์ด้านบนสุดไปที่บทบาท <strong className="text-[#06c755]">ผู้ดูแลระบบ (Admin)</strong> เพื่อทำการกดตรวจพิจารณาอนุมัติเปิดให้ใช้งานค่ะ!
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="font-extrabold text-neutral-800 text-base">❌ ขออภัย ใบสมัครของคุณไม่ผ่านการตรวจสอบ</h3>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-[300px] mx-auto">
                      เอกสารหรือพารามิเตอร์การลงทะเบียนไม่สมบูรณ์ หรืออยู่นอกเขตรหัสงานสะเล้งขนส่ง ผู้ดูแลแพลตฟอร์มได้ปฏิเสธใบสมัครนี้
                    </p>
                    <button
                      onClick={() => {
                        setActiveMerchantId(null);
                        setOnboardingStep(1);
                      }}
                      className="mt-4 bg-[#06c755] text-white text-xs font-bold py-2 px-4 rounded-full"
                    >
                      ขอยื่นใบสมัครใหม่อีกครั้ง
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveMerchantId(null)}
                  className="mt-6 text-xs text-neutral-400 hover:underline block mx-auto"
                >
                  หรือกลับไปแผงควบคุมหลักร้านค้า
                </button>
              </div>
            ) : (
              
              /* CASE 3: APPROVED MERCHANT ACTIVE OPERATION INTERFACES */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* 50 THB Monthly Platform Fee reminders & notifications area */}
                {!activeMerchant.monthlyFeePaid ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-amber-800">🔔 ใบเตือนชำระค่าธรรมเนียมแพลตฟอร์มรายเดือน</h4>
                      <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
                        ครบกำหนดชำระค่าธรรมเนียมจำนวน <strong className="font-bold">50 บาท</strong> สำหรับการบำรุงเซิร์ฟเวอร์ตลาดสะเล้ง กรุณาชำระตอนนี้เพื่อรักษาสิทธิ์ขายอาหารและแสดงผลหน้าร้านค้าของคุณต่อไปค่ะ
                      </p>
                      <button
                        onClick={() => {
                          if (confirm('คุณต้องการตัดเงินเพื่อชำระค่าธรรมเนียมรายเดือน 50 บาท ใช่หรือไม่?')) {
                            payMonthlyFee(activeMerchant.id);
                            alert('ขอบคุณค่ะ ระบบได้ชำระเงินและบันทึกประวัติค่าบำรุงรักษาเรียบร้อยแล้ว!');
                          }
                        }}
                        className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1 px-3 rounded shadow-xs"
                      >
                        ชำระตอนนี้ (50 THB)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between text-xs text-green-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CircleCheck className="w-4 h-4 text-[#06c755]" />
                      ชำระค่าธรรมเนียมรายเดือนแล้ว (50 THB)
                    </span>
                    <span className="text-[10px] text-green-600">
                      ครบกำหนดรอบบิลต่อไป: {new Date(activeMerchant.monthlyFeeDueDate).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                )}

                {/* Sub-Tabs navigation */}
                <div className="flex bg-neutral-200/60 p-1 rounded-lg">
                  <button
                    onClick={() => setMerchantTab('dashboard')}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      merchantTab === 'dashboard' ? 'bg-white text-[#06c755] shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> ยอดขาย & ออเดอร์
                  </button>
                  <button
                    onClick={() => setMerchantTab('menu')}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      merchantTab === 'menu' ? 'bg-white text-[#06c755] shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <ListCollapse className="w-3.5 h-3.5" /> จัดการเมนูอาหาร
                  </button>
                  <button
                    onClick={() => setMerchantTab('profile')}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      merchantTab === 'profile' ? 'bg-white text-[#06c755] shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" /> ข้อมูลร้านพาร์ทเนอร์
                  </button>
                </div>

                {/* TAB 1: DASHBOARD & ACTIVE ORDERS */}
                {merchantTab === 'dashboard' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Financial Widget Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-neutral-100 flex items-center gap-3 shadow-xs">
                        <div className="p-2 bg-[#e6fcf0] text-[#06c755] rounded-lg">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold">ยอดขายทั้งหมด (Raw Sales)</p>
                          <p className="text-sm font-extrabold text-neutral-800">฿{totalRawSales.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-neutral-100 flex items-center gap-3 shadow-xs">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold">รายรับสุทธิ (หักคอม 3%)</p>
                          <p className="text-sm font-extrabold text-[#06c755]">฿{merchantNetBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-100 p-2 text-[10px] text-neutral-500 rounded border border-neutral-200/50 flex justify-between pointer-events-none">
                      <span>⚡ ค่าบริการรักษาระบบ (Commission fee): 3% ของมูลค่าสินค้า</span>
                      <span>หักสะสมแล้ว: <b className="text-neutral-700">฿{calculatedCommission}</b></span>
                    </div>

                    {/* Order Queue */}
                    <div>
                      <h3 className="text-xs font-bold text-neutral-400 uppercase mb-3">คำรับสั่งซื้อเข้าสู่ครัวคลาสสิก ({merchantOrders.length} รายการ)</h3>
                      {merchantOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-earth-linen shadow-sm my-4">
                          <div className="w-20 h-20 bg-earth-linen rounded-full flex items-center justify-center mx-auto mb-6 border border-earth-linen/80">
                            <ClipboardList className="w-10 h-10 text-earth-moss animate-pulse" />
                          </div>
                          <h4 className="text-sm font-extrabold text-earth-bark mb-1">
                            ไม่มีออเดอร์ใหม่เข้ามา
                          </h4>
                          <p className="text-xs text-earth-moss max-w-[280px] mx-auto leading-relaxed">
                            ระบบกำลังเฝ้าติดตามลูกค้าในพื้นที่ หากมีรายการสั่งซื้ออาหารเข้ามาใหม่ จะมีแจ้งเตือนสั่นสะเทือนในแผงควบคุมนี้แบบเรียลไทม์ทันทีค่ะ
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {merchantOrders.slice().reverse().map((order) => (
                            <div key={order.id} className="bg-white rounded-lg p-4 border border-neutral-200 shadow-xs">
                              <div className="flex justify-between items-start mb-2 pb-2 border-b border-neutral-50">
                                <div>
                                  <p className="text-xs font-extrabold text-neutral-800">ลูกค้า: {order.customerName}</p>
                                  <p className="text-[10px] text-neutral-400 mt-0.5">เบอร์โทร: {order.customerPhone}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'preparing' ? 'bg-indigo-100 text-indigo-800' :
                                  order.status === 'ready_for_pickup' ? 'bg-pink-100 text-pink-800' :
                                  order.status === 'in_delivery' ? 'bg-orange-100 text-orange-800' :
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.status === 'pending' && 'รอยอมรับออเดอร์'}
                                  {order.status === 'preparing' && 'กำลังปรุงอาหาร'}
                                  {order.status === 'ready_for_pickup' && 'รอส่งไรเดอร์'}
                                  {order.status === 'in_delivery' && 'กำลังส่งพัสดุ'}
                                  {order.status === 'completed' && 'จัดส่งเสร็จแล้ว'}
                                  {order.status === 'cancelled' && 'ยกเลิกแล้ว'}
                                </span>
                              </div>

                              {/* Items list */}
                              <div className="text-xs text-neutral-600 space-y-1 my-2">
                                {order.items.map((it, i) => (
                                  <div key={i} className="flex justify-between">
                                    <span>{it.name} <strong className="text-neutral-800">x{it.quantity}</strong></span>
                                    <span className="font-mono text-neutral-700">฿{it.price * it.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Dynamic Commission breakdown */}
                              <div className="bg-neutral-50 p-2 rounded text-[10px] text-neutral-500 mb-2.5 border border-neutral-100/60 font-mono flex justify-between">
                                <span>ยอดอาหารสตรีมมิ่ง: ฿{order.subtotal}</span>
                                <span className="text-[#06c755]">เดตส่วนแบ่ง 3% (หัก ฿{order.commissionDeducted}) • ได้รับสุทธิ ฿{(order.subtotal - order.commissionDeducted).toFixed(2)}</span>
                              </div>

                              {/* State controls actions */}
                              <div className="flex gap-1.5 justify-end">
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="bg-[#06c755] hover:bg-[#05b04b] text-white text-[10px] font-bold py-1.5 px-3 rounded cursor-pointer"
                                  >
                                    Accept รับออเดอร์ & เริ่มปรุง
                                  </button>
                                )}
                                {order.status === 'preparing' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded cursor-pointer"
                                  >
                                    อาหารปรุงเสร็จแล้ว แจ้งแอดมินไรเดอร์
                                  </button>
                                )}
                                {order.status === 'ready_for_pickup' && (
                                  <span className="text-[10px] text-neutral-400 font-medium py-1">
                                    ⏳ อาหารเสร็จแล้ว รอสะเล้งไรเดอร์แอดมินมากด "เริ่มสัญจรนำส่ง"
                                  </span>
                                )}
                                {order.status === 'in_delivery' && (
                                  <span className="text-[10px] text-orange-600 font-semibold py-1">
                                    🏎️ สะเล้งไรเดอร์กำลังนำส่งอาหารไปปลายทาง
                                  </span>
                                )}
                                {order.status === 'completed' && (
                                  <span className="text-[10px] text-[#06c755] font-bold py-1 flex items-center gap-1 select-none">
                                    <CircleCheck className="w-3.5 h-3.5" /> รายการอาหารจบบัญชีสำเร็จ
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: MENU MANAGEMENT ITEMS */}
                {merchantTab === 'menu' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100 shadow-xs">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-700">คลังรายการเมนูขายทั้งหมด</h4>
                        <p className="text-[10px] text-neutral-400">ควบคุมเปิดปิดการขายหรือบันทึกเพิ่มลดสินค้า</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingMenuItem(null);
                          setMenuName('');
                          setMenuPrice('');
                          setMenuDesc('');
                          setMenuIcon('🍔');
                          setIsMenuFormOpen(true);
                        }}
                        className="bg-[#06c755] hover:bg-[#05b04b] text-white text-xs font-bold py-2 px-3 rounded-md flex items-center gap-1 shadow-xs"
                      >
                        <PlusCircle className="w-4 h-4" /> เพิ่มสินค้าใหม่
                      </button>
                    </div>

                    {/* Food Items list rendering */}
                    <div className="space-y-3">
                      {menuItems
                        .filter(it => it.merchantId === activeMerchantId)
                        .map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-3 border border-neutral-100 flex gap-3 shadow-xs">
                            <div className="w-12 h-12 bg-neutral-100 border rounded flex items-center justify-center text-2xl select-none flex-shrink-0">
                              {item.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <h4 className="font-extrabold text-sm text-neutral-900 truncate">{item.name}</h4>
                                <span className="text-xs font-bold text-[#06c755]">฿{item.price}</span>
                              </div>
                              <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{item.description}</p>
                              
                              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-neutral-50">
                                {/* Toggle switch for available state */}
                                <button
                                  onClick={() => {
                                    updateMenuItem({
                                      ...item,
                                      available: !item.available
                                    });
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-bold"
                                >
                                  {item.available ? (
                                    <>
                                      <ToggleRight className="text-[#06c755] w-5 h-5" />
                                      <span className="text-[#06c755] text-[10px]">เปิดร้านขายอยู่</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft className="text-neutral-300 w-5 h-5" />
                                      <span className="text-neutral-400 text-[10px]">ปิดหน้าร้านชั่วคราว</span>
                                    </>
                                  )}
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleStartEditMenu(item)}
                                    className="p-1 hover:bg-neutral-150 rounded text-neutral-500 hover:text-stone-800"
                                    title="แก้ไขข้อมูลสินค้า"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`คุณมั่นใจไหมที่จะลบเมนูอาหาร "${item.name}" ออกจากระบบถาวร?`)) {
                                        deleteMenuItem(item.id);
                                        alert('ลบเมนูเรียบร้อยแล้ว');
                                      }
                                    }}
                                    className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                                    title="ลบเมนู"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: PROFILE SETTINGS */}
                {merchantTab === 'profile' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg p-4 border border-neutral-100 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-neutral-900 border-b pb-2 text-sm">ข้อมูลประกอบนิติกรรมแอปพลิเคชันพาร์ทเนอร์</h4>
                    <div className="space-y-2.5 text-xs text-neutral-700">
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">ชื่อแบรนด์ร้านค้า:</span>
                        <strong className="text-neutral-800 text-sm font-extrabold">{activeMerchant.name}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">หมวดหลัก:</span>
                        <span>{activeMerchant.category}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">เบอร์จองไรเดอร์:</span>
                        <span>{activeMerchant.phone}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">ผู้ขออนุญาตจดทะเบียน:</span>
                        <span>{activeMerchant.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">ใบสิทธิบัตร/ไฟล์แนบอัปโหลดล่าสุด:</span>
                        <span className="font-mono text-stone-500 bg-neutral-100 p-1 rounded inline-block text-[10px]">
                          {activeMerchant.documentName}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block mb-0.5">พิกัดร้านค้า:</span>
                        <p className="bg-neutral-50 rounded p-2 text-stone-600 border border-neutral-100 leading-relaxed text-[11px]">
                          {activeMerchant.address}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3 flex justify-between">
                      <button
                        onClick={() => setActiveMerchantId(null)}
                        className="text-xs font-bold text-red-500 hover:underline py-1"
                      >
                        🚪 ลงชื่อออกจากร้านนี้
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Menu Item Add / Edit Popup Form */}
      <AnimatePresence>
        {isMenuFormOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg w-full max-w-sm p-4 shadow-xl"
              id="menu-form-dialog"
            >
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h3 className="font-extrabold text-neutral-900 text-sm">
                  {editingMenuItem ? '✍️ แก้ไขรายการเมนูอาหาร' : '➕ เพิ่มรายการเมนูอาหารอันเลอค่า'}
                </h3>
                <button onClick={() => setIsMenuFormOpen(false)} className="text-xs text-neutral-400 hover:text-stone-800">
                  ปิดหน้าต่าง
                </button>
              </div>

              <form onSubmit={handleMenuSubmit} className="space-y-3.5 text-xs text-neutral-700">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1 pointer-events-none">ชื่อประเภทอาหาร/รูปสัญลักษณ์ (Emoji)</label>
                  <select
                    value={menuIcon}
                    onChange={(e) => setMenuIcon(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded text-center text-lg bg-neutral-50"
                  >
                    {['🍔', '🍟', '🍕', '🍳', '🥩', '🥓', '🍗', '🍜', '🍛', '🍱', '🥗', '🍲', '🧉', '🥤', '🍵', '🍮', '🍰', '🥭', '🍋', '🍇', '🍉'].map(em => (
                      <option key={em} value={em}>{em} สัญลักษณ์อาหาร</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1">ชื่อรายการอาหาร (ภาษาไทย)</label>
                  <input
                    type="text"
                    required
                    placeholder="อย่างเช่น ข้าวหมูกรอบนุ่มพริกจิ้มสูตรเจ๋ง"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    className="w-full p-2.5 border border-neutral-200 rounded focus:outline-none focus:border-[#06c755]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1">ราคาจำหน่าย (บาท - THB)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="เช่น 60, 120"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    className="w-full p-2.5 border border-neutral-200 rounded font-extrabold text-[#06c755] focus:outline-none focus:border-[#06c755]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1">คำบรรยายส่วนผสมหรือสูตรอาหาร</label>
                  <textarea
                    rows={2}
                    placeholder="ใส่รายละเอียดยั่วน้ำลายเพื่อกระตุ้นยอดขายสั่งซื้อของคุณ"
                    value={menuDesc}
                    onChange={(e) => setMenuDesc(e.target.value)}
                    className="w-full p-2.5 border border-neutral-200 rounded focus:outline-none focus:border-[#06c755]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMenuFormOpen(false)}
                    className="flex-1 py-2 border rounded font-semibold text-neutral-500 hover:bg-neutral-50"
                  >
                    ยกเลิกแบบฟอร์ม
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded font-[#06c755] bg-[#06c755] hover:bg-[#05b04b] text-white font-extrabold"
                  >
                    บันทึกรายการ
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
