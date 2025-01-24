// import { db } from "@vercel/postgres";
import { Pool } from 'pg';


// const client = await db.connect();
// Load environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// const client = await db.connect();
const client = await pool.connect();

async function listInvoices() {
	const data = await client.query(`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `);

	return data.rows;
}

export async function GET() {
  const client = await pool.connect();
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
