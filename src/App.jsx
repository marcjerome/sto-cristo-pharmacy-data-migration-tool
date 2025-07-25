import React, { useState } from 'react';
import { useSQLiteData } from './hooks/useSQLiteData';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import './App.css';

function App() {
  const {
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
    clearAllData
  } = useSQLiteData();

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddProduct = (productData) => {
    addProduct(productData);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleUpdateProduct = (productData) => {
    updateProduct(editingProduct.code, productData);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productCode) => {
    deleteProduct(productCode);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleAddProduct(productData);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
      clearAllData();
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pharmaceutical data and initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <p>Please make sure the CSV files are available in the public folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Pharmacy Product Manager - Data Migration Tool for new Sto. Cristo EHR</h1>
        <p>Migration needed before actual system deployment. Please complete the list</p>

      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <main className="app-main">
        <div className="toolbar">
          <div className="toolbar-left">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              {showForm ? '📋 View Products' : '➕ Add New Product'}
            </button>
          </div>
          
          <div className="toolbar-center">
            <div className="product-count">
              Total Products: <span className="count">{products.length}</span>
            </div>
          </div>
          
          <div className="toolbar-right">
            <button
              onClick={exportToCSV}
              className="btn btn-export"
              disabled={products.length === 0}
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleClearAll}
              className="btn btn-reset"
              title="Clear all products from database"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {showForm ? (
          <div className="form-section">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              getUniqueGenericNames={getUniqueGenericNames}
              getDosageFormsForGeneric={getDosageFormsForGeneric}
            />
          </div>
        ) : (
          <div className="table-section">
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-instructions">
          <p><strong>🗄️ Database:</strong> SQLite database with automatic persistence</p>
          <p>All changes are saved instantly and persist across browser sessions</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
