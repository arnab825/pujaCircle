import { db } from './index.js';
import { pujaCatalog } from '../models/catalog.model.js';
import { ilike } from 'drizzle-orm';

export const SACRED_CATALOG_SEEDS = [
  // 1. Life Events
  {
    name: 'Griha Pravesh Puja',
    deity: 'Lord Ganesha & Vastu Purush',
    category: 'life-event',
    description: 'Vedic housewarming ritual invoking Lord Ganesha, Navagraha, and Vastu Purush to sanctify a new dwelling with auspicious energy and prosperity.',
    durationMinutes: 180,
    intentTags: ['housewarming', 'prosperity', 'vastu shanti', 'new beginning'],
    samagriList: [
      'Ganga Jal & Panchamrit',
      'Roli, Chandan, Haldi & Akshat',
      'Betel Leaves, Supari, Clove & Cardamom',
      'Fresh Yellow & Red Flowers, Tulsi Patra',
      'Coconut with Husk (Shriphal) & Red Kalava',
      'Dhoop Cones, Camphor & Pure Cow Ghee Diya',
      'Seasonal Fruits (5 varieties) & Sweets Prasad',
      'Havan Kund, Dry Mango Wood & Sacred Samagri Herbs',
    ],
    steps: [
      'Devotee Sankalp & Ganapati Sthapana',
      'Punyahavachanam & Sanctum Shuddhi',
      'Navagraha Mandal Puja & Invocation',
      'Vastu Purush Aradhana & Threshold Puja',
      'Sacred Havan & Purnahuti Offering',
      'Aarti, Pushpanjali & Purohit Ashirwad',
    ],
    timingNote: 'Shubh Muhurat recommended during Shukla Paksha morning hours.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Vivah Sanskar (Vedic Wedding)',
    deity: 'Agni Dev & Lord Vishnu',
    category: 'life-event',
    description: 'Sanctified traditional Vedic Hindu wedding ceremony according to sacred Grihya Sutras with authentic Saptapadi and Kanyadaan vidhis.',
    durationMinutes: 240,
    intentTags: ['marriage', 'wedding', 'saptapadi', 'family', 'sanskar'],
    samagriList: [
      'Pure Desi Cow Ghee (1 kg) & Havan Kund',
      'Dry Mango Wood Samidha Sticks',
      'Vedic Havan Herbs, Black Sesame, Barley (Jau)',
      'Yellow Cloth, Mauli Sacred Thread & Haldi Cones',
      'Rose & Marigold Varmalas (2 Sacred Garlands)',
      'Puffed Rice (Laja / Kheel) for Laja Homa',
      'Silver Sindoor Box, Saptapadi Betel Leaves & Supari',
    ],
    steps: [
      'Varagrahana & Welcoming of the Groom',
      'Kanyadaan & Hastamelap Vidhi',
      'Agni Pradakshina (Sacred Fire Circumambulation)',
      'Saptapadi (Seven Auspicious Vows)',
      'Sindoor Daan & Mangalsutra Vidhi',
      'Elder Blessings & Purohit Ashirwad',
    ],
    timingNote: 'Calculated strictly based on bride and groom Kundali Shubh Vivah Muhurat.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Namkaran Sanskar (Sacred Naming)',
    deity: 'Lord Brahma & Surya Dev',
    category: 'life-event',
    description: 'Auspicious Vedic naming sacrament for infants invoking the planetary ruling star (Nakshatra) and kuladevata blessings for longevity and wisdom.',
    durationMinutes: 90,
    intentTags: ['child', 'naming', 'blessing', 'newborn', 'sanskar'],
    samagriList: [
      'Bronze / Copper Thali with Raw Rice (Akshat)',
      'Ganga Jal, Panchamrit & Fresh Tulsi Leaves',
      'Honey & Gold Ring for Baby Honey-Tasting',
      'New Baby Garments & Silver Anklets / Bangles',
      'White & Yellow Flowers, Chandan & Kumkum',
      'Kheer / Payasam Prasad for Kuladevata',
    ],
    steps: [
      'Swasti Vachan & Baby Sanctification',
      'Gauri-Ganesh Invocation',
      'Nakshatra Graha Shanti Homa',
      'Whispering Sacred Name into Right Ear',
      'Elder Family Blessings & Aarti',
    ],
    timingNote: 'Conducted on the 11th, 12th, or 21st day after childbirth during Abhijit Muhurat.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },

  // 2. Dosha Nivaran
  {
    name: 'Vastu Shanti Puja',
    deity: 'Vastu Purush & Lord Ganesha',
    category: 'dosha-nivaran',
    description: 'Deep architectural energy remediation ritual eliminating structural, directional, and environmental Vastu imbalances.',
    durationMinutes: 150,
    intentTags: ['vastu dosha', 'home peace', 'cleansing', 'planetary', 'remedy'],
    samagriList: [
      'Copper Vastu Yantra & Navaratna Gemstones',
      'Panchadhatu (Five Sacred Metals) Idols',
      'Ganga Jal, Gomutra & Turmeric Water',
      'Navadhanya (Nine Sacred Grains)',
      'Dry Mango Wood, Pure Ghee & Havan Kund',
      'Red Cloth & Five Sacred Tree Twigs (Panchavalkala)',
    ],
    steps: [
      'Digbandhana & Eight-Direction Guardian Invocation',
      'Vastu Purush Mandala Pratishtha',
      'Navagraha Peetha Puja',
      'Shanti Havan with Mrityunjaya Mantra',
      'Vastu Copper Yantra Sanctification & Placement',
      'Sanctum Cleansing with Holy Water',
    ],
    timingNote: 'Best performed on Thursdays, Fridays, or Mondays during waxing moon.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Navagraha Shanti Puja',
    deity: 'Nine Planetary Deities (Navagraha)',
    category: 'dosha-nivaran',
    description: 'Vedic planetary alignment pacifying malefic astrological influences (Shani Sade Sati, Mangal Dosha, Rahu-Ketu transit) to restore health and fortune.',
    durationMinutes: 120,
    intentTags: ['graha shanti', 'astrological', 'planetary obstacles', 'remedy', 'shani'],
    samagriList: [
      'Navagraha Mandala Yantra Cloth (9 Colors)',
      'Nine Sacred Grains (Navadhanya) for each Graha',
      'Nine Different Colored Flowers & Deepams',
      'Black Sesame, Mustard Seeds, Jaggery & Rice',
      'Samidha Wood for each of the 9 Celestial Deities',
      'Pure Ghee, Camphor & Havan Samagri',
    ],
    steps: [
      'Navagraha Peetha Mandapam Sthapana',
      'Graha Beej Mantra Japa (Surya to Ketu)',
      'Navagraha Homa with Specific Herb Sticks',
      'Shani & Rahu-Ketu Remedial Ahutis',
      'Purnahuti & Planetary Danam Offering',
    ],
    timingNote: 'Performed on Saturdays, Tuesdays, or Amavasya mornings.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Kaal Sarp Dosh Nivaran',
    deity: 'Lord Shiva & Naga Devata',
    category: 'dosha-nivaran',
    description: 'Intensive scriptural remediation ritual dedicated to Lord Mahadev and the Eight Sacred Serpents to resolve life hindrances caused by Kaal Sarp yoga.',
    durationMinutes: 180,
    intentTags: ['kaal sarp', 'remedial', 'shiva', 'dosha nivaran', 'naga'],
    samagriList: [
      'Pair of Silver / Copper Naga-Nagin Idols',
      'Bilva Patra (108 leaves), Dhatura & Akanda Flowers',
      'Raw Milk, Gangajal, Sugarcane Juice for Abhishekam',
      'Black Sesame, Urad Dal & Mustard Oil',
      'Bhasma (Holy Ash) & Sandalwood Paste',
      'Havan Wood, Camphor & Maha Mrityunjaya Herbs',
    ],
    steps: [
      'Rudra Abhishekam with Chamakam Chanting',
      'Naga Devata Peetha Sthapana & Pran Pratishtha',
      'Rahu-Ketu Beej Mantra Homa',
      'Silver Snake Idol Visarjan Puja',
      'Maha Mrityunjaya Raksha Kavach Chanting',
    ],
    timingNote: 'Most potent on Nag Panchami, Maha Shivratri, or Monday mornings.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },

  // 3. Festival & Vrats
  {
    name: 'Satyanarayan Katha & Puja',
    deity: 'Lord Satyanarayan (Lord Vishnu)',
    category: 'festival',
    description: 'Beloved household congregation ritual narrating the 5 divine chapters of Lord Satyanarayan from Reva Khanda of Skanda Purana for supreme domestic harmony.',
    durationMinutes: 120,
    intentTags: ['satyanarayan', 'family blessings', 'katha', 'purnima', 'vishnu'],
    samagriList: [
      'Banana Tree Stems (4) for Mandapam Posts',
      'Shinni Prasad (Wheat Flour, Milk, Sugar, Banana, Ghee)',
      'Fresh Betel Leaves, Supari & Panchamrit',
      'Tulsi Patra (Mandatory for Lord Vishnu)',
      'Yellow Cloth, Sacred Rice & Kalash with Mango Leaves',
      'Panchamrit & Seasonal Fruits',
    ],
    steps: [
      'Ganapati, Gauri & Varuna Kalash Sthapana',
      'Lord Satyanarayan Dhyana & Shodashopachara Puja',
      'Chanting of 5 Sacred Chapters (Reva Khanda)',
      'Maha Shinni Prasad Offering (Bhog)',
      'Aarti, Pushpanjali & Distribution of Prasad',
    ],
    timingNote: 'Performed on Purnima (Full Moon), Sankranti, Ekadashi, or house occasions.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Rudrabhishek Puja',
    deity: 'Lord Shiva (Mahadev)',
    category: 'festival',
    description: 'Sacred Vedic ritual chanting Namakam and Chamakam hymns while pouring 11 auspicious elixirs over the Shiva Lingam to destroy negative karmas and bestow health.',
    durationMinutes: 120,
    intentTags: ['shiva', 'rudrabhishek', 'health', 'bilva patra', 'mahashivratri'],
    samagriList: [
      'Pure Brass / Spatika / Stone Shiva Lingam with Base',
      'Raw Milk, Curd, Honey, Sugarcane Juice & Ghee',
      'Ganga Jal, Coconut Water & Rose Water',
      'Bilva Patra (108 Unbroken Tri-Leaves)',
      'Bhasma (Vibhuti), Chandan Paste & Akshat',
      'Dhatura Fruit, Blue Kanher & Fragrant White Flowers',
    ],
    steps: [
      'Linga Shuddhi & Laghu Nyasa',
      'Maha Rudram Ekadash Dravya Abhishekam',
      'Alankaram with Bhasma, Chandan & Bilva Patra',
      'Shiva Sahasranama Chanting',
      'Maha Shivaratri Aarti & Panchamrit Teertham',
    ],
    timingNote: 'Auspicious on Pradosh Vrat, Mondays, and Maha Shivratri.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Maha Durga Puja & Chandi Paath',
    deity: 'Maa Durga (Mahishasuramardini)',
    category: 'festival',
    description: 'Scriptural recitation of Devi Mahatmyam (700 verses) followed by Navakshari Homa to invoke the fierce motherly protection of Goddess Durga.',
    durationMinutes: 180,
    intentTags: ['durga', 'chandi paath', 'navratri', 'protection', 'devi'],
    samagriList: [
      'Maa Durga Murti / Brass Yantra',
      'Red Silk Cloth, Chunri, Sindoor & Alta',
      'Fresh Red Hibiscus (Jaba) Garland (108 flowers)',
      'Dry Coconut, Lotus Flowers & Bel Patra',
      'Cow Ghee, Havan Samagri, Camphor & Cloves',
      'Panchamrit, Sweets & Fruit Bhog',
    ],
    steps: [
      'Ghatasthapana & Devi Kalash Awahan',
      'Devi Suktam & Durga Saptashati Recitation',
      '108 Lotus Flower Pushpanjali Offering',
      'Chandi Homa with 108 Sacred Ahutis',
      'Maha Aarti with Dhunuchi & Conch Shell',
    ],
    timingNote: 'Best observed during Navratri, Ashtami, Navami, or Amavasya.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },

  // 4. Business & Commercial
  {
    name: 'Lakshmi Kuber Vyapar Puja',
    deity: 'Goddess Lakshmi & Lord Kuber',
    category: 'business',
    description: 'Commercial sanctification and ledger blessing ritual invoking divine treasures and unbroken commercial prosperity for shops, offices, and enterprises.',
    durationMinutes: 90,
    intentTags: ['business', 'wealth', 'commercial', 'diwali', 'new shop', 'ledger'],
    samagriList: [
      'Silver Coins, Kuber Yantra & Gomti Chakra (11)',
      'Account Ledger Books (Bahi-Khata) or Laptop / Safe',
      'Yellow Cowrie Shells (11), Lotus Seeds (Kamal Gatta)',
      'Pure Ghee Deepams (5), Chandan & Kumkum',
      'Rose Petals, Marigold Garlands & Motichoor Laddoos',
      'Red Cloth for Safe / Cash Box Sanctification',
    ],
    steps: [
      'Ganesh Invocation for Vighnaharta Blessings',
      'Goddess Lakshmi & Lord Kuber Sthapana',
      'Shri Suktam & Kanakadhara Stotram Chanting',
      'Locker & Business Equipment Sanctification',
      'Kuber Potli Blessing & Aarti',
    ],
    timingNote: 'Performed on Dhanteras, Diwali, Akshaya Tritiya, or new business launch.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Office & Commercial Inauguration',
    deity: 'Lord Ganesha & Lord Vishwakarma',
    category: 'business',
    description: 'Official Vedic opening ceremony for workplaces, factories, and corporate sanctuaries to ward off energetic blockages and ensure productive growth.',
    durationMinutes: 120,
    intentTags: ['office opening', 'business start', 'inauguration', 'vishwakarma'],
    samagriList: [
      'Toran of Mango Leaves & Marigold for Main Entrance',
      'Kalash with Coconut, Gangajal & Sacred Water',
      'Ghee Diya, Dhoop & Camphor for Sanctum Cleansing',
      'Panchamrit, Sweets, Dry Fruits for Employee Prasad',
      'Red Ribbon & Auspicious Scissors for Ribbon Cutting',
    ],
    steps: [
      'Threshold Dwaar Puja & Toran Tying',
      'Office Sanctum Shuddhi with Ganga Jal Sprinkling',
      'Vastu Purush & Lord Ganesha Puja in Director Cabin',
      'Ribbon Cutting & Sacred Deepam Lighting',
      'Prasad Distribution & Team Blessings',
    ],
    timingNote: 'Conducted during Labha or Amrit Choghadiya on inauguration day.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },

  // 5. Ancestral & Pitru
  {
    name: 'Pitru Tarpan & Shraddha Karma',
    deity: 'Pitru Devatas & Lord Yama',
    category: 'ancestral',
    description: 'Sacred Vedic oblations of water, black sesame, and sacred pinda offerings to release ancestral debts and receive generational peace and lineage blessings.',
    durationMinutes: 120,
    intentTags: ['ancestral', 'pitru paksha', 'tarpan', 'shraddha', 'moksha'],
    samagriList: [
      'Kusha Grass Rings (Pavitri) & Mats',
      'Black Sesame Seeds (Til), Barley (Jau) & Raw Milk',
      'Cooked Rice, Honey & Ghee for Pinda Preparation',
      'White Flowers, Chandan & Copper Urn (Lota)',
      'Ganga Jal, Tulsi Leaves & Cotton Cloth',
    ],
    steps: [
      'Pavitri Dharana & Achamana',
      'Deva, Rishi & Pitru Tarpana Water Oblations',
      'Preparation of Sacred Pindas with Rice and Sesame',
      'Pinda Daan with Vedic Gotra Chanting',
      'Brahmana Bhojanam / Dakshina & Cow Feeding (Go-Seva)',
    ],
    timingNote: 'Conducted during Pitru Paksha, Mahalaya, or ancestral death anniversaries (Tithi).',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
  {
    name: 'Maha Mrityunjaya Jaap & Havan',
    deity: 'Lord Shiva (Tryambakam)',
    category: 'ancestral',
    description: 'Potent Vedic healing and life-preserving fire sacrifice reciting the 33-lettered Tryambaka mantra to overcome chronic illness and unexpected dangers.',
    durationMinutes: 180,
    intentTags: ['longevity', 'healing', 'health recovery', 'havan', 'mrityunjaya'],
    samagriList: [
      'Pure Copper Havan Kund, Mango Wood (5 kg)',
      'Maha Mrityunjaya Samagri (Gugal, Camphor, Jau, Til)',
      'Pure Cow Ghee (1.5 kg) for Ahutis',
      'Dhatura, Bel Patra & White Lotus Flowers',
      'Gangajal Kalash & Rudraksha Mala (108 beads)',
    ],
    steps: [
      'Sankalp for Patient Longevity & Good Health',
      'Tryambaka Peetha Invocation',
      'Recitation of Maha Mrityunjaya Japa (1008 repetitions)',
      'Havan with 108 Sacred Ahutis of Amrita Herbs',
      'Mrityunjaya Raksha Bhasma Tilak & Holy Teertham',
    ],
    timingNote: 'Conducted on Mondays, Shani Pradosh, or in times of acute illness.',
    coverImage: '/images/hero_vedic_puja.jpg',
  },
];

async function runSeed() {
  console.log('🕉️ Seeding comprehensive Vedic ceremonies into puja_catalog...');
  let inserted = 0;
  let skipped = 0;

  for (const item of SACRED_CATALOG_SEEDS) {
    const existing = await db
      .select({ id: pujaCatalog.id })
      .from(pujaCatalog)
      .where(ilike(pujaCatalog.name, item.name));

    if (existing.length === 0) {
      await db.insert(pujaCatalog).values({
        name: item.name,
        deity: item.deity,
        category: item.category,
        description: item.description,
        durationMinutes: item.durationMinutes,
        intentTags: item.intentTags,
        samagriList: item.samagriList,
        steps: item.steps,
        timingNote: item.timingNote,
        coverImage: item.coverImage,
        isActive: true,
      });
      console.log(`  + Seeded: ${item.name} (${item.category})`);
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Seeding complete. Inserted: ${inserted}, Skipped existing: ${skipped}`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

