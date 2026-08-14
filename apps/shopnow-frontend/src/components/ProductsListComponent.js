import React, { useState, useEffect } from "react";
import productService from "../services/ProductService";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from '../common/WithRouter';
import { updateProduct } from "../actions/products";
import { Container, Row, Col, Card as BootstrapCard, Modal, Form, InputGroup } from "react-bootstrap";
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    TextField, 
    Grid, 
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Fab,
    Avatar,
    Divider
} from '@mui/material';
import cartService from "../services/CartService";
import { 
    Delete as DeleteIcon, 
    Add, 
    ShoppingCartRounded,
    Search,
    FilterList,
    Edit,
    Visibility,
    Star,
    Category,
    // Enhanced icons for better UX
    Inventory2,
    TrendingUp,
    LocalOffer,
    ShoppingBag,
    Favorite,
    Share,
    MoreVert,
    Grade,
    NewReleases,
    Verified,
    Dashboard,
    Analytics,
    // Category specific icons
    Checkroom,
    PhoneAndroid,
    Computer,
    Laptop,
    Home,
    SelfImprovement,
    Watch,
    DirectionsRun,
    ChildCare,
    Clear,
    FilterAlt
} from "@mui/icons-material";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cartProducts, setCartProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [totalPrice, setTotalPrice] = useState("");
    const [cartId, setCartId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("name");

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsedUser = JSON.parse(user);
            setIsAdmin(parsedUser.username === "admin");
        }
    }, []);

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    const retrieveCart = async () => {
        const user = localStorage.getItem("user");
        if (!user) return;
        
        const parsedUser = JSON.parse(user);

        var isCartExist = false;
        try {
            const response = await cartService.getByName(parsedUser.username);
            setCartId(response.data.id);
            isCartExist = true;
            setCartProducts(response.data.products);
            getTotalPrice(response.data.id);
        } catch (e) {
            console.log(e);
        }

        if (!isCartExist) {
            cartService.create(parsedUser.username)
                .then((response) => {
                    setCartId(response.data.id);
                    console.log(response.data);
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    const retrieveProducts = () => {
        productService.getAll()
            .then((response) => {
                setProducts(response.data);
                setFilteredProducts(response.data);
                console.log(response.data);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(retrieveProducts, []);
    useEffect(() => {
        retrieveCart();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = products;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== "All") {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "category":
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory, sortBy]);

    const refreshList = () => {
        retrieveCart();
        retrieveProducts();
        setCurrentProduct(null);
    };

    const setActiveProduct = (product, index) => {
        setCurrentProduct(product);
        handleShowModal();
    };

    const deleteAllProducts = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete all products?");
        if (!isConfirmed) return;

        productService.deleteAll()
            .then((response) => {
                console.log(response.data);
                refreshList();
                toast.success("All products deleted successfully!");
            })
            .catch((e) => {
                console.log(e);
                toast.error("Failed to delete products");
            });
    };

    const deleteProduct = (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this product?");
        if (!isConfirmed) return;

        productService.delete(id)
            .then((response) => {
                console.log(response.data);
                refreshList();
                toast.success("Product deleted successfully!");
            })
            .catch((e) => {
                console.log(e);
                toast.error("Failed to delete product");
            });
    };

    const addToCart = (product) => {
        const user = localStorage.getItem("user");
        if (!user) {
            toast.error("Please sign in to add items to cart");
            return;
        }

        if (cartId) {
        cartService.addProducts(cartId, [product])
            .then((response) => {
                    toast.success(`${product.name} added to cart successfully!`);
                    refreshList();
            })
            .catch((e) => {
                console.log(e);
                    toast.error("Failed to add product to cart");
            });
        }
    };

    const getTotalPrice = (cartId) => {
        cartService.getTotalPrice(cartId)
            .then((response) => {
                setTotalPrice(response.data);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US').format(amount);
    };

    const getUniqueCategories = () => {
        const categories = [...new Set(products.map(product => product.category))];
        return ["All", ...categories];
    };

    const getCategoryIcon = (category) => {
        const iconMap = {
            "Men's Fashion": <Checkroom />,
            "Fashion": <Checkroom />,
            "Phones": <PhoneAndroid />,
            "Electronics": <Computer />,
            "Computers": <Laptop />,
            "Laptop": <Laptop />,
            "Home": <Home />,
            "Beauty": <SelfImprovement />,
            "Health": <SelfImprovement />,
            "Watches": <Watch />,
            "Shoes": <DirectionsRun />,
            "Sports": <DirectionsRun />,
            "Baby": <ChildCare />,
            "Mother": <ChildCare />
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (category.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return <Category />;
    };

    const productImageMap = {
        "Áo len ren màu hồng cardigan nữ": "ao-len-nu.png",
        "Điện thoại Apple iPhone 15 Pro Max 256GB": "iphone-15-promax.png",
        "Nike Air Jordan 1 Mid Chicago Toe Like Auth": "giay-nike-air.png",
        "MacBook Pro 14 inch M4 2024": "macbook-m4-pro.png",
        "Gel Rửa Mặt Emmié Soothing": "sua-rua-mat.png",
        "Quần Tập Gym Nữ Cạp Chéo": "quan-tap-gym-nu.png",
        "Dép đi trong nhà siêu xinh nam nữ": "dep-di-trong-nha.png",
        "Máy giặt Electrolux Inverter 11 kg": "may-giat.png"
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setSortBy("name");
    };

    const productsStyles = `
        .products-container {
            padding: 0;
            background: linear-gradient(135deg, var(--light-gray) 0%, var(--medium-gray) 100%);
            min-height: 100vh;
        }
        
        .products-header {
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
            color: white;
            padding: 80px 0 60px;
            position: relative;
            overflow: hidden;
        }
        
        .products-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="none"><path d="M0,0 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,0 Z" fill="rgba(255,255,255,0.1)"/></svg>') repeat-x;
            background-size: 1000px 100px;
            opacity: 0.1;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }
        
        .page-title {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -1px;
        }
        
        .page-subtitle {
            font-size: 1.3rem;
            margin-bottom: 0;
            opacity: 0.9;
            font-weight: 500;
        }
        
        .main-content {
            padding: 60px 0;
        }
        
        .admin-dashboard {
            background: var(--white);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--medium-gray);
            position: relative;
            overflow: hidden;
        }
        
        .admin-dashboard::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-teal) 50%, var(--accent-purple) 100%);
        }
        
        .dashboard-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
        }
        
        .dashboard-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.8rem;
        }
        
        .dashboard-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, var(--stat-color, var(--accent-blue)) 0%, rgba(255,255,255,0.1) 100%);
            color: white;
            padding: 32px 24px;
            border-radius: 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 16px;
            opacity: 0.9;
        }
        
        .stat-number {
            font-size: 2.8rem;
            font-weight: 900;
            margin-bottom: 8px;
            line-height: 1;
        }
        
        .stat-label {
            font-size: 1rem;
            font-weight: 600;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .admin-actions {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .action-btn {
            padding: 14px 28px;
            border-radius: 50px;
            font-weight: 700;
            text-transform: none;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-md);
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .primary-btn {
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            color: white;
        }
        
        .danger-btn {
            background: linear-gradient(135deg, var(--error) 0%, #e53e3e 100%);
            color: white;
        }
        
        .filters-section {
            background: var(--white);
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--medium-gray);
        }
        
        .filters-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
        }
        
        .filters-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .clear-filters-btn {
            background: var(--light-gray);
            color: var(--text-secondary);
            border: 1px solid var(--medium-gray);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .clear-filters-btn:hover {
            background: var(--medium-gray);
            color: var(--text-primary);
        }
        
        .search-container {
            margin-bottom: 24px;
        }
        
        .search-field {
            border-radius: 16px;
        }
        
        .search-field .MuiOutlinedInput-root {
            border-radius: 16px;
        }
        
        .filters-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            align-items: end;
        }
        
        .filter-field .MuiOutlinedInput-root {
            border-radius: 12px;
        }
        
        .products-grid-section {
            background: var(--white);
            border-radius: 24px;
            padding: 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--medium-gray);
        }
        
        .grid-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 32px;
        }
        
        .results-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .results-chip {
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            color: white;
            font-weight: 700;
            border-radius: 20px;
        }
        
        .product-card {
            border: none;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
            box-shadow: var(--shadow-md);
            background: var(--white);
            border: 2px solid var(--medium-gray);
            position: relative;
        }
        
        .product-card:hover {
            transform: translateY(-12px);
            box-shadow: var(--shadow-xl);
            border-color: var(--accent-blue);
        }
        
        .product-image-wrapper {
            position: relative;
            overflow: hidden;
        }
        
        .product-image {
            height: 240px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            width: 100%;
        }
        
        .product-card:hover .product-image {
            transform: scale(1.08);
        }
        
        .product-overlay {
            position: absolute;
            top: 16px;
            right: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .product-card:hover .product-overlay {
            opacity: 1;
        }
        
        .overlay-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.95);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-sm);
        }
        
        .overlay-btn:hover {
            background: var(--accent-blue);
            color: white;
            transform: scale(1.1);
        }
        
        .product-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .product-body {
            padding: 24px;
        }
        
        .product-category-chip {
            background: rgba(102, 126, 234, 0.1);
            color: var(--accent-blue);
            font-size: 12px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .product-title {
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 12px;
            font-size: 1.2rem;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .product-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .product-price {
            color: var(--accent-teal);
            font-size: 1.6rem;
            font-weight: 900;
            margin: 16px 0;
        }
        
        .product-rating {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            gap: 8px;
        }
        
        .rating-stars {
            display: flex;
            gap: 2px;
        }
        
        .product-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .add-to-cart-btn {
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            flex: 1;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .add-to-cart-btn:hover {
            background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
            transform: translateY(-2px);
        }
        
        .admin-actions-group {
            display: flex;
            gap: 8px;
        }
        
        .admin-icon-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 16px;
        }
        
        .edit-btn {
            background: #fbbf24;
            color: white;
        }
        
        .delete-btn {
            background: var(--error);
            color: white;
        }
        
        .admin-icon-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .no-products {
            text-align: center;
            padding: 80px 20px;
            color: var(--text-secondary);
        }
        
        .no-products-icon {
            font-size: 5rem;
            color: var(--medium-gray);
            margin-bottom: 24px;
        }
        
        .no-products-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 16px;
        }
        
        .no-products-text {
            font-size: 1.1rem;
            line-height: 1.6;
            max-width: 500px;
            margin: 0 auto;
        }
        
        .fab-add {
            position: fixed;
            bottom: 32px;
            right: 32px;
            background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
            width: 64px;
            height: 64px;
            box-shadow: var(--shadow-xl);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
        }
        
        .fab-add:hover {
            background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
            transform: scale(1.1);
        }
        
        .fab-add svg {
            font-size: 2rem;
        }
        
        @media (max-width: 1024px) {
            .page-title {
                font-size: 2.8rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }
            
            .filters-row {
                grid-template-columns: 1fr;
                gap: 16px;
            }
        }
        
        @media (max-width: 768px) {
            .products-header {
                padding: 60px 0 40px;
            }
            
            .page-title {
                font-size: 2.2rem;
            }
            
            .page-subtitle {
                font-size: 1.1rem;
            }
            
            .main-content {
                padding: 40px 0;
            }
            
            .admin-dashboard,
            .filters-section,
            .products-grid-section {
                padding: 24px;
                margin-bottom: 24px;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .admin-actions {
                flex-direction: column;
            }
            
            .action-btn {
                width: 100%;
                justify-content: center;
            }
        }
    `;

    return (
        <>
            <style>{productsStyles}</style>
            <div className="products-container">
                {/* Header */}
                <div className="products-header">
                    <Container>
                        <div className="header-content">
                            <Typography variant="h2" className="page-title">
                                Product Management
                            </Typography>
                            <Typography variant="h6" className="page-subtitle">
                                {isAdmin ? "Manage your product inventory with advanced tools" : "Discover our amazing collection of premium products"}
                            </Typography>
                        </div>
                    </Container>
                </div>

                <Container className="main-content">
                    {/* Admin Dashboard */}
                    {isAdmin && (
                        <div className="admin-dashboard">
                            <div className="dashboard-header">
                                <div className="dashboard-icon">
                                    <Dashboard />
                                </div>
                                <h2 className="dashboard-title">Admin Dashboard</h2>
                            </div>
                            
                            <div className="stats-grid">
                                <div className="stat-card" style={{ '--stat-color': '#667eea' }}>
                                    <div className="stat-icon">
                                        <Inventory2 />
                                    </div>
                                    <div className="stat-number">{products.length}</div>
                                    <div className="stat-label">Total Products</div>
                                </div>
                                <div className="stat-card" style={{ '--stat-color': '#319795' }}>
                                    <div className="stat-icon">
                                        <Category />
                                    </div>
                                    <div className="stat-number">{getUniqueCategories().length - 1}</div>
                                    <div className="stat-label">Categories</div>
                                </div>
                                <div className="stat-card" style={{ '--stat-color': '#805ad5' }}>
                                    <div className="stat-icon">
                                        <ShoppingBag />
                                    </div>
                                    <div className="stat-number">{cartProducts.length}</div>
                                    <div className="stat-label">Cart Items</div>
                                </div>
                                <div className="stat-card" style={{ '--stat-color': '#e53e3e' }}>
                                    <div className="stat-icon">
                                        <TrendingUp />
                                    </div>
                                    <div className="stat-number">${formatCurrency(totalPrice / 25000 || 0)}</div>
                                    <div className="stat-label">Cart Value</div>
                                </div>
                            </div>
                            
                            <div className="admin-actions">
                                <Button
                                    component={Link}
                                    to="/products/add"
                                    startIcon={<Add />}
                                    className="action-btn primary-btn"
                                >
                                    Add New Product
                                </Button>
                                <Button
                                    onClick={deleteAllProducts}
                                    startIcon={<DeleteIcon />}
                                    className="action-btn danger-btn"
                                >
                                    Delete All Products
                    </Button>
                            </div>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="filters-section">
                        <div className="filters-header">
                            <div className="filters-title">
                                <FilterList />
                                Search & Filter
                            </div>
                            <Button 
                                onClick={clearFilters}
                                startIcon={<Clear />}
                                className="clear-filters-btn"
                            >
                                Clear All
                            </Button>
                        </div>
                        
                        <div className="search-container">
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search products by name, description, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search style={{ marginRight: 12, color: 'var(--text-secondary)' }} />
                                }}
                                className="search-field"
                            />
                        </div>
                        
                        <div className="filters-row">
                            <FormControl variant="outlined" className="filter-field">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    label="Category"
                                    startAdornment={getCategoryIcon(selectedCategory)}
                                >
                                    {getUniqueCategories().map((category) => (
                                        <MenuItem key={category} value={category}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getCategoryIcon(category)}
                                                {category}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl variant="outlined" className="filter-field">
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="name">Name (A-Z)</MenuItem>
                                    <MenuItem value="price-low">Price (Low to High)</MenuItem>
                                    <MenuItem value="price-high">Price (High to Low)</MenuItem>
                                    <MenuItem value="category">Category</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="products-grid-section">
                        <div className="grid-header">
                            <Typography variant="h5" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Products Catalog
                            </Typography>
                            <div className="results-info">
                                <Chip 
                                    label={`${filteredProducts.length} products found`}
                                    className="results-chip"
                                />
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="no-products">
                                <Inventory2 className="no-products-icon" />
                                <Typography variant="h4" className="no-products-title">
                                    No products found
                                </Typography>
                                <Typography variant="body1" className="no-products-text">
                                    {searchTerm || selectedCategory !== "All" 
                                        ? "Try adjusting your search criteria or clear the filters to see all products"
                                        : "No products are currently available. Check back later for new additions to our catalog."
                                    }
                                </Typography>
                </div>
                        ) : (
                            <Row>
                                {filteredProducts.map((product, index) => (
                                    <Col lg={3} md={4} sm={6} key={index} className="mb-4">
                                        <BootstrapCard className="product-card">
                                            <div className="product-image-wrapper">
                                                <BootstrapCard.Img
                                        variant="top" 
                                        src={`/${productImageMap[product.name] || "placeholder.png"}`}
                                                    className="product-image"
                                        onClick={() => setActiveProduct(product, index)} 
                                    />
                                                <div className="product-badge">
                                                    <NewReleases style={{ fontSize: '12px' }} />
                                                    NEW
                                                </div>
                                                <div className="product-overlay">
                                                    <button className="overlay-btn">
                                                        <Favorite style={{ fontSize: '18px' }} />
                                                    </button>
                                                    <button className="overlay-btn">
                                                        <Share style={{ fontSize: '18px' }} />
                                                    </button>
                                                    <button className="overlay-btn" onClick={() => setActiveProduct(product, index)}>
                                                        <Visibility style={{ fontSize: '18px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="product-body">
                                                <div className="product-category-chip">
                                                    {getCategoryIcon(product.category)}
                                                    {product.category}
                                                </div>
                                                <BootstrapCard.Title className="product-title">
                                            {product.name}
                                                </BootstrapCard.Title>
                                                <BootstrapCard.Text className="product-description">
                                                    {product.description}
                                                </BootstrapCard.Text>
                                                <div className="product-rating">
                                                    <div className="rating-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Grade key={i} style={{ color: '#fbbf24', fontSize: '1rem' }} />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                        4.8 (42 reviews)
                                                    </span>
                                                </div>
                                                <div className="product-price">
                                                    ${formatCurrency(product.price / 25000)}
                                                </div>
                                                <div className="product-actions">
                                            <Button
                                                startIcon={<ShoppingCartRounded />}
                                                        variant="contained"
                                                onClick={() => addToCart(product)}
                                                        className="add-to-cart-btn"
                                            >
                                                Add to Cart
                                            </Button>
                                                    {isAdmin && (
                                                        <div className="admin-actions-group">
                                                            <button
                                                                className="admin-icon-btn edit-btn"
                                                                onClick={() => window.location.href = `/products/${product.id}`}
                                                                title="Edit Product"
                                                            >
                                                                <Edit />
                                                            </button>
                                                            <button
                                                                className="admin-icon-btn delete-btn"
                                                                onClick={() => deleteProduct(product.id)}
                                                                title="Delete Product"
                                                            >
                                                                <DeleteIcon />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                        </div>
                                        </BootstrapCard>
                                    </Col>
                                ))}
                            </Row>
                        )}
                            </div>

                    {/* Floating Add Button for Admin */}
                    {isAdmin && (
                        <Fab
                            component={Link}
                            to="/products/add"
                            className="fab-add"
                            aria-label="add product"
                        >
                            <Add />
                        </Fab>
                    )}

                    {/* Product Detail Modal */}
                    <Dialog
                        open={showModal}
                        onClose={handleCloseModal}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            style: {
                                borderRadius: '24px',
                                overflow: 'hidden'
                            }
                        }}
                    >
                        {currentProduct && (
                            <>
                                <DialogTitle style={{ 
                                    background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%)',
                                    color: 'white',
                                    padding: '24px 32px'
                                }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        {getCategoryIcon(currentProduct.category)}
                                        <Box>
                                            <Typography variant="h5" component="div" style={{ fontWeight: 700, marginBottom: 4 }}>
                                                {currentProduct.name}
                                            </Typography>
                                            <Typography variant="subtitle2" style={{ opacity: 0.9 }}>
                                                {currentProduct.category}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </DialogTitle>
                                <DialogContent style={{ padding: '32px' }}>
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                            <img
                                                src={`/${productImageMap[currentProduct.name] || "placeholder.png"}`}
                                                alt={currentProduct.name}
                                                style={{ 
                                                    width: '100%', 
                                                    borderRadius: '16px',
                                                    boxShadow: 'var(--shadow-md)'
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body1" paragraph style={{ 
                                                fontSize: '1.1rem', 
                                                lineHeight: 1.7,
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {currentProduct.description}
                                            </Typography>
                                            <Typography variant="h3" style={{ 
                                                color: 'var(--accent-teal)', 
                                                fontWeight: 900,
                                                marginBottom: '20px'
                                            }}>
                                                ${formatCurrency(currentProduct.price / 25000)}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                                <div className="rating-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Grade key={i} style={{ color: '#fbbf24', fontSize: '1.4rem' }} />
                        ))}
                </div>
                                                <Typography variant="body1" style={{ 
                                                    fontWeight: 600,
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    4.8 out of 5 stars (42 reviews)
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                <Verified style={{ color: 'var(--accent-teal)' }} />
                                                <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
                                                    Verified Quality & Authenticity
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions style={{ padding: '24px 32px' }}>
                                    <Button 
                                        onClick={handleCloseModal}
                                        style={{ 
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            addToCart(currentProduct);
                                            handleCloseModal();
                                        }}
                                        variant="contained"
                                        startIcon={<ShoppingCartRounded />}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%)',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: 700
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                </Container>
            </div>
        </>
    );
};

function mapStateToProps(state) {
    const { products } = state.products;
    return {
        products,
    };
}

export default connect(mapStateToProps)(withRouter(ProductsList));
