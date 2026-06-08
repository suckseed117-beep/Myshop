/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Merchant, MenuItem } from './types';

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'mer-1',
    name: 'กะเพราสะเล้ง พ่นไฟ 🔥',
    category: 'อาหารคาว',
    rating: 4.8,
    image: '🍳',
    distance: 0.7, // Near <= 1km
    phone: '081-234-5678',
    address: 'ซอยสุขุมวิท 23 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ',
    description: 'ผัดกะเพราแท้สูตรโบราณ เผ็ดร้อนด้วยพริกแห้งและพริกขี้หนูสวน สะใจคออาหารไทย!',
    ownerName: 'สมชาย พ่นไฟ',
    documentName: 'ใบอนุญาตประกอบกิจการ_สมชาย.pdf',
    status: 'approved',
    balance: 450,
    monthlyFeePaid: true,
    monthlyFeeDueDate: '2026-07-08T00:00:00.000Z'
  },
  {
    id: 'mer-2',
    name: 'ชาไทยสะเล้ง มุกทอง 🧋',
    category: 'เครื่องดื่ม',
    rating: 4.9,
    image: '🥤',
    distance: 1.5, // Far > 1km
    phone: '082-987-6543',
    address: 'หน้าตลาดสะเล้ง ซอย 3 เขตวัฒนา กรุงเทพฯ',
    description: 'ชาไทยพรีเมียมต้มสดใหม่ทุกวัน รสชาติเข้มข้น หอมกลิ่นชาปักษ์ใต้แท้ๆ โรยมุกสีทองเคี้ยวหนึบ',
    ownerName: 'นริศรา มีสุข',
    documentName: 'ทะเบียนการค้า_ชาไทยมุกทอง.pdf',
    status: 'approved',
    balance: 780,
    monthlyFeePaid: false,
    monthlyFeeDueDate: '2026-06-15T00:00:00.000Z'
  },
  {
    id: 'mer-3',
    name: 'ข้าวเหนียวมะม่วง ป้าหวาน 🥭',
    category: 'ของหวาน',
    rating: 4.7,
    image: '🍽️',
    distance: 2.2, // Far > 1km
    phone: '085-555-1234',
    address: 'ปากซอยทองหล่อ 10 เขตวัฒนา กรุงเทพฯ',
    description: 'มะม่วงน้ำดอกไม้หวานฉ่ำคัดพิเศษ ทานคู่กับข้าวเหนียวมูนนุ่มราดกะทิสดสูตรลับเฉพาะคุณยายหวาน',
    ownerName: 'สมศรี มั่นคง',
    documentName: 'บัตรประชาชน_สมศรี.pdf',
    status: 'approved',
    balance: 1250,
    monthlyFeePaid: true,
    monthlyFeeDueDate: '2026-07-05T00:00:00.000Z'
  },
  {
    id: 'mer-4',
    name: 'เจ๊ดา ส้มตำแซ่บสะเด็ด 🌶️',
    category: 'อาหารอีสาน',
    rating: 4.6,
    image: '🥗',
    distance: 0.9, // Near <= 1km
    phone: '089-111-2222',
    address: 'ซอยปรีดีพนมยงค์ 14 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ',
    description: 'ส้มตำนัวๆ แซ่บถึงใจ ขนมจีนเส้นสด น้ำปลาร้าต้มสุกสูตรเจ๊ดา สะอาด อร่อยชัวร์',
    ownerName: 'รัตนา นัวดี',
    documentName: 'ใบจดทะเบียนพาณิชย์_รัตนา.pdf',
    status: 'approved',
    balance: 190,
    monthlyFeePaid: true,
    monthlyFeeDueDate: '2026-07-01T00:00:00.000Z'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Graprao Sa-laeng Items
  {
    id: 'menu-1',
    merchantId: 'mer-1',
    name: 'ข้าวราดกะเพราเนื้อสับโบราณ + ไข่ดาว',
    price: 85,
    description: 'เนื้อสับคัดเกรด ผัดคั่วแห้งด้วยน้ำมันน้อย พริกแห้งสามสายพันธุ์ และใบกะเพราหอมป่านอกสวน เสิร์ฟร้อนพร้อมผัดข้าวหอมมะลิและไข่ดาวกรอบ',
    image: '🥩',
    available: true
  },
  {
    id: 'menu-2',
    merchantId: 'mer-1',
    name: 'ข้าวหมูกรอบคั่วพริกเกลือสะดุ้งกระทะ',
    price: 90,
    description: 'หมูกรอบสัญชาติไทย หนังกรอบเนื้อนุ่มละมุน ผัดคั่วพริกเกลือกระเทียมสดแห้ง หวานปนเค็มกลมกล่อม',
    image: '🥓',
    available: true
  },
  {
    id: 'menu-3',
    merchantId: 'mer-1',
    name: 'ผัดกะเพราเต้าหู้หมูสับราดข้าว',
    price: 75,
    description: 'เต้าหู้ไข่ทองคำทอดกรอบผัดใส่หมูสับและใบกะเพรานุ่ม เป็นเมนูดังที่กินได้ทุกวัย',
    image: '🍲',
    available: true
  },

  // Thai Tea Items
  {
    id: 'menu-4',
    merchantId: 'mer-2',
    name: 'ชาไทยพรีเมียมไข่มุกสีทอง (สูตรเข้มข้น)',
    price: 55,
    description: 'ชาไทยสกัดเข้มข้น ผสมนมสดแท้ 100% หวานมันกลมกล่อม ท็อปด้วยเม็ดไข่มุกสีทองเคลือบน้ำผึ้งชันโรง',
    image: '🥛',
    available: true
  },
  {
    id: 'menu-5',
    merchantId: 'mer-2',
    name: 'ชานมไต้หวันพ่นไฟลาวาบราวน์ชูการ์',
    price: 60,
    description: 'ชานมไต้หวันแท้หอมใบชานำเข้า ราดซอสบราวน์ชูการ์ลายลาวา พร้อมคาราเมลพ่นไฟหอมกลิ่นน้ำตาลไหม้',
    image: '🍯',
    available: true
  },
  {
    id: 'menu-6',
    merchantId: 'mer-2',
    name: 'มัทฉะอุจิลาเต้เย็นออแกนิก',
    price: 65,
    description: 'ผงมัทฉะแท้เกรดพิธีการ ส่งตรงจากเมืองอุจิ จังหวัดเกียวโต ชงเข้มข้นคู่กับนมสดนิ่มละมุนลิ้น',
    image: '🍵',
    available: true
  },

  // Mango Sticky Rice Items
  {
    id: 'menu-7',
    merchantId: 'mer-3',
    name: 'ข้าวเหนียวมะม่วงน้ำดอกไม้ชุดเล็กอิ่มเดี่ยว',
    price: 80,
    description: 'ข้าวเหนียวมูนนุ่มหอมกลิ่นใบเตย ราดน้ำกะทิเค็มๆ หวานๆ พร้อมมะม่วงน้ำดอกไม้สุกหวานฉ่ำครึ่งซีก',
    image: '🍋',
    available: true
  },
  {
    id: 'menu-8',
    merchantId: 'mer-3',
    name: 'ข้าวเหนียวมะม่วงชุดทองหล่อคูณสอง (จุใจ)',
    price: 150,
    description: 'ข้าวเหนียวมูนครึ่งกิโลกรัม มะม่วงน้ำดอกไม้เสิร์ฟจุใจสองผลใหญ่ เหมาะสำหรับแชร์ทานสองถึงสามท่าน',
    image: '🍮',
    available: true
  },
  {
    id: 'menu-9',
    merchantId: 'mer-3',
    name: 'ข้าวเหนียวทุเรียนหมอนทองระย้ากะทิสด',
    price: 120,
    description: 'เนื้อทุเรียนหมอนทองคัดเกรดกรอบนอกนุ่มใน หวานมัน เสิร์ฟบนข้าวเหนียวมูนกะทิข้นร้อนฉ่า',
    image: '🍈',
    available: false
  },

  // Somtum Items
  {
    id: 'menu-10',
    merchantId: 'mer-4',
    name: 'ส้มตำไทยไข่เค็มสระบุรีนัวครบรส',
    price: 60,
    description: 'ส้มตำมะละกอสดกรอบ ตำพริกกระเทียม ถั่วลิสงคั่วเอง บีบมะนาวคั้นสด ท็อปไข่เค็มมันเยิ้มเลิศรส',
    image: '🥗',
    available: true
  },
  {
    id: 'menu-11',
    merchantId: 'mer-4',
    name: 'คอหมูย่างนุ่มน้ำตกแซ่บสะเด็ด',
    price: 110,
    description: 'คอหมูแท้ติดมันบางๆ หมักสูตรเจ๊ดาย่างเตาถ่านหอมกรุ่น นำมาปรุงน้ำตกใส่ข้าวคั่ว พริกป่น และผักชีฝรั่ง',
    image: '🥩',
    available: true
  },
  {
    id: 'menu-12',
    merchantId: 'mer-4',
    name: 'ไก่ย่างสมุนไพรสูตรขมิ้นทอง (ครึ่งตัว)',
    price: 140,
    description: 'ไก่หมักขมิ้น ตะไคร้ และกระเทียมย่างสดๆ จน หนังเหลืองกรอบ เนื้อด้านในยังนุ่มฉ่ำ ทานคู่น้ำจิ้มแจ่วสุดจัดจ้าน',
    image: '🍗',
    available: true
  }
];

export const CATEGORIES = ['ทั้งหมด', 'อาหารคาว', 'เครื่องดื่ม', 'ของหวาน', 'อาหารอีสาน'];
