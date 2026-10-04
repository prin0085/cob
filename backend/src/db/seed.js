// Seed script: creates admin/editor users and demo content for the COB brand.
// Run with: npm run seed
import { db } from './index.js';
import { config } from '../config.js';
import { hashPassword } from '../utils/auth.js';
import { slugify } from '../utils/helpers.js';

// Placeholder image helper (deterministic per seed so layout is stable).
const img = (seed, w = 1200, h = 1500) => `https://picsum.photos/seed/cob-${seed}/${w}/${h}`;

function upsertUser(name, email, password, role) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    db.prepare('UPDATE users SET name=?, password_hash=?, role=? WHERE id=?').run(
      name, hashPassword(password), role, existing.id
    );
  } else {
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)').run(
      name, email, hashPassword(password), role
    );
  }
}

const products = [
  {
    name: 'Cream Coff',
    name_th: 'ครีม คอฟ',
    category: 'Coffee Cream Liqueur',
    category_th: 'ครีมลิเคียวร์กาแฟ',
    description:
      'A coffee cream flavoured liqueur built on Thai Arabica coffee, fermented with distilled Thai craft spirits, milk cream, vanilla and caramel.',
    description_th:
      'ครีมลิเคียวร์กลิ่นกาแฟจากกาแฟอาราบิก้าไทย หมักร่วมกับสุรากลั่นคราฟต์ไทย นมครีม วานิลลา และคาราเมล',
    alcohol: '8.0% vol',
    volume: '500 ml',
    country: 'Thailand',
    country_th: 'ประเทศไทย',
    region: 'Nong Bua Lam Phu',
    region_th: 'หนองบัวลำภู',
    vintage: 'NV',
    vintage_th: 'ไม่ระบุปี',
    aroma: 'Roasted Arabica, warm caramel, soft vanilla.',
    aroma_th: 'กาแฟอาราบิก้าคั่ว คาราเมลอุ่น ๆ วานิลลานุ่มนวล',
    taste: 'Silky coffee cream with rounded caramel sweetness.',
    taste_th: 'ครีมกาแฟเนียนนุ่ม กับความหวานคาราเมลกลมกล่อม',
    finish: 'Smooth, lingering mocha warmth.',
    finish_th: 'ปลายรสนุ่มนวล อบอวลกลิ่นมอคค่า',
    food_pairing: 'Dark chocolate, tiramisu, roasted nuts.',
    food_pairing_th: 'ดาร์กช็อกโกแลต ทีรามิสุ ถั่วอบ',
    featured: 1,
    seed: 'coff',
  },
  {
    name: 'Cream Choc',
    name_th: 'ครีม ช็อก',
    category: 'Chocolate Cream Liqueur',
    category_th: 'ครีมลิเคียวร์ช็อกโกแลต',
    description:
      'A chocolate cream flavoured liqueur made with Nan cacao fermented with distilled Thai craft spirits, milk cream, vanilla and caramel.',
    description_th:
      'ครีมลิเคียวร์กลิ่นช็อกโกแลตจากโกโก้น่าน หมักร่วมกับสุรากลั่นคราฟต์ไทย นมครีม วานิลลา และคาราเมล',
    alcohol: '8.0% vol',
    volume: '500 ml',
    country: 'Thailand',
    country_th: 'ประเทศไทย',
    region: 'Nan Province Cacao',
    region_th: 'โกโก้จังหวัดน่าน',
    vintage: 'NV',
    vintage_th: 'ไม่ระบุปี',
    aroma: 'Cocoa, vanilla, gentle cream.',
    aroma_th: 'โกโก้ วานิลลา ครีมละมุน',
    taste: 'Rich chocolate cream, balanced and velvety.',
    taste_th: 'ครีมช็อกโกแลตเข้มข้น สมดุลและนุ่มลิ้น',
    finish: 'Long, chocolatey and smooth.',
    finish_th: 'ปลายรสยาวนาน กลิ่นช็อกโกแลตนุ่มนวล',
    food_pairing: 'Berries, brownies, aged cheese.',
    food_pairing_th: 'เบอร์รี บราวนี ชีสบ่ม',
    featured: 1,
    seed: 'choc',
  },
  {
    name: 'Spice Choc',
    name_th: 'สไปซ์ ช็อก',
    category: 'Spiced Chocolate Cream Liqueur',
    category_th: 'ครีมลิเคียวร์ช็อกโกแลตสไปซ์',
    description:
      'A spiced chocolate cream flavoured liqueur. Nan cacao fermented with distilled Thai craft spirits, milk cream, vanilla and limonella.',
    description_th:
      'ครีมลิเคียวร์ช็อกโกแลตกลิ่นเครื่องเทศ โกโก้น่านหมักร่วมกับสุรากลั่นคราฟต์ไทย นมครีม วานิลลา และลิโมเนลลา',
    alcohol: '8.0% vol',
    volume: '500 ml',
    country: 'Thailand',
    country_th: 'ประเทศไทย',
    region: 'Nan Province Cacao',
    region_th: 'โกโก้จังหวัดน่าน',
    vintage: 'NV',
    vintage_th: 'ไม่ระบุปี',
    aroma: 'Cocoa with bright limonella lift and warm spice.',
    aroma_th: 'โกโก้กับกลิ่นลิโมเนลลาสดใสและเครื่องเทศอุ่น ๆ',
    taste: 'Chocolate cream with a fragrant citrus-spice edge.',
    taste_th: 'ครีมช็อกโกแลตกับสัมผัสซิตรัส-เครื่องเทศหอมกรุ่น',
    finish: 'Warm, spiced and refreshing.',
    finish_th: 'ปลายรสอุ่น กลิ่นเครื่องเทศ สดชื่น',
    food_pairing: 'Spiced desserts, citrus tart, dark chocolate.',
    food_pairing_th: 'ของหวานเครื่องเทศ ทาร์ตซิตรัส ดาร์กช็อกโกแลต',
    featured: 1,
    seed: 'spice',
  },
  {
    name: 'Reserve Cacao',
    name_th: 'รีเสิร์ฟ คาเคา',
    category: 'Reserve Chocolate Liqueur',
    category_th: 'ช็อกโกแลตลิเคียวร์รุ่นรีเสิร์ฟ',
    description:
      'A limited reserve expression showcasing single-origin Thai cacao with deeper body and extended fermentation.',
    description_th:
      'รุ่นรีเสิร์ฟจำนวนจำกัด นำเสนอโกโก้ไทยจากแหล่งเดียว ด้วยบอดี้ที่เข้มข้นและการหมักที่ยาวนานขึ้น',
    alcohol: '8.0% vol',
    volume: '500 ml',
    country: 'Thailand',
    country_th: 'ประเทศไทย',
    region: 'Nan Province Cacao',
    region_th: 'โกโก้จังหวัดน่าน',
    vintage: 'Reserve',
    vintage_th: 'รีเสิร์ฟ',
    aroma: 'Intense dark cocoa, dried fruit, cream.',
    aroma_th: 'โกโก้เข้มข้น ผลไม้แห้ง ครีม',
    taste: 'Full-bodied, layered chocolate with soft tannin.',
    taste_th: 'บอดี้เต็ม ช็อกโกแลตหลายชั้น แทนนินนุ่มนวล',
    finish: 'Deep and elegant.',
    finish_th: 'ปลายรสลึกและสง่างาม',
    food_pairing: 'Espresso, dark chocolate truffles.',
    food_pairing_th: 'เอสเปรสโซ ทรัฟเฟิลดาร์กช็อกโกแลต',
    featured: 0,
    seed: 'reserve',
  },
];

function seedProducts() {
  db.prepare('DELETE FROM product_images').run();
  db.prepare('DELETE FROM products').run();
  const insert = db.prepare(
    `INSERT INTO products (name, slug, category, description, alcohol, volume, country, region,
      vintage, aroma, taste, finish, food_pairing, main_image, status, featured, sort_order,
      name_th, category_th, description_th, country_th, region_th, vintage_th,
      aroma_th, taste_th, finish_th, food_pairing_th)
     VALUES (@name,@slug,@category,@description,@alcohol,@volume,@country,@region,
      @vintage,@aroma,@taste,@finish,@food_pairing,@main_image,1,@featured,@sort_order,
      @name_th,@category_th,@description_th,@country_th,@region_th,@vintage_th,
      @aroma_th,@taste_th,@finish_th,@food_pairing_th)`
  );
  const insertImg = db.prepare(
    'INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?,?,?,?)'
  );
  products.forEach((p, i) => {
    const info = insert.run({
      name_th: null, category_th: null, description_th: null, country_th: null,
      region_th: null, vintage_th: null, aroma_th: null, taste_th: null,
      finish_th: null, food_pairing_th: null,
      ...p,
      slug: slugify(p.name),
      main_image: img(p.seed),
      sort_order: i,
    });
    // gallery images
    [0, 1, 2].forEach((n) =>
      insertImg.run(info.lastInsertRowid, img(`${p.seed}-${n}`), `${p.name} photo ${n + 1}`, n)
    );
  });
}

function seedHomepage() {
  const sections = {
    hero: {
      logo: 'COB',
      heading: 'The Art of Thai Craft Liqueur',
      heading_th: 'ศิลปะแห่งคราฟต์ลิเคียวร์ไทย',
      description:
        'Small-batch cream liqueurs crafted in Nong Bua Lam Phu from Thai cacao, Arabica coffee and distilled craft spirits.',
      description_th:
        'คราฟต์ครีมลิเคียวร์ชุดเล็กจากหนองบัวลำภู ผลิตจากโกโก้ไทย กาแฟอาราบิก้า และสุรากลั่นคราฟต์',
      buttonText: 'DISCOVER OUR COLLECTION',
      buttonText_th: 'สำรวจคอลเลกชันของเรา',
      buttonLink: '/#collection',
      backgroundImage: img('hero', 1920, 1080),
    },
    story: {
      heading: 'Our Story',
      heading_th: 'เรื่องราวของเรา',
      description:
        'COB — Chamber of Beverage — began with a simple belief: Thailand grows some of the world\u2019s finest cacao and coffee, and they deserve a spirit worthy of them. From our home in Nong Bua Lam Phu, we ferment single-origin ingredients with distilled Thai craft spirits, blending patience with precision to create cream liqueurs that are unmistakably ours.',
      description_th:
        'COB — Chamber of Beverage — เริ่มต้นจากความเชื่อง่าย ๆ ว่าประเทศไทยปลูกโกโก้และกาแฟที่ดีที่สุดในโลก และสมควรได้รับการรังสรรค์เป็นสุราที่คู่ควร จากบ้านของเราในหนองบัวลำภู เราหมักวัตถุดิบจากแหล่งเดียวร่วมกับสุรากลั่นคราฟต์ไทย ผสมผสานความอดทนกับความประณีต เพื่อสร้างครีมลิเคียวร์ที่เป็นเอกลักษณ์ของเราอย่างแท้จริง',
      image: img('story', 1200, 1400),
    },
    philosophy: {
      heading: 'Crafted with Passion',
      heading_th: 'สร้างสรรค์ด้วยใจรัก',
      description: 'Four principles guide every bottle we make.',
      description_th: 'สี่หลักการที่เรายึดถือในทุกขวดที่เราผลิต',
      features: [
        { icon: 'leaf', title: 'Selected Ingredients', title_th: 'วัตถุดิบคัดสรร', description: 'Single-origin Thai cacao and Arabica coffee, chosen at the source.', description_th: 'โกโก้ไทยและกาแฟอาราบิก้าจากแหล่งเดียว คัดสรรจากต้นทาง' },
        { icon: 'hammer', title: 'Expert Craftsmanship', title_th: 'ฝีมืองานคราฟต์', description: 'Slow fermentation and careful blending in small batches.', description_th: 'หมักช้าและผสมผสานอย่างพิถีพิถันในชุดเล็ก' },
        { icon: 'award', title: 'Premium Quality', title_th: 'คุณภาพพรีเมียม', description: 'Silky texture and balanced flavour in every 500ml bottle.', description_th: 'เนื้อสัมผัสนุ่มนวลและรสชาติสมดุลในทุกขวด 500 มล.' },
        { icon: 'heritage', title: 'Authentic Heritage', title_th: 'มรดกแท้จากท้องถิ่น', description: 'Rooted in Nong Bua Lam Phu, proudly made in Thailand.', description_th: 'หยั่งรากที่หนองบัวลำภู ภูมิใจที่ผลิตในประเทศไทย' },
      ],
    },
    cta: {
      heading: 'Discover the Art of Fine Spirits',
      heading_th: 'ค้นพบศิลปะแห่งสุราชั้นเลิศ',
      description: 'Explore the full COB collection and find your flavour.',
      description_th: 'สำรวจคอลเลกชัน COB ทั้งหมด และค้นหารสชาติที่ใช่สำหรับคุณ',
      buttonText: 'EXPLORE COLLECTION',
      buttonText_th: 'สำรวจคอลเลกชัน',
      buttonLink: '/#collection',
      backgroundImage: img('cta', 1920, 1080),
    },
    contact: {
      heading: 'Contact',
      address: 'Nong Bua Lam Phu, Thailand',
      phone: '+66 00 000 0000',
      email: 'hello@cob.co.th',
      mapsUrl: 'https://maps.google.com/?q=Nong+Bua+Lam+Phu',
    },
  };
  const stmt = db.prepare(
    `INSERT INTO homepage_sections (section_key, data, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(section_key) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
  );
  Object.entries(sections).forEach(([k, v]) => stmt.run(k, JSON.stringify(v)));
}

function seedGallery() {
  db.prepare('DELETE FROM gallery').run();
  const stmt = db.prepare(
    'INSERT INTO gallery (image, title, description, status, sort_order) VALUES (?,?,?,1,?)'
  );
  const items = [
    ['Bottles', 'The collection', 'g1'],
    ['Cacao Beans', 'Single-origin Nan cacao', 'g2'],
    ['Coffee', 'Thai Arabica coffee', 'g3'],
    ['Pour', 'Cream liqueur poured', 'g4'],
    ['Lifestyle', 'An evening ritual', 'g5'],
    ['Distillery', 'Where craft happens', 'g6'],
  ];
  items.forEach(([title, desc, seed], i) =>
    stmt.run(img(seed, 900, i % 2 ? 1200 : 700), title, desc, i)
  );
}

function seedMenus() {
  db.prepare('DELETE FROM menus').run();
  const stmt = db.prepare('INSERT INTO menus (label, url, status, sort_order) VALUES (?,?,1,?)');
  [
    ['Home', '/#hero'],
    ['Our Story', '/#story'],
    ['Collection', '/#collection'],
    ['Gallery', '/#gallery'],
    ['Contact', '/#contact'],
  ].forEach((m, i) => stmt.run(m[0], m[1], i));
}

function seedSocial() {
  db.prepare('DELETE FROM social_links').run();
  const stmt = db.prepare(
    'INSERT INTO social_links (platform, url, icon, status, sort_order) VALUES (?,?,?,1,?)'
  );
  [
    ['Facebook', 'https://facebook.com', 'facebook'],
    ['Instagram', 'https://instagram.com', 'instagram'],
    ['Line', 'https://line.me', 'line'],
  ].forEach((s, i) => stmt.run(s[0], s[1], s[2], i));
}

function seedSettings() {
  const stmt = db.prepare(
    `INSERT INTO site_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  );
  const settings = {
    brand_name: 'COB',
    brand_tagline: 'Chamber of Beverage',
    brand_description:
      'Small-batch Thai craft cream liqueurs from Nong Bua Lam Phu.',
    min_age: '20',
    age_gate_enabled: 'true',
    age_gate_expiry_days: '30',
    footer_copyright: '\u00a9 ' + new Date().getFullYear() + ' COB — Chamber of Beverage Co., Ltd.',
  };
  Object.entries(settings).forEach(([k, v]) => stmt.run(k, v));
}

function run() {
  const tx = db.transaction(() => {
    upsertUser(config.seed.adminName, config.seed.adminEmail.toLowerCase(), config.seed.adminPassword, 'ADMIN');
    upsertUser(config.seed.editorName, config.seed.editorEmail.toLowerCase(), config.seed.editorPassword, 'EDITOR');
    seedProducts();
    seedHomepage();
    seedGallery();
    seedMenus();
    seedSocial();
    seedSettings();
  });
  tx();
  console.log('\n  Seed complete.');
  console.log(`  Admin  → ${config.seed.adminEmail} / ${config.seed.adminPassword}`);
  console.log(`  Editor → ${config.seed.editorEmail} / ${config.seed.editorPassword}\n`);
}

run();
