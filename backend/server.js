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

// SQLite database path
const DB_PATH = path.join(__dirname, '..', 'data', 'pharmacy.sqlite');

// Initialize database
const initDB = () => {
  const db = new sqlite3.Database(DB_PATH);
  
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
    `);
  });
  
  db.close();
};

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(`
    SELECT code, brand as "Brand", generic_name as "Generic Name", 
           dosage_form as "Dosage Form", price as "Price"
    FROM products 
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) {
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
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(`
    INSERT INTO products (code, brand, generic_name, dosage_form, price)
    VALUES (?, ?, ?, ?, ?)
  `, [code, Brand || '', genericName, dosageForm, parseFloat(Price)], function(err) {
    if (err) {
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
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(`
    UPDATE products 
    SET brand = ?, generic_name = ?, dosage_form = ?, price = ?, updated_at = CURRENT_TIMESTAMP
    WHERE code = ?
  `, [Brand || '', genericName, dosageForm, parseFloat(Price), code], function(err) {
    if (err) {
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
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.run('DELETE FROM products WHERE code = ?', [code], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ message: 'Product deleted successfully' });
  });
  
  db.close();
});

// Download SQLite database
app.get('/api/download-db', (req, res) => {
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
      return res.status(500).json({ error: 'Failed to update database' });
    }
    
    res.json({ message: 'Database updated successfully' });
  });
});

// Initialize and start server
initDB();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Database: ${DB_PATH}`);
});

module.exports = app; 