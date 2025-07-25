import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useCSVData = () => {
  const [itemCodes, setItemCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Keys for localStorage
  const STORAGE_KEYS = {
    ADDED_PRODUCTS: 'pharmacy_added_products',
    UPDATED_PRODUCTS: 'pharmacy_updated_products', 
    DELETED_PRODUCTS: 'pharmacy_deleted_products'
  };

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

  // Load stored changes from localStorage
  const loadStoredChanges = () => {
    try {
      const addedProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDED_PRODUCTS) || '[]');
      const updatedProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATED_PRODUCTS) || '{}');
      const deletedProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_PRODUCTS) || '[]');
      
      return { addedProducts, updatedProducts, deletedProducts };
    } catch (err) {
      console.error('Error loading stored changes:', err);
      return { addedProducts: [], updatedProducts: {}, deletedProducts: [] };
    }
  };

  // Apply stored changes to original CSV data
  const applyStoredChanges = (originalProducts) => {
    const { addedProducts, updatedProducts, deletedProducts } = loadStoredChanges();
    
    // Start with original products, excluding deleted ones
    let mergedProducts = originalProducts.filter(product => 
      !deletedProducts.includes(product.code)
    );
    
    // Apply updates to existing products
    mergedProducts = mergedProducts.map(product => 
      updatedProducts[product.code] ? { ...updatedProducts[product.code], code: product.code } : product
    );
    
    // Add new products
    mergedProducts = [...mergedProducts, ...addedProducts];
    
    return mergedProducts;
  };

  // Save changes to localStorage
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  };

  // Auto-download updated CSV file
  const autoDownloadCSV = (products, action) => {
    const csvData = products.map(({ ...product }) => product);
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_list.csv';
    link.click();
    
    return `✅ ${action} complete! Updated product_list.csv downloaded. Replace the file in public/ folder to persist changes.`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [itemCodesData, originalProductsData] = await Promise.all([
        loadCSVFile('item_codes.csv'),
        loadCSVFile('product_list.csv')
      ]);
      
      setItemCodes(itemCodesData);
      
      // Apply stored changes to original CSV data
      const mergedProducts = applyStoredChanges(originalProductsData);
      setProducts(mergedProducts);
      
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
    setTimeout(() => setSuccessMessage(''), 5000); // Show for 5 seconds for file replacement instructions
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
    // Generate a unique code based on timestamp and random number
    const productWithCode = {
      ...newProduct,
      code: `PRD${Date.now()}${Math.floor(Math.random() * 1000)}`
    };
    
    // Update state
    const updatedProducts = [...products, productWithCode];
    setProducts(updatedProducts);
    
    // Save to localStorage
    const { addedProducts } = loadStoredChanges();
    const updatedAddedProducts = [...addedProducts, productWithCode];
    saveToStorage(STORAGE_KEYS.ADDED_PRODUCTS, updatedAddedProducts);
    
    // Auto-download updated CSV
    const message = autoDownloadCSV(updatedProducts, `Product "${newProduct.Brand || 'New Product'}" added`);
    showSuccessMessage(message);
    
    return productWithCode;
  };

  const updateProduct = (code, updatedProduct) => {
    // Update state
    const updatedProducts = products.map(product => 
      product.code === code ? { ...updatedProduct, code } : product
    );
    setProducts(updatedProducts);
    
    // Save to localStorage
    const { updatedProducts: storedUpdates } = loadStoredChanges();
    const newUpdatedProducts = { ...storedUpdates, [code]: updatedProduct };
    saveToStorage(STORAGE_KEYS.UPDATED_PRODUCTS, newUpdatedProducts);
    
    // Auto-download updated CSV
    const message = autoDownloadCSV(updatedProducts, `Product "${updatedProduct.Brand || 'Product'}" updated`);
    showSuccessMessage(message);
  };

  const deleteProduct = (code) => {
    const productToDelete = products.find(p => p.code === code);
    
    // Update state
    const updatedProducts = products.filter(product => product.code !== code);
    setProducts(updatedProducts);
    
    // Save to localStorage
    const { deletedProducts, addedProducts, updatedProducts: storedUpdates } = loadStoredChanges();
    
    // If it's a newly added product, remove it from added products instead of marking as deleted
    const isNewlyAdded = addedProducts.some(p => p.code === code);
    if (isNewlyAdded) {
      const filteredAddedProducts = addedProducts.filter(p => p.code !== code);
      saveToStorage(STORAGE_KEYS.ADDED_PRODUCTS, filteredAddedProducts);
    } else {
      // Mark as deleted for original CSV products
      const newDeletedProducts = [...deletedProducts, code];
      saveToStorage(STORAGE_KEYS.DELETED_PRODUCTS, newDeletedProducts);
    }
    
    // Remove from updated products if it exists there
    if (storedUpdates[code]) {
      const newUpdatedProducts = { ...storedUpdates };
      delete newUpdatedProducts[code];
      saveToStorage(STORAGE_KEYS.UPDATED_PRODUCTS, newUpdatedProducts);
    }
    
    // Auto-download updated CSV
    const message = autoDownloadCSV(updatedProducts, `Product "${productToDelete?.Brand || 'Product'}" deleted`);
    showSuccessMessage(message);
  };

  const exportToCSV = () => {
    const csvData = products.map(({ ...product }) => product);
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'product_list.csv';
    link.click();
    showSuccessMessage('✅ Current product_list.csv downloaded! Replace the file in public/ folder to make changes permanent.');
  };

  // Clear all stored changes (useful for debugging or resetting)
  const resetToOriginal = async () => {
    localStorage.removeItem(STORAGE_KEYS.ADDED_PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.UPDATED_PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_PRODUCTS);
    await loadData();
    showSuccessMessage('✅ All changes have been reset to original CSV data!');
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
    refreshData: loadData,
    resetToOriginal
  };
}; 