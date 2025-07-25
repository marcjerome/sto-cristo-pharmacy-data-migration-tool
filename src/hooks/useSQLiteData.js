import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import initSqlJs from 'sql.js';

export const useSQLiteData = () => {
  const [itemCodes, setItemCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [db, setDb] = useState(null);

  // Initialize SQLite database
  const initializeDatabase = async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      let database;
      
      // Try to load existing SQLite file from data directory
      try {
        const response = await fetch('/data/pharmacy.sqlite');
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          database = new SQL.Database(uint8Array);
          console.log('✅ Loaded existing SQLite database from /data/pharmacy.sqlite');
        } else {
          throw new Error('SQLite file not found');
        }
      } catch (err) {
        console.log('📝 Creating new SQLite database (no existing file found)');
        // Create new database if file doesn't exist
        database = new SQL.Database();
        await createTables(database);
        await insertSampleData(database);
      }

      setDb(database);
      return database;
    } catch (err) {
      throw new Error(`Failed to initialize SQLite database: ${err.message}`);
    }
  };

  const createTables = async (database) => {
    database.run(`
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
  };

  const insertSampleData = async (database) => {
    const sampleProducts = [
      ['PRD001', 'Saline Solution', '0.9% SODIUM CHLORIDE', 'SOLUTION 250 mL BOTTLE', 15.99],
      ['PRD002', 'Dextrose IV', '5% DEXTROSE IN WATER', 'SOLUTION 500 mL BOTTLE', 22.50],
      ['PRD003', 'Aciclovir Tablets', 'ACICLOVIR', '200 mg TABLET', 45.75]
    ];

    const insertStmt = database.prepare(`
      INSERT INTO products (code, brand, generic_name, dosage_form, price) 
      VALUES (?, ?, ?, ?, ?)
    `);

    sampleProducts.forEach(product => {
      insertStmt.run(product);
    });

    insertStmt.free();
  };

  // Load CSV file for item codes
  const loadCSVFile = async (filename) => {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const csvText = await response.text();
      return Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      }).data;
    } catch (err) {
      throw new Error(`Error loading ${filename}: ${err.message}`);
    }
  };

  // Load products from SQLite
  const loadProductsFromDB = (database) => {
    try {
      const stmt = database.prepare(`
        SELECT 
          code, 
          brand as "Brand", 
          generic_name as "Generic Name", 
          dosage_form as "Dosage Form", 
          price as "Price"
        FROM products 
        ORDER BY created_at DESC
      `);
      
      const products = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        // Ensure Brand is never null/undefined
        row.Brand = row.Brand || '';
        // Format price to 2 decimal places
        row.Price = parseFloat(row.Price).toFixed(2);
        products.push(row);
      }
      stmt.free();
      
      return products;
    } catch (err) {
      console.error('Error loading products from database:', err);
      return [];
    }
  };

  // Initialize data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load item codes from CSV and initialize SQLite database in parallel
      const [itemCodesData, database] = await Promise.all([
        loadCSVFile('item_codes.csv'),
        initializeDatabase()
      ]);
      
      setItemCodes(itemCodesData);
      
      // Load products from SQLite
      const productsData = loadProductsFromDB(database);
      setProducts(productsData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getUniqueGenericNames = () => {
    return [...new Set(itemCodes.map(item => item['Generic Name']))].sort();
  };

  const getDosageFormsForGeneric = (genericName) => {
    return itemCodes
      .filter(item => item['Generic Name'] === genericName)
      .map(item => item['Dosage Form'])
      .filter((form, index, self) => self.indexOf(form) === index)
      .sort();
  };

  const addProduct = (newProduct) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }

    try {
      // Generate unique code
      const code = `PRD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Insert into database
      const stmt = db.prepare(`
        INSERT INTO products (code, brand, generic_name, dosage_form, price) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        code,
        newProduct.Brand || '',
        newProduct['Generic Name'],
        newProduct['Dosage Form'],
        parseFloat(newProduct.Price)
      ]);
      stmt.free();

      // Update state with consistent property names
      const newProductWithCode = {
        code,
        Brand: newProduct.Brand || '',
        'Generic Name': newProduct['Generic Name'],
        'Dosage Form': newProduct['Dosage Form'],
        Price: parseFloat(newProduct.Price).toFixed(2)
      };

      setProducts(prev => [newProductWithCode, ...prev]);
      
      showSuccessMessage(`✅ Product "${newProduct.Brand || 'New Product'}" added successfully! Download SQLite file to save permanently.`);
      return newProductWithCode;
    } catch (err) {
      console.error('Error adding product:', err);
      setError(`Failed to add product: ${err.message}`);
    }
  };

  const updateProduct = (code, updatedProduct) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }

    try {
      // Update in database
      const stmt = db.prepare(`
        UPDATE products 
        SET brand = ?, generic_name = ?, dosage_form = ?, price = ?, updated_at = CURRENT_TIMESTAMP
        WHERE code = ?
      `);
      
      stmt.run([
        updatedProduct.Brand || '',
        updatedProduct['Generic Name'],
        updatedProduct['Dosage Form'],
        parseFloat(updatedProduct.Price),
        code
      ]);
      stmt.free();

      // Update state with consistent property names
      setProducts(prev => 
        prev.map(product => 
          product.code === code ? {
            code,
            Brand: updatedProduct.Brand || '',
            'Generic Name': updatedProduct['Generic Name'],
            'Dosage Form': updatedProduct['Dosage Form'],
            Price: parseFloat(updatedProduct.Price).toFixed(2)
          } : product
        )
      );
      
      showSuccessMessage(`✅ Product "${updatedProduct.Brand || 'Product'}" updated successfully! Download SQLite file to save permanently.`);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(`Failed to update product: ${err.message}`);
    }
  };

  const deleteProduct = (code) => {
    if (!db) {
      setError('Database not initialized');
      return;
    }

    try {
      const productToDelete = products.find(p => p.code === code);
      
      // Delete from database
      const stmt = db.prepare('DELETE FROM products WHERE code = ?');
      stmt.run([code]);
      stmt.free();

      // Update state
      setProducts(prev => prev.filter(product => product.code !== code));
      
      showSuccessMessage(`✅ Product "${productToDelete?.Brand || 'Product'}" deleted successfully! Download SQLite file to save permanently.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(`Failed to delete product: ${err.message}`);
    }
  };

  const exportToCSV = () => {
    const csvData = products.map(({ code, Brand, ...rest }) => ({
      code,
      Brand: Brand || '',
      ...rest
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_export.csv';
    link.click();
    showSuccessMessage('✅ Products exported to CSV successfully!');
  };

  const downloadSQLiteFile = () => {
    if (!db) {
      setError('Database not initialized');
      return;
    }
    
    try {
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pharmacy.sqlite';
      link.click();
      showSuccessMessage('✅ SQLite database downloaded! Place this file in ./data/ folder to persist your data.');
    } catch (err) {
      console.error('Error downloading SQLite file:', err);
      setError(`Failed to download SQLite file: ${err.message}`);
    }
  };

  const clearAllData = () => {
    if (!db) {
      setError('Database not initialized');
      return;
    }

    try {
      // Clear all products from database
      db.run('DELETE FROM products');

      // Update state
      setProducts([]);
      
      showSuccessMessage('✅ All products cleared from database! Download SQLite file to save changes.');
    } catch (err) {
      console.error('Error clearing data:', err);
      setError(`Failed to clear data: ${err.message}`);
    }
  };

  return {
    itemCodes,
    products,
    loading,
    error,
    successMessage,
    getUniqueGenericNames,
    getDosageFormsForGeneric,
    addProduct,
    updateProduct,
    deleteProduct,
    exportToCSV,
    downloadSQLiteFile,
    clearAllData,
    refreshData: loadData
  };
}; 