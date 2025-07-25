import React, { useState, useMemo } from 'react';

const ProductTable = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product =>
      product.Brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product['Generic Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product['Dosage Form']?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (sortConfig.key === 'Price') {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProducts, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon active">↑</span> : 
      <span className="sort-icon active">↓</span>;
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '$0.00' : `$${numPrice.toFixed(2)}`;
  };

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.Brand || 'this product'}?`)) {
      onDelete(product.code);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="product-table-container">
      <div className="table-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by brand, generic name, or dosage form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="table-info">
          {sortedProducts.length > 0 ? (
            <>
              Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
              {searchTerm && ` (filtered from ${products.length} total)`}
            </>
          ) : (
            `0 products ${searchTerm ? 'found' : 'available'}`
          )}
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="no-products">
          {searchTerm ? 'No products found matching your search.' : 'No products available. Click "Add New Product" to get started!'}
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('code')} className="sortable">
                    Code {getSortIcon('code')}
                  </th>
                  <th onClick={() => handleSort('Brand')} className="sortable">
                    Brand {getSortIcon('Brand')}
                  </th>
                  <th onClick={() => handleSort('Generic Name')} className="sortable">
                    Generic Name {getSortIcon('Generic Name')}
                  </th>
                  <th onClick={() => handleSort('Dosage Form')} className="sortable">
                    Dosage Form {getSortIcon('Dosage Form')}
                  </th>
                  <th onClick={() => handleSort('Price')} className="sortable">
                    Price {getSortIcon('Price')}
                  </th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <tr key={product.code || index}>
                    <td className="code-cell">{product.code || 'N/A'}</td>
                    <td>{product.Brand || 'N/A'}</td>
                    <td>{product['Generic Name'] || 'N/A'}</td>
                    <td>{product['Dosage Form'] || 'N/A'}</td>
                    <td className="price-cell">{formatPrice(product.Price)}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => onEdit(product)}
                        className="btn btn-small btn-edit"
                        title="Edit product"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn btn-small btn-delete"
                        title="Delete product"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="btn btn-small pagination-btn"
                  title="Previous page"
                >
                  ← Previous
                </button>
                
                <div className="page-numbers">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="page-ellipsis">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`btn btn-small page-btn ${currentPage === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="btn btn-small pagination-btn"
                  title="Next page"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductTable; 