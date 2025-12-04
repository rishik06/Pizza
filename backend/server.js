// Pizza Ordering Backend (Node.js/Express/SQLite)

// This file sets up a simple REST API to handle the four main steps of the mobile app flow.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './pizza_orders.db';

// --- Middlewares ---
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// --- Database Setup ---
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

/**
 * Generates a simple, unique ID (simulating a UUID or ObjectId).
 * @returns {string}
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Sets up the necessary tables and seeds initial data.
 */
function initializeDatabase() {
    // 1. Pizzas Table (Menu)
    db.run(`CREATE TABLE IF NOT EXISTS pizzas (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        imageUrl TEXT
    )`, (err) => {
        if (!err) {
            seedPizzas();
        }
    });

    // 2. Orders Table (Cart, Checkout, Payment)
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        status TEXT NOT NULL, 
        items TEXT,           -- JSON string of cart items
        total REAL NOT NULL,
        address TEXT,         -- JSON string of delivery address/pickup details
        paymentId TEXT,       -- Simulated payment reference
        createdAt TEXT
    )`);
}

/**
 * Inserts mock pizza data if the table is empty.
 */
function seedPizzas() {
    const pizzas = [
        { name: "Classic Pepperoni", description: "The all-time favorite, cheesy and spicy.", price: 15.99, imageUrl: "https://placehold.co/100x100/D93025/FFFFFF?text=P" },
        { name: "Margherita Dream", description: "Fresh mozzarella, basil, and San Marzano tomatoes.", price: 12.50, imageUrl: "https://placehold.co/100x100/4CAF50/FFFFFF?text=M" },
        { name: "Gourmet Veggie", description: "A mix of roasted bell peppers, olives, and mushrooms.", price: 17.99, imageUrl: "https://placehold.co/100x100/FFC107/333333?text=V" },
        { name: "BBQ Chicken", description: "Tangy BBQ sauce, red onions, and smoked chicken.", price: 16.99, imageUrl: "https://placehold.co/100x100/2196F3/FFFFFF?text=C" },
    ];

    db.get('SELECT COUNT(*) AS count FROM pizzas', (err, row) => {
        if (row && row.count === 0) {
            console.log('Seeding initial pizza data...');
            const insert = 'INSERT INTO pizzas (id, name, description, price, imageUrl) VALUES (?, ?, ?, ?, ?)';
            pizzas.forEach((pizza, index) => {
                db.run(insert, [index + 1, pizza.name, pizza.description, pizza.price, pizza.imageUrl]);
            });
        }
    });
}

// ======================================================================
// Health Check Endpoint (for Render deployment)
// ======================================================================
app.get('/', (req, res) => {
    res.json({ message: 'Pizza Ordering API is running', status: 'ok' });
});

// ======================================================================
// 1. API Endpoint: Menu (Screen 1) - Fetch all available pizzas
// ======================================================================
app.get('/api/pizzas', (req, res) => {
    const sql = 'SELECT * FROM pizzas ORDER BY id';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve menu.' });
            return;
        }
        res.json({
            message: "Menu retrieved successfully.",
            data: rows
        });
    });
});

// ======================================================================
// 2. API Endpoint: Cart (Screen 2) - Create or Update a Cart
// This simulates the user interacting with the Cart screen.
// ======================================================================
app.post('/api/cart', (req, res) => {
    const { userId, items, total, cartId } = req.body;

    if (!userId || !items || total === undefined) {
        return res.status(400).json({ error: 'Missing required cart fields (userId, items, total).' });
    }

    const itemsJson = JSON.stringify(items);
    const orderId = cartId || generateId();
    const status = 'PENDING';

    const updateSql = `UPDATE orders SET items = ?, total = ?, createdAt = ? WHERE id = ? AND userId = ?`;
    const insertSql = `INSERT INTO orders (id, userId, status, items, total, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;

    if (cartId) {
        // Attempt to update existing cart
        db.run(updateSql, [itemsJson, total, new Date().toISOString(), cartId, userId], function(err) {
            if (err || this.changes === 0) {
                // If update fails or cart doesn't exist, try to insert (though usually a failure means error)
                if (err) console.error("Cart update error:", err);
                // Fallback to inserting a new one if update failed unexpectedly
                db.run(insertSql, [orderId, userId, status, itemsJson, total, new Date().toISOString()], (insertErr) => {
                    if (insertErr) {
                        return res.status(500).json({ error: 'Failed to create/update cart.' });
                    }
                    res.json({ message: 'New cart created.', orderId: orderId, status: status, total: total });
                });
            } else {
                res.json({ message: 'Cart updated successfully.', orderId: cartId, status: status, total: total });
            }
        });
    } else {
        // Insert new cart
        db.run(insertSql, [orderId, userId, status, itemsJson, total, new Date().toISOString()], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create new cart.' });
            }
            res.json({ message: 'New cart created.', orderId: orderId, status: status, total: total });
        });
    }
});

// ======================================================================
// 3. API Endpoint: Checkout (Screen 3) - Add delivery details to cart
// This moves the order from PENDING to CHECKOUT.
// ======================================================================
app.post('/api/checkout', (req, res) => {
    const { orderId, address, userId } = req.body;

    if (!orderId || !address || !userId) {
        return res.status(400).json({ error: 'Missing required checkout fields (orderId, address, userId).' });
    }

    const addressJson = JSON.stringify(address);
    const status = 'CHECKOUT_COMPLETE';

    const sql = `UPDATE orders SET address = ?, status = ? WHERE id = ? AND userId = ? AND status = 'PENDING'`;

    db.run(sql, [addressJson, status, orderId, userId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update order status to checkout.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found or already processed.' });
        }
        res.json({ message: 'Checkout successful. Ready for payment.', orderId: orderId, status: status });
    });
});

// ======================================================================
// 4. API Endpoint: Payment (Screen 4) - Finalize the order
// This simulates a successful payment and sets the status to CONFIRMED.
// ======================================================================
app.post('/api/payment', (req, res) => {
    const { orderId, paymentDetails, userId } = req.body;

    if (!orderId || !paymentDetails || !userId) {
        return res.status(400).json({ error: 'Missing required payment fields (orderId, paymentDetails, userId).' });
    }

    // --- Mock Payment Processing (External API Call would go here) ---
    const mockPaymentId = `PAY-${generateId()}`;
    const status = 'CONFIRMED';
    // -----------------------------------------------------------------

    const sql = `UPDATE orders SET paymentId = ?, status = ? WHERE id = ? AND userId = ? AND status = 'CHECKOUT_COMPLETE'`;

    db.run(sql, [mockPaymentId, status, orderId, userId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to confirm payment and update order status.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found or not ready for payment.' });
        }
        res.json({ 
            message: 'Order successfully placed and paid!', 
            orderId: orderId, 
            status: status,
            paymentReference: mockPaymentId
        });
    });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Endpoints available:`);
    console.log(`- GET /api/pizzas (Menu)`);
    console.log(`- POST /api/cart (Cart)`);
    console.log(`- POST /api/checkout (Checkout)`);
    console.log(`- POST /api/payment (Payment)`);
});

