import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const ProductForm = ({ 
  product = null, 
  onSubmit, 
  onCancel, 
  getUniqueGenericNames, 
  getDosageFormsForGeneric 
}) => {
  const [formData, setFormData] = useState({
    Brand: '',
    'Generic Name': '',
    'Dosage Form': '',
    Price: ''
  });
  const [errors, setErrors] = useState({});
  const [dosageForms, setDosageForms] = useState([]);

  useEffect(() => {
    if (product) {
      // Handle both 'Brand' and 'brand' properties for compatibility
      const brandValue = product.Brand || product.brand || '';
      setFormData({
        Brand: brandValue,
        'Generic Name': product['Generic Name'] || '',
        'Dosage Form': product['Dosage Form'] || '',
        Price: product.Price || ''
      });
      
      if (product['Generic Name']) {
        setDosageForms(getDosageFormsForGeneric(product['Generic Name']));
      }
    }
  }, [product, getDosageFormsForGeneric]);

  const genericNameOptions = getUniqueGenericNames().map(name => ({
    value: name,
    label: name
  }));

  const dosageFormOptions = dosageForms.map(form => ({
    value: form,
    label: form
  }));

  const handleGenericNameChange = (selectedOption) => {
    const genericName = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({
      ...prev,
      'Generic Name': genericName,
      'Dosage Form': '' // Reset dosage form when generic name changes
    }));
    
    if (genericName) {
      setDosageForms(getDosageFormsForGeneric(genericName));
    } else {
      setDosageForms([]);
    }
    
    // Clear any existing errors for these fields
    setErrors(prev => ({
      ...prev,
      'Generic Name': '',
      'Dosage Form': ''
    }));
  };

  const handleDosageFormChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      'Dosage Form': selectedOption ? selectedOption.value : ''
    }));
    setErrors(prev => ({ ...prev, 'Dosage Form': '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Brand is optional - no validation needed
    
    if (!formData['Generic Name']) {
      newErrors['Generic Name'] = 'Generic Name is required';
    }
    
    if (!formData['Dosage Form']) {
      newErrors['Dosage Form'] = 'Dosage Form is required';
    }
    
    if (!formData.Price) {
      newErrors.Price = 'Price is required';
    } else if (isNaN(parseFloat(formData.Price)) || parseFloat(formData.Price) <= 0) {
      newErrors.Price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        Price: parseFloat(formData.Price).toFixed(2)
      };
      onSubmit(processedData);
    }
  };

  const handleReset = () => {
    setFormData({
      Brand: '',
      'Generic Name': '',
      'Dosage Form': '',
      Price: ''
    });
    setDosageForms([]);
    setErrors({});
  };

  // Safe check for Brand field
  const brandValue = formData.Brand || '';
  const isBrandEmpty = !brandValue.trim();

  return (
    <div className="product-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="brand">Brand (Optional)</label>
          <input
            type="text"
            id="brand"
            name="Brand"
            value={brandValue}
            onChange={handleInputChange}
            className={errors.Brand ? 'error' : ''}
            placeholder="Enter brand name (optional)"
          />
          {isBrandEmpty && !errors.Brand && (
            <span className="hint-message">💡 Your brand is empty - this field is optional</span>
          )}
          {errors.Brand && <span className="error-message">{errors.Brand}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="generic-name">Generic Name *</label>
          <Select
            id="generic-name"
            value={genericNameOptions.find(option => option.value === formData['Generic Name']) || null}
            onChange={handleGenericNameChange}
            options={genericNameOptions}
            isSearchable
            placeholder="Search and select generic name..."
            className={errors['Generic Name'] ? 'error' : ''}
          />
          {errors['Generic Name'] && <span className="error-message">{errors['Generic Name']}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dosage-form">Dosage Form *</label>
          <Select
            id="dosage-form"
            value={dosageFormOptions.find(option => option.value === formData['Dosage Form']) || null}
            onChange={handleDosageFormChange}
            options={dosageFormOptions}
            isSearchable
            placeholder="Select dosage form..."
            isDisabled={!formData['Generic Name']}
            className={errors['Dosage Form'] ? 'error' : ''}
          />
          {errors['Dosage Form'] && <span className="error-message">{errors['Dosage Form']}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="Price"
            value={formData.Price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={errors.Price ? 'error' : ''}
            placeholder="0.00"
          />
          {errors.Price && <span className="error-message">{errors.Price}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {product ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 