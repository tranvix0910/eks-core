import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Box, Typography, IconButton, Grid, Button, Card, CardContent, CardMedia } from "@mui/material";
import { 
    ShoppingCartRounded, 
    YouTube, 
    TrendingUp, 
    LocalShipping, 
    Security, 
    Support, 
    Star, 
    ArrowForward, 
    ArrowBack,
    // Category Icons - More modern and specific
    Checkroom,           // Fashion
    PhoneAndroid,        // Phones
    Computer,            // Electronics  
    Laptop,              // Computers
    Home as HomeIcon,    // Home & Living - renamed to avoid conflict
    SelfImprovement,     // Beauty & Health
    Watch,               // Watches
    DirectionsRun,       // Sports/Shoes
    ChildCare,           // Mother & Baby
    // Additional icons for better UX
    Favorite,
    Share,
    Visibility,
    ShoppingBag,
    LocalOffer,
    NewReleases,
    Verified,
    Grade
} from "@mui/icons-material";
import { Carousel } from "react-bootstrap";
import productService from "../services/ProductService";
import cartService from "../services/CartService";
import { toast } from 'react-toastify';
import { Card as BootstrapCard, ListGroup } from "react-bootstrap";
import 'react-toastify/dist/ReactToastify.css';
import { Row, Col } from "react-bootstrap";
import { Facebook } from "@mui/icons-material";

const categories = [
  { 
    name: "Men's Fashion", 
    image: "/thoi-trang-nam.png", 
    icon: <Checkroom />,
    color: "#667eea",
    description: "Latest trends in men's clothing"
  },
  { 
    name: "Phones & Accessories", 
    image: "/dien-thoai-phu-kien.png", 
    icon: <PhoneAndroid />,
    color: "#319795",
    description: "Latest smartphones & accessories"
  },
  { 
    name: "Electronics", 
    image: "/thiet-bi-dien-tu.png", 
    icon: <Computer />,
    color: "#805ad5",
    description: "Cutting-edge technology"
  },
  { 
    name: "Computers & Laptops", 
    image: "/may-tinh-lap-top.png", 
    icon: <Laptop />,
    color: "#3182ce",
    description: "High-performance computing"
  },
  { 
    name: "Home & Living", 
    image: "/nha-cua-doi-song.png", 
    icon: <HomeIcon />,
    color: "#ed8936",
    description: "Beautiful home essentials"
  },
  { 
    name: "Beauty & Health", 
    image: "/sac-dep.png", 
    icon: <SelfImprovement />,
    color: "#e53e3e",
    description: "Wellness & beauty products"
  },
  { 
    name: "Watches", 
    image: "/dong-ho.png", 
    icon: <Watch />,
    color: "#38b2ac",
    description: "Luxury timepieces"
  },
  { 
    name: "Men's Shoes", 
    image: "/giay-dep-nam.png", 
    icon: <DirectionsRun />,
    color: "#d69e2e",
    description: "Stylish footwear collection"
  },
  { 
    name: "Mother & Baby", 
    image: "/me-va-be.png", 
    icon: <ChildCare />,
    color: "#9f7aea",
    description: "Essential care products"
  },
];

const features = [
  { 
    icon: <LocalShipping />, 
    title: "Free Shipping", 
    desc: "Free delivery on orders over $50",
    color: "#667eea"
  },
  { 
    icon: <Security />, 
    title: "Secure Payment", 
    desc: "100% secure payment processing",
    color: "#319795"
  },
  { 
    icon: <Support />, 
    title: "24/7 Support", 
    desc: "Dedicated customer support team",
    color: "#805ad5"
  },
  { 
    icon: <TrendingUp />, 
    title: "Best Prices", 
    desc: "Competitive prices guaranteed",
    color: "#e53e3e"
  }
];

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

export default function HomeComponent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6;
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
        const parsedUser = JSON.parse(user);
        setIsAdmin(parsedUser.username === "admin");
    }
  }, []);

  useEffect(() => {
    retrieveProducts();
    retrieveCart();
  }, []);

  const handleNext = () => {
    if (currentIndex + itemsPerPage < categories.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  const retrieveProducts = () => {
    productService.getAll()
      .then((response) => {
        setFeaturedProducts(response.data.slice(0, 8));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const retrieveCart = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
          console.error("User not found in localStorage");
          return;
      }

      const parsedUser = JSON.parse(user);

      try {
          const response = await cartService.getByName(parsedUser.username);
          setCartId(response.data.id);
      } catch (e) {
          cartService.create(parsedUser.username)
              .then((response) => {
                  setCartId(response.data.id);
              })
              .catch((e) => {
                  console.log(e);
              });
      }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
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
        })
        .catch((e) => {
          console.log(e);
          toast.error("Failed to add product to cart");
        });
    }
  };

  const setActiveProduct = (product, index) => {
    setCurrentProduct(product);
  };

  const displayedCategories = categories.slice(currentIndex, currentIndex + itemsPerPage);

  const homeStyles = `
    .home-container {
      background: linear-gradient(135deg, var(--light-gray) 0%, var(--medium-gray) 100%);
      min-height: 100vh;
    }
    
    .hero-section {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
      color: white;
      padding: 100px 0;
      margin: 0;
      position: relative;
      overflow: hidden;
    }
    
    .hero-section::before {
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
    
    .hero-content {
      text-align: center;
      position: relative;
      z-index: 2;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .hero-title {
      font-size: 4.5rem;
      font-weight: 900;
      margin-bottom: 32px;
      background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
      letter-spacing: -2px;
    }
    
    .hero-subtitle {
      font-size: 1.6rem;
      margin-bottom: 48px;
      opacity: 0.9;
      font-weight: 400;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-cta-container {
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .hero-cta {
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
      color: white;
      padding: 18px 48px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-xl);
      border: 2px solid transparent;
    }
    
    .hero-cta:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.2);
      background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
      color: white;
      text-decoration: none;
      border-color: rgba(255,255,255,0.3);
    }
    
    .hero-cta-secondary {
      background: transparent;
      color: white;
      padding: 18px 48px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 18px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(255,255,255,0.3);
    }
    
    .hero-cta-secondary:hover {
      background: rgba(255,255,255,0.1);
      color: white;
      text-decoration: none;
      transform: translateY(-2px);
    }
    
    .section-wrapper {
      padding: 100px 0;
    }
    
    .features-section {
      background: var(--white);
      border-radius: 32px;
      margin: 80px 0;
      padding: 80px 60px;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--medium-gray);
      position: relative;
      overflow: hidden;
    }
    
    .features-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-teal) 50%, var(--accent-purple) 100%);
    }
    
    .feature-card {
      text-align: center;
      padding: 48px 32px;
      border-radius: 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      background: var(--white);
      border: 2px solid var(--medium-gray);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--feature-color, var(--accent-blue)) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card:hover {
      transform: translateY(-12px);
      box-shadow: var(--shadow-xl);
      border-color: var(--feature-color, var(--accent-blue));
    }
    
    .feature-card:hover::before {
      opacity: 0.05;
    }
    
    .feature-content {
      position: relative;
      z-index: 2;
    }
    
    .feature-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, var(--feature-color, var(--accent-blue)) 0%, rgba(255,255,255,0.1) 100%);
      box-shadow: var(--shadow-md);
    }
    
    .feature-icon svg {
      font-size: 2.5rem;
      color: white;
    }
    
    .feature-card:hover .feature-icon {
      transform: scale(1.1) rotateY(180deg);
      box-shadow: var(--shadow-lg);
    }
    
    .feature-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .feature-desc {
      color: var(--text-secondary);
      font-size: 1.1rem;
      line-height: 1.6;
      font-weight: 500;
    }
    
    .section-title {
      text-align: center;
      font-size: 3.5rem;
      font-weight: 900;
      color: var(--text-primary);
      margin-bottom: 80px;
      position: relative;
      line-height: 1.1;
      letter-spacing: -1px;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 8px;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
      border-radius: 4px;
    }
    
    .categories-section {
      background: var(--white);
      border-radius: 32px;
      padding: 80px 60px;
      margin: 80px 0;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--medium-gray);
      position: relative;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 32px;
      margin-bottom: 40px;
    }
    
    .category-card {
      background: var(--white);
      border-radius: 24px;
      padding: 40px 24px;
      text-align: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 2px solid var(--medium-gray);
      height: 100%;
      position: relative;
      overflow: hidden;
      min-height: 320px;
    }
    
    .category-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--category-color) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .category-card:hover {
      border-color: var(--category-color);
      transform: translateY(-12px);
      box-shadow: var(--shadow-xl);
    }
    
    .category-card:hover::before {
      opacity: 0.08;
    }
    
    .category-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .category-icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, var(--category-color) 0%, rgba(255,255,255,0.1) 100%);
      box-shadow: var(--shadow-lg);
    }
    
    .category-icon-wrapper svg {
      font-size: 3rem;
      color: white;
    }
    
    .category-card:hover .category-icon-wrapper {
      transform: scale(1.15) rotateY(180deg);
      box-shadow: var(--shadow-xl);
    }
    
    .category-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 24px;
      display: block;
      border: 4px solid var(--medium-gray);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-md);
    }
    
    .category-card:hover .category-image {
      border-color: var(--category-color);
      transform: scale(1.1);
      box-shadow: var(--shadow-lg);
    }
    
    .category-name {
      font-weight: 800;
      color: var(--text-primary);
      font-size: 1.3rem;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    
    .category-description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
      font-weight: 500;
    }
    
    .products-section {
      background: var(--white);
      border-radius: 32px;
      padding: 80px 60px;
      margin: 80px 0;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--medium-gray);
    }
    
    .product-card {
      border: none;
      border-radius: 24px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      box-shadow: var(--shadow-md);
      background: var(--white);
      border: 2px solid var(--medium-gray);
      position: relative;
    }
    
    .product-card:hover {
      transform: translateY(-16px);
      box-shadow: var(--shadow-xl);
      border-color: var(--accent-blue);
    }
    
    .product-image-wrapper {
      position: relative;
      overflow: hidden;
    }
    
    .product-image {
      height: 280px;
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
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
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
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .product-title {
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 12px;
      font-size: 1.3rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-category {
      color: var(--accent-blue);
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .product-price {
      color: var(--accent-teal);
      font-size: 1.8rem;
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
    
    .add-to-cart-btn {
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
      border: none;
      color: white;
      padding: 16px 32px;
      border-radius: 16px;
      font-weight: 700;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .add-to-cart-btn:hover {
      background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .carousel-container {
      margin-bottom: 100px;
      border-radius: 32px;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--medium-gray);
      position: relative;
    }
    
    .carousel-item img {
      height: 500px;
      object-fit: cover;
    }
    
    .navigation-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      margin-top: 40px;
    }
    
    .navigation-btn {
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
    }
    
    .navigation-btn:hover {
      background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
      transform: scale(1.1);
      box-shadow: var(--shadow-xl);
    }
    
    .navigation-btn:disabled {
      background: var(--dark-gray);
      cursor: not-allowed;
      transform: none;
      opacity: 0.5;
    }
    
    .navigation-btn svg {
      font-size: 1.8rem;
    }
    
    .footer-modern {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
      color: white;
      padding: 100px 0 60px;
      margin-top: 100px;
      position: relative;
    }
    
    .footer-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--accent-teal) 50%, transparent 100%);
    }
    
    .footer-title {
      color: white;
      font-weight: 800;
      font-size: 1.6rem;
      margin-bottom: 32px;
    }
    
    .footer-text {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.8;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .footer-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 16px;
      display: block;
      font-weight: 600;
      font-size: 1rem;
    }
    
    .footer-link:hover {
      color: var(--accent-teal);
      text-decoration: none;
      transform: translateX(8px);
    }
    
    .social-icon {
      color: rgba(255, 255, 255, 0.7);
      font-size: 2rem;
      margin-right: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .social-icon:hover {
      color: var(--accent-teal);
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-4px);
    }
    
    .footer-divider {
      border-color: rgba(255, 255, 255, 0.2);
      margin: 60px 0 32px;
    }
    
    .footer-copyright {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      font-size: 1rem;
      font-weight: 500;
    }
    
    @media (max-width: 1024px) {
      .hero-title {
        font-size: 3.5rem;
      }
      
      .section-title {
        font-size: 2.8rem;
      }
      
      .categories-section,
      .products-section,
      .features-section {
        padding: 60px 40px;
        margin: 60px 0;
      }
      
      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
      }
    }
    
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.8rem;
      }
      
      .hero-subtitle {
        font-size: 1.3rem;
      }
      
      .hero-cta-container {
        flex-direction: column;
        gap: 16px;
      }
      
      .section-title {
        font-size: 2.2rem;
      }
      
      .categories-section,
      .products-section,
      .features-section {
        padding: 40px 24px;
        margin: 40px 0;
      }
      
      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }
      
      .carousel-item img {
        height: 300px;
      }
    }
  `;

  return (
    <>
      <style>{homeStyles}</style>
      
      <div className="home-container">
        <Container maxWidth="xl">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to ShopNow — Preview Build v2</h1>
              <p className="hero-subtitle">
                Discover premium products with exceptional quality, unbeatable prices, and a shopping experience like no other
              </p>
              <div className="hero-cta-container">
                <a href="#featured-products" className="hero-cta">
                  <ShoppingBag />
                  Start Shopping
                </a>
                <a href="#categories" className="hero-cta-secondary">
                  <Visibility />
                  Browse Categories
                </a>
              </div>
            </div>
          </div>

          {/* Banner Carousel */}
          <Box className="carousel-container">
            <Carousel>
              <Carousel.Item>
                <img className="d-block w-100" src="slide-4.png" alt="Special Offers" />
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src="slide-0.png" alt="New Arrivals" />
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src="slide-1.png" alt="Best Sellers" />
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src="slide-2.png" alt="Electronics" />
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src="slide-3.png" alt="Fashion" />
              </Carousel.Item>
            </Carousel>
          </Box>

          {/* Features Section */}
          <div className="features-section">
            <h2 className="section-title">Why Choose ShopNow?</h2>
            <Row>
              {features.map((feature, index) => (
                <Col lg={3} md={6} key={index} className="mb-4">
                  <div 
                    className="feature-card" 
                    style={{ '--feature-color': feature.color }}
                  >
                    <div className="feature-content">
                      <div className="feature-icon">
                        {feature.icon}
                      </div>
                      <h5 className="feature-title">{feature.title}</h5>
                      <p className="feature-desc">{feature.desc}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Categories Section */}
          <div className="categories-section" id="categories">
            <h2 className="section-title">Shop by Category</h2>
            
            <div className="categories-grid">
              {displayedCategories.map((category, index) => (
                <div 
                  key={index} 
                  className="category-card"
                  style={{ '--category-color': category.color }}
                >
                  <div className="category-content">
                    <div>
                      <div className="category-icon-wrapper">
                        {category.icon}
                      </div>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="category-image"
                      />
                      <Typography variant="h6" className="category-name">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" className="category-description">
                        {category.description}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="navigation-controls">
              <button 
                className="navigation-btn" 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
              >
                <ArrowBack />
              </button>
              
              <Typography variant="body1" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {Math.floor(currentIndex / itemsPerPage) + 1} of {Math.ceil(categories.length / itemsPerPage)}
              </Typography>
              
              <button 
                className="navigation-btn" 
                onClick={handleNext} 
                disabled={currentIndex + itemsPerPage >= categories.length}
              >
                <ArrowForward />
              </button>
            </div>
          </div>

          {/* Featured Products Section */}
          <div className="products-section" id="featured-products">
            <h2 className="section-title">Featured Products</h2>
            <Row>
              {featuredProducts &&
                featuredProducts.map((product, index) => (
                  <Col lg={3} md={6} key={index} className="mb-4">
                    <BootstrapCard className="product-card">
                      <div className="product-image-wrapper">
                        <BootstrapCard.Img 
                          variant="top" 
                          src={`/${productImageMap[product.name] || "placeholder.png"}`}
                          onClick={() => setActiveProduct(product, index)}
                          className="product-image"
                        />
                        <div className="product-badge">
                          <NewReleases style={{ fontSize: '14px', marginRight: '4px' }} />
                          NEW
                        </div>
                        <div className="product-overlay">
                          <button className="overlay-btn">
                            <Favorite style={{ fontSize: '20px' }} />
                          </button>
                          <button className="overlay-btn">
                            <Share style={{ fontSize: '20px' }} />
                          </button>
                          <button className="overlay-btn" onClick={() => setActiveProduct(product, index)}>
                            <Visibility style={{ fontSize: '20px' }} />
                          </button>
                        </div>
                      </div>
                      <BootstrapCard.Body style={{ padding: '32px' }}>
                        <BootstrapCard.Subtitle className="product-category">
                          {product.category}
                        </BootstrapCard.Subtitle>
                        <BootstrapCard.Title className="product-title">
                          {product.name}
                        </BootstrapCard.Title>
                        <BootstrapCard.Text style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                          {product.description.length > 80 
                            ? product.description.substring(0, 80) + "..." 
                            : product.description}
                        </BootstrapCard.Text>
                        <div className="product-rating">
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <Grade key={i} style={{ color: '#fbbf24', fontSize: '1.2rem' }} />
                            ))}
                          </div>
                          <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            4.9 (127 reviews)
                          </span>
                        </div>
                        <div className="product-price">
                          ${formatCurrency(product.price / 25000)}
                        </div>
                        <Button
                          startIcon={<ShoppingCartRounded />}
                          variant="contained"
                          onClick={() => addToCart(product)}
                          className="add-to-cart-btn"
                        >
                          Add to Cart
                        </Button>
                      </BootstrapCard.Body>
                    </BootstrapCard>
                  </Col>
                ))}
            </Row>
          </div>
        </Container>

        {/* Footer */}
        <footer className="footer-modern">
          <Container>
            <Row>
              <Col lg={4} md={6} className="mb-4">
                <h5 className="footer-title">About ShopNow</h5>
                <p className="footer-text">
                  Your premier destination for quality products and exceptional shopping experiences. 
                  We're committed to delivering excellence with every purchase and creating lasting relationships with our customers.
                </p>
                <div className="d-flex">
                  <a href="https://www.facebook.com/groups/devopsedu.vn" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Facebook />
                  </a>
                  <a href="https://www.youtube.com/@devopseduvn" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <YouTube />
                  </a>
                </div>
              </Col>

              <Col lg={2} md={6} className="mb-4">
                <h5 className="footer-title">Quick Links</h5>
                <a href="/" className="footer-link">Home</a>
                <a href="/products" className="footer-link">All Products</a>
                <a href="/profile" className="footer-link">My Account</a>
                <a href="/cart" className="footer-link">Shopping Cart</a>
              </Col>

              <Col lg={3} md={6} className="mb-4">
                <h5 className="footer-title">Customer Service</h5>
                <a href="https://devopsedu.vn/contact/" className="footer-link">Contact Us</a>
                <a href="https://devopsedu.vn/blog/" className="footer-link">Help Center</a>
                <a href="https://devopsedu.vn/" className="footer-link">Seller Center</a>
                <a href="#" className="footer-link">Returns & Refunds</a>
              </Col>

              <Col lg={3} md={6} className="mb-4">
                <h5 className="footer-title">Connect With Us</h5>
                <p className="footer-text">
                  Stay updated with our latest offers, product launches, and exclusive deals.
                </p>
                <a href="mailto:support@shopnow.com" className="footer-link">support@shopnow.com</a>
                <a href="tel:+1-800-SHOPNOW" className="footer-link">+1-800-SHOPNOW</a>
              </Col>
            </Row>
            <hr className="footer-divider" />
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} ShopNow - Premium E-commerce Platform. All rights reserved.
            </p>
          </Container>
        </footer>
      </div>
    </>
  );
}
