import { db, queryClient } from './index';
import { priestProfiles, priestServices, pujaCatalog, users } from '@/models/index';
import { eq, and } from 'drizzle-orm';

async function seedServices() {
  console.log('Seeding priest services for accredited ceremonies...');

  // 1. Get approved priests
  const priests = await db
    .select({
      id: priestProfiles.id,
      name: users.name,
      userId: users.id,
    })
    .from(priestProfiles)
    .innerJoin(users, eq(priestProfiles.userId, users.id))
    .where(eq(priestProfiles.approvalStatus, 'APPROVED'));

  console.log('Found approved priests:', priests.map((p) => `${p.name} (${p.id})`));

  if (priests.length === 0) {
    console.log('No approved priests found. Skipping.');
    await queryClient.end();
    process.exit(0);
  }

  // 2. Fetch all catalog items
  const catalogItems = await db.select().from(pujaCatalog);
  const catalogMap = new Map<string, typeof catalogItems[0]>();
  for (const item of catalogItems) {
    catalogMap.set(item.name.toLowerCase().trim(), item);
  }

  const rebortak = priests.find((p) => p.name?.toLowerCase().includes('rebortak') || p.name?.toLowerCase().includes('roy')) || priests[0];
  const chakraborty = priests.find((p) => p.name?.toLowerCase().includes('chakraborty')) || priests[1] || priests[0];

  // Specific ceremonies to assign to Rebortak Roy
  const rebortakOfferings = [
    {
      name: 'Satyanarayan Katha & Puja',
      price: 2100,
      samagriList: ['Prasad ingredients (Sooji, Milk, Sugar, Banana)', 'Panchamrit', 'Tulsi leaves', 'Supari & Betel leaves', 'Yellow cloth', 'Havan Kund & Samidha'],
    },
    {
      name: 'Rudrabhishek Puja',
      price: 3100,
      samagriList: ['Gangajal', 'Pure Cow Milk', 'Curd & Honey', 'Bilva (Bel) Patra (108 pcs)', 'Dhatura & Bhaang', 'Bhasma & Chandan'],
    },
    {
      name: 'Vastu Shanti Puja',
      price: 2500,
      samagriList: ['Navadhanya', 'Copper Vastu Yantra', 'Ganga Jal', 'Cow Dung & Ghee for Shuddhi', 'Havan Samagri', 'White & Yellow Cloth'],
    },
    {
      name: 'Navagraha Shanti Puja',
      price: 3100,
      samagriList: ['Navadhanya seeds (9 types)', '9 Colored cloths for Navagrahas', 'Pure Ghee', 'Navagraha Samidha wood', 'Black Sesame & Camphor'],
    },
    {
      name: 'Vivah Sanskar (Vedic Wedding)',
      price: 11000,
      samagriList: ['Saptapadi Akshat', 'Sindoor & Mangalsutra', 'Kanya Sampradana articles', 'Havan Kund & Sacred Wood', 'Laja (Puffed Rice)', 'Coconut & Haldi'],
    },
    {
      name: 'Maha Durga Puja & Chandi Paath',
      price: 7501,
      samagriList: ['108 Red Lotuses', 'Bilva Leaves', 'Sandalwood Paste', 'Camphor & Incense', 'Panchamrit', 'Ghee for Homa'],
    },
  ];

  // Specific ceremonies to assign to S. Chakraborty
  const chakrabortyOfferings = [
    {
      name: 'Satyanarayan Katha & Puja',
      price: 2500,
      samagriList: ['Prasad ingredients', 'Panchamrit', 'Tulsi patra', 'Supari & Betel leaves', 'Yellow cloth & Flowers'],
    },
    {
      name: 'Rudrabhishek Puja',
      price: 3500,
      samagriList: ['Gangajal', 'Panchamrit', '108 Bel leaves', 'Dhatura & Sandalwood', 'Ghee Diya'],
    },
    {
      name: 'Vastu Shanti Puja',
      price: 2800,
      samagriList: ['Navadhanya', 'Copper Kalash', 'Havan Samagri herbs', 'Cow Ghee', 'Mango Leaves'],
    },
    {
      name: 'Navagraha Shanti Puja',
      price: 3500,
      samagriList: ['Navagraha Yantra', '9 Grains', '9 Color cloths', 'Ghee & Samidha wood', 'Havan Kund'],
    },
    {
      name: 'Lakshmi Kuber Vyapar Puja',
      price: 3100,
      samagriList: ['Kamalgatta beads', 'Red Lotus / Flowers', 'Silver/Gold Coin', 'Panchamrit', 'Pure Cow Ghee', 'Dhoop & Deep'],
    },
  ];

  // Helper to insert if not existing
  async function insertOfferings(priestId: string, offerings: typeof rebortakOfferings) {
    for (const off of offerings) {
      // Find matching catalog entry
      const catEntry =
        catalogMap.get(off.name.toLowerCase().trim()) ||
        Array.from(catalogMap.values()).find(
          (c) => c.name.toLowerCase().includes(off.name.toLowerCase()) || off.name.toLowerCase().includes(c.name.toLowerCase())
        );

      const catalogId = catEntry ? catEntry.id : null;
      const category = catEntry ? catEntry.category : 'life-event';

      // Check if priest already has this service
      const [existing] = await db
        .select()
        .from(priestServices)
        .where(
          and(
            eq(priestServices.priestId, priestId),
            eq(priestServices.serviceName, off.name)
          )
        );

      if (!existing) {
        await db.insert(priestServices).values({
          priestId,
          serviceName: off.name,
          pujaCatalogId: catalogId,
          category,
          price: off.price,
          samagriList: off.samagriList,
          isActive: true,
          isCustom: false,
        });
        console.log(`+ Added "${off.name}" (₹${off.price}) for priest ${priestId}`);
      } else {
        // Ensure catalog ID is linked if it wasn't
        if (catalogId && !existing.pujaCatalogId) {
          await db
            .update(priestServices)
            .set({ pujaCatalogId: catalogId, isActive: true })
            .where(eq(priestServices.id, existing.id));
          console.log(`~ Linked catalog ID for "${off.name}"`);
        }
      }
    }
  }

  if (rebortak) {
    await insertOfferings(rebortak.id, rebortakOfferings);
  }

  if (chakraborty && chakraborty.id !== rebortak?.id) {
    await insertOfferings(chakraborty.id, chakrabortyOfferings);
  }

  console.log('Seeding completed successfully!');
  await queryClient.end();
  process.exit(0);
}

seedServices().catch((err) => {
  console.error('Error seeding services:', err);
  process.exit(1);
});

