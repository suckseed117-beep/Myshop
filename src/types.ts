/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Merchant {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  distance: number; // in kilometers
  phone: string;
  address: string;
  description: string;
  ownerName: string;
  documentName: string;
  status: 'approved' | 'pending' | 'rejected';
  balance: number; // Store total earnings (sales after 3% commission)
  monthlyFeePaid: boolean;
  monthlyFeeDueDate: string; // ISO date string
}

export interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
}

export interface CartItem {
  id: string; // menuItem id
  name: string;
  price: number;
  quantity: number;
  merchantId: string;
  merchantName: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  merchantId: string;
  merchantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  commissionDeducted: number; // 3% of subtotal
  total: number;
  distanceValue: number; // in km
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'in_delivery' | 'completed' | 'cancelled';
  paymentMethod: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  walletBalance: number;
}
