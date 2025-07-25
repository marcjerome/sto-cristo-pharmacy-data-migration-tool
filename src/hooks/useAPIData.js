import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Determine API URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative URL (nginx proxy)
  : 'http://localhost:3001/api';  // In development, use direct backend URL

export const useAPIData = () => {
  const [itemCodes, setItemCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
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

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load item codes from CSV and products from API in parallel
      const [itemCodesData, productsData] = await Promise.all([
        loadCSVFile('item_codes.csv'),
        apiCall('/products')
      ]);
      
      setItemCodes(itemCodesData);
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

  const addProduct = async (newProduct) => {
    try {
      const addedProduct = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      });

      setProducts(prev => [addedProduct, ...prev]);
      showSuccessMessage(`✅ Product "${newProduct.Brand || 'New Product'}" added successfully!`);
      return addedProduct;
    } catch (err) {
      setError(`Failed to add product: ${err.message}`);
    }
  };

  const updateProduct = async (code, updatedProduct) => {
    try {
      const updated = await apiCall(`/products/${code}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct)
      });

      setProducts(prev => 
        prev.map(product => 
          product.code === code ? updated : product
        )
      );
      
      showSuccessMessage(`✅ Product "${updatedProduct.Brand || 'Product'}" updated successfully!`);
    } catch (err) {
      setError(`Failed to update product: ${err.message}`);
    }
  };

  const deleteProduct = async (code) => {
    try {
      await apiCall(`/products/${code}`, {
        method: 'DELETE'
      });

      const productToDelete = products.find(p => p.code === code);
      setProducts(prev => prev.filter(product => product.code !== code));
      
      showSuccessMessage(`✅ Product "${productToDelete?.Brand || 'Product'}" deleted successfully!`);
    } catch (err) {
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

  const downloadSQLiteFile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/download-db`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pharmacy.sqlite';
      link.click();
      showSuccessMessage('✅ SQLite database downloaded successfully!');
    } catch (err) {
      setError(`Failed to download SQLite file: ${err.message}`);
    }
  };

  const uploadSQLiteFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('database', file);

      const response = await fetch(`${API_BASE_URL}/upload-db`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      showSuccessMessage('✅ Database uploaded successfully! Refreshing...');
      setTimeout(() => loadData(), 1000);
    } catch (err) {
      setError(`Failed to upload SQLite file: ${err.message}`);
    }
  };

  const clearAllData = async () => {
    try {
      // Delete all products one by one (or you could add a bulk delete endpoint)
      await Promise.all(products.map(p => apiCall(`/products/${p.code}`, { method: 'DELETE' })));
      
      setProducts([]);
      showSuccessMessage('✅ All products cleared from database!');
    } catch (err) {
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
    uploadSQLiteFile,
    clearAllData,
    refreshData: loadData
  };
}; 