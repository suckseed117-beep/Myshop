/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Compass, CheckCircle2, XCircle, Users, Activity, BarChart3, Truck, DollarSign, Wallet, FileText, Check, Phone, MapPin, Sparkles } from 'lucide-react';
import { Merchant, Order } from '../types';

interface AdminRoleProps {
  merchants: Merchant[];
  orders: Order[];
  approveMerchant: (id: string) => void;
  rejectMerchant: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export default function AdminRole({
  merchants,
  orders,
  approveMerchant,
  rejectMerchant,
  updateOrderStatus
}: AdminRoleProps) {
  // Navigation tabs within Admin Panel
  const [adminTab, setAdminTab] = useState<'logistics' | 'applications' | 'oversight'>('logistics');

  // Filter pending merchant applications
  const pendingMerchants = merchants.filter(m => m.status === 'pending');

  // Filter logistics queues
  const pickupQueue = orders.filter(o => o.status === 'ready_for_pickup');
  const deliveryQueue = orders.filter(o => o.status === 'in_delivery');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const finishedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  // PLATFORM FINANCIAL LEDGER STATS
  // 1. Commission collected: 3% of subtotal for completed orders
  const totalCommissionRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.commissionDeducted, 0);

  // 2. Monthly flat fee collections: 50 THB from every merchant who has monthlyFeePaid === true
  // Let's count how many merchants paid in history or are updated.
  // We can count merchants.filter(m => m.monthlyFeePaid === true) and sum 50 THB!
  const paidMerchantsCount = merchants.filter(m => m.monthlyFeePaid).length;
  const totalMonthlyFeesCollected = paidMerchantsCount * 50;

  // 3. Logistics Rider delivery earnings: all delivery fees from successfully completed orders
  const totalDeliveryFeesRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.deliveryFee, 0);

  // 4. Overall absolute platform gross volume or net revenue
  const platformNetRevenue = totalCommissionRevenue + totalMonthlyFeesCollected + totalDeliveryFeesRevenue;

  return (
    <div className="min-h-screen bg-earth-sand pb-24 text-earth-bark font-sans" id="admin-role-root">
      {/* Admin Header */}
      <div className="bg-brand text-earth-sand px-4 py-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 p-1.5 bg-white/10 rounded-xl text-white border border-white/10" />
            <div>
              <h1 className="text-base font-black tracking-tight text-white">ศูนย์ควบคุมหลักแอดมิน</h1>
              <p className="text-[11px] text-brand-light font-bold">Sa-laeng Admin Operations</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2.5 py-1 rounded-full inline-block animate-pulse shadow-sm border border-amber-500/20">
              สิทธิจัดการระบบสูงสุด (Rider & Manager)
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 mt-5">
        
        {/* Sub-Tabs navigation */}
        <div className="flex bg-earth-linen p-1 rounded-xl mb-5 border border-earth-linen/45">
          <button
            onClick={() => setAdminTab('logistics')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'logistics' ? 'bg-white text-brand shadow-xs' : 'text-earth-moss'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> ไรเดอร์สะเล้ง ({pickupQueue.length + deliveryQueue.length} คิวงาน)
          </button>
          <button
            onClick={() => setAdminTab('applications')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all relative cursor-pointer ${
              adminTab === 'applications' ? 'bg-white text-brand shadow-xs' : 'text-earth-moss'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> อนุมัติร้านค้า ({pendingMerchants.length})
            {pendingMerchants.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5 font-bold animate-bounce">
                {pendingMerchants.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('oversight')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              adminTab === 'oversight' ? 'bg-white text-brand shadow-xs' : 'text-earth-moss'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> ภาพรวมเก็บค่าบำรุง
          </button>
        </div>

        {/* TAB 1: COURIER (THE RIDER OPERATION LOGISTICS) */}
        {adminTab === 'logistics' && (
          <div className="space-y-4">
            
            {/* Courier Rules Reminder Card */}
            <div className="bg-[#2e2b24] text-earth-sand p-3.5 rounded-xl border border-[#3e3a31] flex gap-3 shadow-sm select-none">
              <Compass className="text-brand w-5 h-5 flex-shrink-0 animate-spin" />
              <div>
                <h4 className="text-xs font-bold text-brand-light">คู่สัญญาระยะทาง แผนที่คำนวณราคาขนส่ง</h4>
                <p className="text-[10px] text-earth-sand/85 leading-relaxed mt-1">
                  • <b>ใกล้ (Near &lt;= 1 กม.)</b>: คิดค่าจัดส่ง <b>10 บาท</b> สำหรับช่วยเหลือค่าบำรุงสะเล้งไรเดอร์ค่าน้ำมันเบลนด์<br />
                  • <b>ไกล (Far &gt; 1 กม.)</b>: คิดค่าจัดส่ง <b>20 บาท</b> เนื่องจากเป็นสัญลักษณ์เขตเชื่อมรอบนอก
                </p>
              </div>
            </div>

            {/* A. Queue 1: Ready for pickup queue */}
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                📦 คิวรอไรเดอร์เข้ารับที่ร้าน ({pickupQueue.length} รายการ)
              </h3>
              {pickupQueue.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center border border-neutral-100 shadow-xs pointer-events-none">
                  <p className="text-xs text-neutral-500">รอร้านค้าเตรียมอาหารให้เสร็จสิ้น จะเริ่มปรากฏพิกัดที่นี่ค่ะ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pickupQueue.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg p-3.5 border border-dashed border-indigo-400 shadow-xs">
                      <div className="flex justify-between text-xs font-bold text-neutral-800 pb-2 border-b border-neutral-50 mb-2">
                        <span>🏷️ ร้าน: {order.merchantName}</span>
                        <span className="text-indigo-600">ปรุงเสร็จพร้อมขนส่ง</span>
                      </div>
                      
                      <div className="text-xs text-neutral-600 space-y-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>ระยะขนส่ง: <b>{order.distanceValue} กม.</b> • ขนส่งเฉลี่ย {order.distanceValue <= 1.0 ? 'ใกล้' : 'ไกล'}</span>
                        </p>
                        <p className="font-bold flex justify-between text-neutral-700 bg-neutral-50 p-1.5 rounded mt-1">
                          <span>ค่าส่งที่ต้องจ่ายให้แอดมินไรเดอร์:</span>
                          <span className="text-brand font-extrabold">฿{order.deliveryFee}</span>
                        </p>
                        <p className="mt-1">📍 ปลายทางจัดส่ง: {order.customerAddress}</p>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'in_delivery');
                            alert('สะเล้งไรเดอร์แอดมินสลักรับอาหารและกำลังเดินทางไปส่ง!');
                          }}
                          className="bg-brand hover:bg-brand-hover text-white text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                        >
                          🛵 ไรเดอร์เข้ารับอาหาร & เริ่มเดินทาง (Pickup)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* B. Queue 2: In-transit route delivery queue */}
            <div>
              <h3 className="text-xs font-bold text-earth-moss uppercase tracking-wider mb-2.5">
                ⚡ คิวอยู่ระหว่างนำส่งปลายทาง ({deliveryQueue.length} รายการ)
              </h3>
              {deliveryQueue.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-earth-linen shadow-xs pointer-events-none">
                  <p className="text-xs text-earth-moss font-medium">ไม่มีสินค้าคิวผูกเบาะที่วิ่งอยู่บนถนน</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveryQueue.map((order) => (
                    <div key={order.id} className="bg-[#2e2b24] text-earth-sand rounded-xl p-3.5 border border-[#3e3a31] shadow-sm">
                      <div className="flex justify-between text-xs font-bold pb-2 border-b border-[#3e3a31] mb-2">
                        <span>📍 ขนส่งจาก: {order.merchantName}</span>
                        <span className="text-amber-500 animate-pulse font-bold">กำลังล้อเหยียบถนน</span>
                      </div>
                      
                      <div className="text-xs text-earth-sand/90 space-y-1">
                        <p>👤 ผู้รับ: <b>{order.customerName}</b> (📲 {order.customerPhone})</p>
                        <p className="bg-[#3e3a31] text-brand-light font-bold p-1 rounded-lg">
                          🎯 นำส่งพิกัด: {order.customerAddress}
                        </p>
                        <p className="flex justify-between mt-1 text-[11px]">
                          <span>ระยะทาง: {order.distanceValue} กม.</span>
                          <span>ได้รับค่าเหนื่อยไรเดอร์: <b className="text-white">฿{order.deliveryFee}</b></span>
                        </p>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'completed');
                            alert('ออเดอร์จัดส่งสำเร็จเรียบร้อย มีการโอนรายรับให้ร้านเสร็จสิ้น!');
                          }}
                          className="bg-brand hover:bg-brand-hover text-white text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                        >
                          🏁 ส่งมอบถึงมือเรียบร้อย & ปิดบิล (Deliver to customer)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* C. Operations Queue checklist */}
            <div className="bg-white rounded-lg p-4 border border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-400 uppercase mb-3">ตรวจสอบสถานะอื่นในตลาด</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-600 py-1.5 border-b border-neutral-50">
                  <span>🍳 ครัวอยู่ระหว่างการสั่ง/ปรุงอาหาร (Preparing / Pending):</span>
                  <span className="font-extrabold text-neutral-800">{pendingOrders.length} รายการ</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600 py-0.5">
                  <span>🏁 บิลประวัติสำเร็จ / ยกเลิกคลัง (Completed / Cancelled):</span>
                  <span className="font-extrabold text-[#06c755]">{finishedOrders.length} รายการ</span>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* TAB 2: PENDING MERCHANT APPLICATIONS */}
        {adminTab === 'applications' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              📝 คำยื่นจดสิทธิ์พาร์ทเนอร์ร้านค้าเปิดสาขา ({pendingMerchants.length} รายการ)
            </h3>

            {pendingMerchants.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center border border-earth-linen shadow-xs pointer-events-none">
                <div className="w-12 h-12 bg-brand-light text-brand rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-earth-bark">ไม่มีร้านอาหารส่งคำขอตรวจสอบค้างอยู่</p>
                <p className="text-xs text-earth-moss/70 mt-1 leading-relaxed">
                  ร้านค้าคู่สัญญาปัจจุบัน ทั้งหมดอยู่ระหว่างเปิดดำเนินการหรือสมัครเรียบร้อยแล้วค่ะ
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingMerchants.map((app) => (
                  <div key={app.id} className="bg-white rounded-xl p-4 border border-earth-linen shadow-sm">
                    <div className="flex justify-between items-start border-b border-earth-linen pb-3.5 mb-3.5">
                      <div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-200">
                          รอแอนมินอนุมัติสิทธิ์พาร์ทเนอร์
                        </span>
                        <h4 className="font-extrabold text-sm text-earth-bark mt-2">{app.name}</h4>
                        <p className="text-xs text-earth-moss mt-0.5">ประเภท: <b>{app.category}</b></p>
                      </div>
                    </div>

                    <div className="text-xs text-earth-moss space-y-2 leading-relaxed bg-earth-sand p-3 rounded-lg border border-earth-linen/60">
                      <div>
                        <span className="font-bold text-earth-moss/70 block text-[10px]">เบอร์โทรร้านอาหาร:</span>
                        <span>{app.phone}</span>
                      </div>
                      <div>
                        <span className="font-bold text-earth-moss/70 block text-[10px]">ผู้แทนผู้จดสิทธิ์เจ้าของ:</span>
                        <span>{app.ownerName}</span>
                      </div>
                      <div>
                        <span className="font-bold text-earth-moss/70 block text-[10px]">ไฟล์ประกอบเอกสารอ้างอิง:</span>
                        <span className="font-mono text-[10px] bg-earth-linen px-1 rounded block mt-0.5">{app.documentName}</span>
                      </div>
                      <div>
                        <span className="font-bold text-earth-moss/70 block text-[10px]">พิกัดปักหมุดขนส่ง:</span>
                        <span>{app.address}</span>
                      </div>
                    </div>

                    {/* Operational controls button for Admin */}
                    <div className="flex gap-2.5 mt-4">
                      <button
                        onClick={() => {
                          if (confirm(`คุณปฏิเสธไม่ให้สิทธิ์ร้าน "${app.name}" ร่วมทำสัญญาตลาดสะเล้งใช่หรือไม่?`)) {
                            rejectMerchant(app.id);
                            alert('ดำเนินการระงับ/ปฏิเสธเรียบร้อย');
                          }
                        }}
                        className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> ปฏิเสธคำขอ (Reject)
                      </button>
                      
                      <button
                        onClick={() => {
                          approveMerchant(app.id);
                          alert(`ยินดีต้อนรับพาร์ทเนอร์! อนุมัติสำเร็จ ร้านค้า "${app.name}" พร้อมเปิดหน้าร้านให้ลูกค้ากดซื้ออาหารได้ทันทีแล้วค่ะ`);
                        }}
                        className="flex-1 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        id={`approve-button-${app.id}`}
                      >
                        <Check className="w-4 h-4" /> อนุมัติคู่สัญญา (Approve)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PLATFORM REVENUE OVERSIGHT */}
        {adminTab === 'oversight' && (
          <div className="space-y-4">
            
            {/* Ledger Statistics Cards */}
            <div className="bg-white rounded-xl p-4 border border-earth-linen shadow-sm">
              <h3 className="font-extrabold text-earth-bark border-b border-earth-linen pb-2 text-sm">💰 สมุดบันทึกรายรับของแพลตฟอร์มสะเล้ง</h3>
              
              <div className="space-y-3.5 mt-4">
                <div className="flex justify-between items-center text-xs text-earth-moss">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                    ค่าคอมมิชชั่นสะสม (3% ของยอดขายร้าน):
                  </span>
                  <strong className="font-mono text-earth-bark text-sm">฿{totalCommissionRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="flex justify-between items-center text-xs text-earth-moss">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
                    ค่าธรรมเนียมรายเดือนร้านค้า (50 บาท/เดือน):
                  </span>
                  <strong className="font-mono text-earth-bark text-sm">฿{totalMonthlyFeesCollected.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="flex justify-between items-center text-xs text-earth-moss">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    รายได้ค่าน้ำมันสะเล้งไรเดอร์ (ค่าส่งสินค้า):
                  </span>
                  <strong className="font-mono text-earth-bark text-sm">฿{totalDeliveryFeesRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="border-t border-earth-linen pt-3 flex justify-between items-center bg-brand-light/30 p-2.5 rounded-xl border border-brand/20">
                  <span className="font-extrabold text-earth-bark text-xs">ยอดเงินรายได้สะสมเข้าระบบทั้งหมด:</span>
                  <strong className="font-mono text-lg font-black text-brand">฿{platformNetRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            {/* Merchant fee collectors audit and compliance checklist */}
            <div className="bg-white rounded-xl p-4 border border-earth-linen shadow-xs">
              <h4 className="text-xs font-bold text-earth-moss uppercase tracking-wide mb-3 pointer-events-none">
                ตรวจสอบสถานะเก็บค่าธรรมเนียมบำรุงแพลตฟอร์มรายเดือน (50 THB)
              </h4>
              <div className="space-y-2">
                {merchants.map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-xs py-1.5 border-b border-earth-linen/40 last:border-0 font-medium">
                    <span className="font-bold text-earth-bark">{m.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.monthlyFeePaid ? 'bg-brand-light text-brand' : 'bg-amber-100 text-amber-800'}`}>
                      {m.monthlyFeePaid ? '✅ ชำระเม็ดเงินแล้ว (50 THB)' : '⚠️ ติดค้างค่านิติกรรม 50 THB'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
