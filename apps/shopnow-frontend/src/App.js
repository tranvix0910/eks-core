import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav, Form, FormControl, Button } from "react-bootstrap";
import { Search, ShoppingCart, Person, AccountCircle, Store, FavoriteBorder, LocalOffer } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import LoginComponent from "./components/LoginComponent";
import RegisterComponent from "./components/RegisterComponent";
import HomeComponent from "./components/HomeComponent";
import ProfileComponent from "./components/ProfileComponent";
import ProductsListComponent from "./components/ProductsListComponent";
import CartComponent from "./components/CartComponent";
import AddProductComponent from "./components/AddProductComponent";
import ProductEditComponent from "./components/ProductEditComponent";

import { logout } from "./actions/auth";
import { connect } from "react-redux";
import { clearMessage } from "./actions/message";
import { history } from './helpers/history';

import AuthVerify from "./common/AuthVerify";
import EventBus from "./common/EventBus";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfileEditComponent from "./components/ProfileEditComponent";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      currentUser: undefined,
    };

    history.listen((location) => {
      props.dispatch(clearMessage());
    });
  }

  componentDidMount() {
    const user = this.props.user;

    if (user) {
      this.setState({
        currentUser: user
      });
    }

    EventBus.on("logout", () => {
      this.logOut();
    });
  }

  componentWillUnmount() {
    EventBus.remove("logout");
  }

  logOut() {
    this.props.dispatch(logout());
    this.setState({
      currentUser: undefined,
    });
  }

  render() {
    const { currentUser } = this.state;

      // Elegant professional styling with sophisticated color palette
    const appStyle = `
      :root {
        --primary-dark: #1a202c;
        --primary-blue: #2d3748;
        --accent-blue: #3182ce;
        --accent-teal: #319795;
        --accent-purple: #805ad5;
        --light-gray: #f7fafc;
        --medium-gray: #edf2f7;
        --dark-gray: #4a5568;
        --text-primary: #2d3748;
        --text-secondary: #718096;
        --white: #ffffff;
        --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      body {
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, var(--light-gray) 0%, var(--medium-gray) 100%);
        color: var(--text-primary);
        line-height: 1.6;
      }
      
      .header-container {
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid var(--medium-gray);
        box-shadow: var(--shadow-sm);
      }
      
      .header-top {
        background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
        color: white;
        padding: 12px 0;
        font-size: 14px;
        font-weight: 500;
      }
      
      .header-top-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
      }
      
      .header-links {
        display: flex;
        align-items: center;
        gap: 32px;
      }
      
      .header-links a {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 8px 0;
        position: relative;
      }
      
      .header-links a::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--accent-teal);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .header-links a:hover {
        color: white;
      }
      
      .header-links a:hover::after {
        width: 100%;
      }
      
      .auth-section {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .auth-links {
        color: rgba(255, 255, 255, 0.9) !important;
        text-decoration: none;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
      }
      
      .auth-links:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white !important;
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }
      
      .main-navbar {
        background: var(--white);
        padding: 20px 0;
        border-bottom: 1px solid var(--medium-gray);
      }
      
      .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 24px;
      }
      
      .brand-logo {
        font-size: 32px;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .brand-logo:hover {
        transform: translateY(-2px);
        text-decoration: none;
      }
      
      .brand-logo svg {
        color: var(--accent-blue);
        font-size: 36px;
      }
      
      .search-container {
        flex: 1;
        max-width: 600px;
        margin: 0 48px;
        position: relative;
      }
      
      .search-form {
        display: flex;
        background: var(--white);
        border: 2px solid var(--medium-gray);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow-sm);
      }
      
      .search-form:focus-within {
        border-color: var(--accent-blue);
        box-shadow: var(--shadow-md), 0 0 0 3px rgba(49, 130, 206, 0.1);
        transform: translateY(-1px);
      }
      
      .search-input {
        flex: 1;
        border: none;
        padding: 14px 20px;
        font-size: 15px;
        outline: none;
        background: transparent;
        color: var(--text-primary);
        font-weight: 500;
      }
      
      .search-input::placeholder {
        color: var(--text-secondary);
        font-weight: 400;
      }
      
      .search-button {
        background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
        border: none;
        padding: 14px 20px;
        color: white;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
      }
      
      .search-button:hover {
        background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
        transform: translateX(-2px);
      }
      
      .nav-actions {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      
      .nav-icon {
        color: var(--text-primary);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 10px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        font-size: 14px;
        position: relative;
        background: var(--light-gray);
        border: 1px solid var(--medium-gray);
      }
      
      .nav-icon:hover {
        background: var(--white);
        color: var(--accent-blue);
        text-decoration: none;
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .nav-icon svg {
        font-size: 20px;
      }
      
      .cart-icon {
        position: relative;
      }
      
      .user-menu {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--light-gray);
        padding: 8px 16px;
        border-radius: 10px;
        border: 1px solid var(--medium-gray);
      }
      
      .username {
        color: var(--accent-blue);
        font-weight: 700;
        font-size: 14px;
      }
      
      .content-wrapper {
        min-height: calc(100vh - 140px);
        padding: 0;
      }
      
      /* Enhanced responsive design */
      @media (max-width: 1024px) {
        .header-top-content,
        .navbar-content {
          max-width: 100%;
          padding: 0 20px;
        }
        
        .search-container {
          margin: 0 24px;
        }
        
        .nav-actions {
          gap: 16px;
        }
      }
      
      @media (max-width: 768px) {
        .header-top {
          padding: 8px 0;
        }
        
        .header-top-content {
          flex-direction: column;
          gap: 12px;
          padding: 0 16px;
        }
        
        .header-links {
          gap: 20px;
        }
        
        .navbar-content {
          flex-direction: column;
          gap: 20px;
          padding: 0 16px;
        }
        
        .brand-logo {
          font-size: 28px;
        }
        
        .search-container {
          margin: 0;
          max-width: 100%;
        }
        
        .nav-actions {
          gap: 12px;
          width: 100%;
          justify-content: center;
        }
        
        .nav-icon {
          flex: 1;
          justify-content: center;
          min-width: 80px;
        }
      }
      
      @media (max-width: 480px) {
        .header-links {
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }
        
        .nav-actions {
          flex-direction: column;
          gap: 8px;
        }
        
        .nav-icon {
          width: 100%;
        }
      }
    `;

    return (
      <>
        <style>{appStyle}</style>
        
        <div className="header-container">
          {/* Top Header */}
          <div className="header-top">
            <div className="header-top-content">
              <div className="header-links">
                <a href="https://devopsedu.vn/" target="_blank" rel="noopener noreferrer">
                  Seller Center
                </a>
                <a href="https://devopsedu.vn/contact/" target="_blank" rel="noopener noreferrer">
                  Customer Service
                </a>
                <a href="https://devopsedu.vn/blog/" target="_blank" rel="noopener noreferrer">
                  Help & Support
                </a>
              </div>
              
              <div className="auth-section">
                {currentUser ? (
                  <div className="user-menu">
                    <AccountCircle style={{ color: 'var(--accent-blue)' }} />
                    <Link to="/profile" className="auth-links">
                      <span className="username">{currentUser.username}</span>
                    </Link>
                    <a href="#" className="auth-links" onClick={this.logOut}>
                      Sign Out
                    </a>
                  </div>
                ) : (
                  <>
                    <Link to="/register" className="auth-links">Sign Up</Link>
                    <Link to="/login" className="auth-links">Sign In</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Navbar */}
          <div className="main-navbar">
            <div className="navbar-content">
              {/* Brand Logo */}
              <Link to="/" className="brand-logo">
                <Store />
                ShopNow
              </Link>

              {/* Search Bar */}
              <div className="search-container">
                <Form className="search-form">
                  <FormControl
                    type="search"
                    placeholder="Search for products, brands and more..."
                    aria-label="Search"
                    className="search-input"
                  />
                  <Button type="submit" className="search-button">
                    <Search />
                  </Button>
                </Form>
              </div>

              {/* Navigation Actions */}
              <div className="nav-actions">
                <Link to="/cart" className="nav-icon cart-icon">
                  <ShoppingCart />
                  <span>Cart</span>
                </Link>
                
                {currentUser && (
                  <>
                    <Link to="/products" className="nav-icon">
                      <LocalOffer />
                      <span>Products</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/register" element={<RegisterComponent />} />
            <Route path="/cart" element={<CartComponent />} />
            {currentUser && (
              <>
                <Route path="/profile" element={<ProfileComponent />} />
                <Route path="/profile/:id" element={<ProfileEditComponent />} />
                <Route path="/products" element={<ProductsListComponent />} />
                <Route path="/products/add" element={<AddProductComponent />} />
                <Route path="/products/:id" element={<ProductEditComponent />} />
              </>
            )}
          </Routes>
        </div>
        
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            background: 'white',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--medium-gray)'
          }}
        />
        <AuthVerify logOut={this.logOut} />
      </>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(App);
