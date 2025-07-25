const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// SQLite database path - corrected to match volume mount
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'pharmacy.sqlite');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Created data directory: ${DATA_DIR}`);
}

// Initialize database
const initDB = () => {
  // Check if database file exists, create if not
  if (!fs.existsSync(DB_PATH)) {
    console.log(`📝 Creating new database file: ${DB_PATH}`);
    // Touch the file first
    fs.writeFileSync(DB_PATH, '');
  }
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      return;
    }
    console.log('✅ Connected to SQLite database');
  });
  
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        brand TEXT,
        generic_name TEXT NOT NULL,
        dosage_form TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Products table ready');
      }
    });
  });
  
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    }
  });
};

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });
  
  db.all(`
    SELECT code, brand as "Brand", generic_name as "Generic Name", 
           dosage_form as "Dosage Form", price as "Price"
    FROM products 
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('Query error:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format data
    const products = rows.map(row => ({
      ...row,
      Brand: row.Brand || '',
      Price: parseFloat(row.Price).toFixed(2)
    }));
    
    res.json(products);
  });
  
  db.close();
});

// Add product
app.post('/api/products', (req, res) => {
  const { Brand, 'Generic Name': genericName, 'Dosage Form': dosageForm, Price } = req.body;
  const code = `PRD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });
  
  db.run(`
    INSERT INTO products (code, brand, generic_name, dosage_form, price)
    VALUES (?, ?, ?, ?, ?)
  `, [code, Brand || '', genericName, dosageForm, parseFloat(Price)], function(err) {
    if (err) {
      console.error('Insert error:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      code,
      Brand: Brand || '',
      'Generic Name': genericName,
      'Dosage Form': dosageForm,
      Price: parseFloat(Price).toFixed(2)
    });
  });
  
  db.close();
});

// Update product
app.put('/api/products/:code', (req, res) => {
  const { code } = req.params;
  const { Brand, 'Generic Name': genericName, 'Dosage Form': dosageForm, Price } = req.body;
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });
  
  db.run(`
    UPDATE products 
    SET brand = ?, generic_name = ?, dosage_form = ?, price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE code = ?
  `, [Brand || '', genericName, dosageForm, parseFloat(Price), code], function(err) {
    if (err) {
      console.error('Update error:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      code,
      Brand: Brand || '',
      'Generic Name': genericName,
      'Dosage Form': dosageForm,
      Price: parseFloat(Price).toFixed(2)
    });
  });
  
  db.close();
});

// Delete product
app.delete('/api/products/:code', (req, res) => {
  const { code } = req.params;
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });
  
  db.run('DELETE FROM products WHERE code = ?', [code], function(err) {
    if (err) {
      console.error('Delete error:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
  
  db.close();
});

// Download SQLite database
app.get('/api/download-db', (req, res) => {
  if (!fs.existsSync(DB_PATH)) {
    return res.status(404).json({ error: 'Database file not found' });
  }
  res.download(DB_PATH, 'pharmacy.sqlite');
});

// Upload SQLite database
app.post('/api/upload-db', upload.single('database'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Move uploaded file to replace current database
  fs.copyFile(req.file.path, DB_PATH, (err) => {
    // Clean up uploaded file
    fs.unlink(req.file.path, () => {});
    
    if (err) {
      console.error('File copy error:', err.message);
      return res.status(500).json({ error: 'Failed to update database' });
    }
    
    res.json({ message: 'Database updated successfully' });
  });
});

// Initialize and start server
console.log(`📁 Data directory: ${DATA_DIR}`);
console.log(`🗄️ Database path: ${DB_PATH}`);

initDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Database: ${DB_PATH}`);
});

module.exports = app; 