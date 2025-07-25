# 🏥 Pharmacy Product Manager

A React-based CRUD application for pharmacists to manage pharmaceutical products using CSV data sources. The app provides a modern, user-friendly interface for managing medication inventory with searchable dropdowns and real-time filtering.

## ✨ Features

### Core Functionality
- **📋 CRUD Operations**: Create, Read, Update, and Delete pharmaceutical products
- **📂 CSV Data Management**: Load and manage data from two CSV files
- **🔍 Smart Search**: Real-time search and filtering by brand, generic name, or dosage form
- **📊 Sortable Table**: Click column headers to sort products
- **💾 CSV Export**: Download updated product list as CSV file

### Intelligent Form Features
- **🔎 Searchable Generic Name Dropdown**: Auto-populated from `item_codes.csv`
- **🔗 Dependent Dosage Form Dropdown**: Automatically filters based on selected generic name
- **✅ Form Validation**: Real-time validation with error messages
- **💰 Price Formatting**: Automatic currency formatting

### User Experience
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Clean, professional interface with smooth animations
- **⚡ Fast Performance**: Optimized React components with proper state management
- **🔄 Real-time Updates**: Instant feedback on all operations

## 📋 Data Sources

### 1. `item_codes.csv`
Contains reference data for pharmaceutical products:
- **Drug Code**: Unique identifier
- **Generic Name**: Generic medication name
- **Dosage Form**: Available forms (Tablet, Capsule, Syrup, etc.)

### 2. `product_list.csv`
Contains the manageable product inventory:
- **ID**: Unique product identifier
- **Brand**: Brand/trade name
- **Generic Name**: Links to item_codes data
- **Dosage Form**: Must match available forms for the generic name
- **Price**: Product price in USD

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd simple_pharmacy_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically load the CSV data

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ProductForm.jsx     # Form for adding/editing products
│   └── ProductTable.jsx    # Table with search and sorting
├── hooks/
│   └── useCSVData.js       # Custom hook for CSV management
├── App.jsx                 # Main application component
├── App.css                 # Comprehensive styling
└── main.jsx                # React entry point

public/
├── item_codes.csv          # Reference data
└── product_list.csv        # Product inventory
```

## 💻 Usage Guide

### Adding a New Product
1. Click the **"➕ Add New Product"** button
2. Fill in the product details:
   - **Brand**: Enter the brand/trade name
   - **Generic Name**: Search and select from dropdown
   - **Dosage Form**: Choose from available forms (filtered by generic name)
   - **Price**: Enter the price (validates for positive numbers)
3. Click **"Add Product"** to save

### Editing a Product
1. Click the **✏️** edit button in the product table
2. Modify the details in the form
3. Click **"Update Product"** to save changes

### Deleting a Product
1. Click the **🗑️** delete button in the product table
2. Confirm the deletion in the popup dialog

### Searching and Filtering
- Use the search box to filter products by brand, generic name, or dosage form
- Click column headers to sort the table
- View the total count of products and filtered results

### Exporting Data
- Click **"💾 Download CSV"** to export the current product list
- The exported file includes all current products with updates

## 🛠️ Technical Details

### Technologies Used
- **React 19**: Modern React with hooks
- **Vite**: Fast development server and build tool
- **PapaParse**: CSV parsing and generation
- **React Select**: Searchable dropdown components
- **CSS3**: Modern styling with flexbox and grid

### Key Components

#### `useCSVData` Hook
- Manages CSV file loading and parsing
- Provides CRUD operations for products
- Handles data validation and export functionality

#### `ProductForm` Component
- Controlled form with validation
- Dependent dropdown functionality
- Real-time error feedback

#### `ProductTable` Component
- Sortable columns
- Real-time search filtering
- Responsive design with action buttons

### Performance Optimizations
- `useMemo` for expensive filtering/sorting operations
- Efficient state management
- Optimized re-renders
- Lazy loading of CSV data

## 🎨 Styling Features

- **Modern Design**: Clean, professional pharmaceutical theme
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: Subtle hover effects and transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Visual feedback during data operations

## 🔧 Customization

### Adding New Fields
1. Update the CSV files with new columns
2. Modify the form validation in `ProductForm.jsx`
3. Add new table columns in `ProductTable.jsx`
4. Update the styling as needed

### Changing Data Sources
- Replace the CSV files in the `public/` directory
- Update the column mapping in `useCSVData.js`
- Adjust form fields and validation accordingly

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for pharmacists and healthcare professionals**
