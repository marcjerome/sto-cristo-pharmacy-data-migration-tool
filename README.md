# 🏥 Pharmacy Product Manager

A React-based CRUD application for pharmacists to manage pharmaceutical products using SQLite database and CSV reference data. The app provides a modern, user-friendly interface for managing medication inventory with searchable dropdowns and real-time filtering.

## ✨ Features

### Core Functionality
- **📋 CRUD Operations**: Create, Read, Update, and Delete pharmaceutical products
- **🗄️ SQLite Database**: Automatic persistence with browser-based SQLite
- **📂 CSV Reference Data**: Load item codes from CSV for dropdown population
- **🔍 Smart Search**: Real-time search and filtering by brand, generic name, or dosage form
- **📊 Sortable Table**: Click column headers to sort products
- **📥 CSV Export**: Export current products as CSV file

### Intelligent Form Features
- **🔎 Searchable Generic Name Dropdown**: Auto-populated from `item_codes.csv`
- **🔗 Dependent Dosage Form Dropdown**: Automatically filters based on selected generic name
- **✅ Form Validation**: Real-time validation with error messages
- **💰 Price Formatting**: Automatic currency formatting

### User Experience
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Clean, professional interface with smooth animations
- **⚡ Fast Performance**: Optimized React components with SQLite persistence
- **🔄 Instant Updates**: All changes saved automatically to SQLite database

## 📋 Data Sources

### 1. `item_codes.csv`
Contains reference data for pharmaceutical products:
- **Drug Code**: Unique identifier
- **Generic Name**: Generic medication name
- **Dosage Form**: Available forms (Tablet, Capsule, Syrup, etc.)

### 2. SQLite Database
Stores the manageable product inventory:
- **Code**: Unique product identifier
- **Brand**: Brand/trade name (optional)
- **Generic Name**: Links to item_codes data
- **Dosage Form**: Must match available forms for the generic name
- **Price**: Product price in USD

## 🚀 Quick Start

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

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
   - The app will automatically load the CSV data and initialize SQLite

## 🐳 Docker Setup

### Development with Docker

1. **Run with Docker Compose (Port 5174)**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Navigate to `http://localhost:5174`

3. **Stop the application**
   ```bash
   docker-compose down
   ```

### Production with Docker

1. **Build and run production version**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

2. **Access the application**
   - Navigate to `http://localhost:8080`

3. **Stop the production application**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

### Docker Commands

```bash
# Development mode (hot reload, port 5174)
docker-compose up --build

# Production mode (optimized build, port 8080)
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build --force-recreate

# Clean up containers and volumes
docker-compose down -v
docker system prune -f
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ProductForm.jsx     # Form for adding/editing products
│   └── ProductTable.jsx    # Table with search and sorting
├── hooks/
│   └── useSQLiteData.js    # Custom hook for SQLite management
├── App.jsx                 # Main application component
├── App.css                 # Comprehensive styling
└── main.jsx                # React entry point

public/
├── item_codes.csv          # Reference data (2400+ pharmaceutical items)
└── product_list.csv        # Initial sample data (not used after SQLite init)

Docker Files:
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Development setup (port 5174)
├── docker-compose.prod.yml # Production setup (port 8080)
├── nginx.conf              # Nginx configuration for production
└── .dockerignore           # Docker ignore rules
```

## 💻 Usage Guide

### Adding a New Product
1. Click the **"➕ Add New Product"** button
2. Fill in the product details:
   - **Brand**: Enter the brand/trade name (optional)
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
- Click **"📥 Export CSV"** to download the current product list
- Use **"🗑️ Clear All"** to remove all products (with confirmation)

## 🛠️ Technical Details

### Technologies Used
- **React 19**: Modern React with hooks
- **Vite**: Fast development server and build tool
- **SQLite (sql.js)**: Client-side database with persistence
- **PapaParse**: CSV parsing for reference data
- **React Select**: Searchable dropdown components
- **CSS3**: Modern styling with flexbox and grid
- **Docker**: Containerized deployment

### Key Components

#### `useSQLiteData` Hook
- Manages SQLite database initialization and operations
- Provides CRUD operations for products
- Handles data persistence in localStorage
- Loads CSV reference data for dropdowns

#### `ProductForm` Component
- Controlled form with validation
- Dependent dropdown functionality
- Real-time error feedback
- Optional brand field with helpful hints

#### `ProductTable` Component
- Sortable columns with visual indicators
- Real-time search filtering
- Responsive design with action buttons
- Empty state handling

### Performance Optimizations
- `useMemo` for expensive filtering/sorting operations
- Efficient SQLite operations with prepared statements
- Optimized re-renders with proper dependency arrays
- Docker multi-stage builds for production

## 🎨 Styling Features

- **Modern Design**: Clean, professional pharmaceutical theme
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: Subtle hover effects and transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Visual feedback during data operations

## 🔧 Customization

### Adding New Fields
1. Update the SQLite table schema in `useSQLiteData.js`
2. Modify form validation in `ProductForm.jsx`
3. Add new table columns in `ProductTable.jsx`
4. Update the styling as needed

### Changing Data Sources
- Replace the CSV files in the `public/` directory
- Update the column mapping in `useSQLiteData.js`
- Adjust form fields and validation accordingly

## 📦 Build for Production

### Local Build
```bash
npm run build
```

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

The built files will be optimized and served via Nginx in the production container.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including Docker builds)
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for pharmacists and healthcare professionals**
