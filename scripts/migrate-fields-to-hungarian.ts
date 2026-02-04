/**
 * Database Migration Script: Migrate Strapi field data from English to Hungarian column names
 *
 * This script copies data from old English column names to new Hungarian column names
 * after a schema field rename in Strapi.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './apps/cms/.env' });

const pool = new pg.Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME || 'csz_strapi',
  user: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// Field mappings: old English name -> new Hungarian name
const productFieldMappings = {
  name: 'nev',
  slug: 'url_cim',
  sku: 'cikkszam',
  description: 'leiras',
  short_description: 'rovid_leiras',
  base_price: 'alapar',
  compare_at_price: 'eredeti_ar',
  stock: 'keszlet',
  weight: 'suly',
  is_featured: 'kiemelt',
  is_on_sale: 'akcios',
};

const categoryFieldMappings = {
  name: 'nev',
  slug: 'url_cim',
  description: 'leiras',
};

const orderFieldMappings = {
  order_number: 'rendelesszam',
  status: 'statusz',
  subtotal: 'reszosszeg',
  discount: 'kedvezmeny',
  shipping: 'szallitasi_dij',
  vat_amount: 'afa_osszeg',
  total: 'vegosszeg',
  shipping_address: 'szallitasi_cim',
  billing_address: 'szamlazasi_cim',
  line_items: 'tetelek',
  coupon_code: 'kupon_kod',
  coupon_discount: 'kupon_kedvezmeny',
  po_reference: 'vevoi_rendelesszam',
  payment_method: 'fizetesi_mod',
  payment_id: 'tranzakcio_azonosito',
  stripe_session_id: 'stripe_azonosito',
  paid_at: 'fizetes_idopontja',
  notes: 'megjegyzesek',
};

const couponFieldMappings = {
  code: 'kod',
  description: 'leiras',
  discount_type: 'kedvezmeny_tipus',
  discount_value: 'kedvezmeny_ertek',
  minimum_order_amount: 'min_rendeles_osszeg',
  maximum_discount: 'max_kedvezmeny',
  usage_limit: 'hasznalati_limit',
  used_count: 'hasznalva_darab',
  valid_from: 'ervenyesseg_kezdete',
  valid_until: 'ervenyesseg_vege',
  is_active: 'aktiv',
};

async function migrateTable(tableName: string, fieldMappings: Record<string, string>) {
  const client = await pool.connect();
  try {
    console.log(`\nMigrating table: ${tableName}`);

    // First check which columns exist
    const colResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1
    `, [tableName]);

    const existingColumns = new Set(colResult.rows.map(r => r.column_name));
    console.log(`  Existing columns: ${Array.from(existingColumns).join(', ')}`);

    // Build UPDATE statement for columns that exist in both old and new
    const updates: string[] = [];
    for (const [oldCol, newCol] of Object.entries(fieldMappings)) {
      if (existingColumns.has(oldCol) && existingColumns.has(newCol)) {
        updates.push(`${newCol} = ${oldCol}`);
      } else {
        console.log(`  Skipping ${oldCol} -> ${newCol} (columns not found)`);
      }
    }

    if (updates.length === 0) {
      console.log(`  No columns to migrate for ${tableName}`);
      return;
    }

    const updateQuery = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${Object.keys(fieldMappings)[0]} IS NOT NULL`;
    console.log(`  Running: ${updateQuery}`);

    const result = await client.query(updateQuery);
    console.log(`  Migrated ${result.rowCount} rows`);

  } finally {
    client.release();
  }
}

async function main() {
  console.log('Starting field migration...\n');
  console.log('Database connection:', {
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'csz_strapi',
  });

  try {
    await migrateTable('products', productFieldMappings);
    await migrateTable('categories', categoryFieldMappings);
    await migrateTable('orders', orderFieldMappings);
    await migrateTable('coupons', couponFieldMappings);

    console.log('\n\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
