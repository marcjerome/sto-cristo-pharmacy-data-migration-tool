import React, { useState } from 'react';
import { useAPIData } from './hooks/useAPIData';
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
    downloadSQLiteFile,
    uploadSQLiteFile,
    clearAllData
  } = useAPIData();

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.sqlite') || file.name.endsWith('.db')) {
        uploadSQLiteFile(file);
      } else {
        alert('Please select a valid SQLite database file (.sqlite or .db)');
      }
    }
    // Reset input
    event.target.value = '';
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
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-main">
            <h1>🏥 Pharmacy Product Manager - Data Migration Tool for new Sto. Cristo EHR</h1>
            <p>Migration needed before actual system deployment. Please complete the list</p>
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="btn btn-info"
            title="How to use this application"
          >
            ℹ️ Help
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏥 About Pharmacy Product Manager</h2>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="modal-close"
                title="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <h3>📋 What is this application?</h3>
                <p>This is a <strong>Data Migration Tool</strong> for the new Sto. Cristo EHR (Electronic Health Record) system. It helps pharmacists manage and migrate pharmaceutical product data before the actual system deployment.</p>
              </div>

              <div className="info-section">
                <h3>🚀 How to use it:</h3>
                <div className="feature-list">
                  <div className="feature-item">
                    <strong>➕ Add Products:</strong> Click "Add New Product" to add pharmaceutical items. Select from 2400+ generic names and their corresponding dosage forms.
                  </div>
                  <div className="feature-item">
                    <strong>✏️ Edit Products:</strong> Click the edit (✏️) button next to any product to modify its details.
                  </div>
                  <div className="feature-item">
                    <strong>🗑️ Delete Products:</strong> Click the delete (🗑️) button to remove products from the database.
                  </div>
                  <div className="feature-item">
                    <strong>🔍 Search & Filter:</strong> Use the search box to find products by brand, generic name, or dosage form.
                  </div>
                  <div className="feature-item">
                    <strong>📄 Pagination:</strong> Browse through products 25 at a time using the pagination controls at the bottom.
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>💾 Data Management:</h3>
                <div className="feature-list">
                  <div className="feature-item">
                    <strong>🗄️ SQLite Database:</strong> All changes are automatically saved to a local SQLite database in your browser.
                  </div>
                  <div className="feature-item">
                    <strong>📥 Export CSV:</strong> Download your product list as a CSV file for backup or sharing.
                  </div>
                  <div className="feature-item">
                    <strong>🗃️ Download SQLite:</strong> Download the complete database file for external backup or transfer.
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>📝 Form Fields:</h3>
                <div className="feature-list">
                  <div className="feature-item">
                    <strong>Brand (Optional):</strong> Product brand name - can be left empty if unknown.
                  </div>
                  <div className="feature-item">
                    <strong>Generic Name (Required):</strong> Select from the searchable dropdown of pharmaceutical compounds.
                  </div>
                  <div className="feature-item">
                    <strong>Dosage Form (Required):</strong> Available forms are filtered based on the selected generic name.
                  </div>
                  <div className="feature-item">
                    <strong>Price (Required):</strong> Enter the product price in decimal format.
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>🎯 Migration Goal:</h3>
                <p>Complete the product list with accurate pharmaceutical data to ensure a smooth transition to the new Sto. Cristo EHR system. All data entered here will be used for the actual system deployment.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="btn btn-primary"
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={downloadSQLiteFile}
              className="btn btn-download"
              disabled={products.length === 0}
            >
              🗃️ Download SQLite
            </button>
            <label className="btn btn-upload" title="Upload SQLite database file">
              📤 Upload SQLite
              <input
                type="file"
                accept=".sqlite,.db"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          
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
          <p><strong>🗄️ Database:</strong> SQLite file stored on server with API access</p>
          <p>✅ <strong>Auto-persistence</strong> - All changes saved to server database file</p>
          <p>📥 <strong>Download/Upload</strong> - Export and import SQLite database files</p>
          <p>🌐 <strong>Cross-device sync</strong> - Same data accessible from any computer</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
