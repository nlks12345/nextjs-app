import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
// import { db } from 'pg';
// import { Pool } from 'pg';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// Load environment variables
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

const client = await db.connect();
// const client = await pool.connect();

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // await client.query(`
  //   CREATE TABLE IF NOT EXISTS users (
  //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     email TEXT NOT NULL UNIQUE,
  //     password TEXT NOT NULL
  //   );
  // `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      // return client.query(`
      //   INSERT INTO users (id, name, email, password)
      //   VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      //   ON CONFLICT (id) DO NOTHING;
      // `);
      // return client.query(
      //   `
      //   INSERT INTO users (id, name, email, password)
      //   VALUES ($1, $2, $3, $4)
      //   ON CONFLICT (id) DO NOTHING;
      //   `,
      //   [user.id, user.name, user.email, hashedPassword] // Use parameterized values
      // );
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  // await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);


  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // await client.query(`
  //   CREATE TABLE IF NOT EXISTS invoices (
  //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  //     customer_id UUID NOT NULL,
  //     amount INT NOT NULL,
  //     status VARCHAR(255) NOT NULL,
  //     date DATE NOT NULL
  //   );
  // `);

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
      // (invoice) => client.query(`INSERT INTO invoices (customer_id, amount, status, date)
      //   VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
      //   ON CONFLICT (id) DO NOTHING;
      // `),

      // (invoice) => client.query(`INSERT INTO invoices (customer_id, amount, status, date)
      //   VALUES ($1, $2, $3, $4)
      //   ON CONFLICT (id) DO NOTHING;
      // `,[invoice.customer_id, invoice.amount, invoice.status, invoice.date]
      // ), 
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);


  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // await client.query(`
  //   CREATE TABLE IF NOT EXISTS customers (
  //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     email VARCHAR(255) NOT NULL,
  //     image_url VARCHAR(255) NOT NULL
  //   );
  // `);

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,

      // (customer) => client.query(`
      //   INSERT INTO customers (id, name, email, image_url)
      //   VALUES ($1, $2, $3, $4)
      //   ON CONFLICT (id) DO NOTHING;
      // `,[customer.id,customer.name,customer.email,customer.image_url]
      // ),
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  // await client.query(`
  //   CREATE TABLE IF NOT EXISTS revenue (
  //     month VARCHAR(4) NOT NULL UNIQUE,
  //     revenue INT NOT NULL
  //   );
  // `);

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,

      // (rev) => client.query(`
      //   INSERT INTO revenue (month, revenue)
      //   VALUES (${rev.month}, ${rev.revenue})
      //   ON CONFLICT (month) DO NOTHING;
      // `),

      // (rev) => client.query(`
      //     INSERT INTO revenue (month, revenue)
      //     VALUES ($1, $2)
      //     ON CONFLICT (month) DO NOTHING;
      //   `,[rev.month, rev.revenue]
      // ),
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // const client = await pool.connect();

  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    await client.sql`BEGIN`;
    // await client.query('BEGIN');
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;
    // await client.query('COMMIT');


    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.query(`ROLLBACK`);
    return Response.json({ error }, { status: 500 });
  }
}
