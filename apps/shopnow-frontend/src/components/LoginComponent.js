import React, { Component } from "react";
import { Navigate, Link } from 'react-router-dom';
import { Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { LockOutlined, PersonOutline, VisibilityOff, Visibility } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';

import Form from "react-validation/build/form";
import CheckButton from "react-validation/build/button";

import { connect } from "react-redux";
import { login } from "../actions/auth";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);

        this.state = {
            username: "",
            password: "",
            loading: false,
            showPassword: false,
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value,
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value,
        });
    }

    togglePasswordVisibility() {
        this.setState({
            showPassword: !this.state.showPassword,
        });
    }

    handleLogin(e) {
        e.preventDefault();

        this.setState({
            loading: true,
        });

        this.form.validateAll();

        const { dispatch } = this.props;

        if (this.checkBtn.context._errors.length === 0) {
            dispatch(login(this.state.username, this.state.password))
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    console.log(error);
                    this.setState({
                        loading: false
                    });
                });
        } else {
            this.setState({
                loading: false,
            });
        }
    }

    render() {
        const { isLoggedIn, message } = this.props;

        if (isLoggedIn) {
            return <Navigate to="/" />;
        }

        const loginStyles = `
            .login-container {
                min-height: 100vh;
                background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
                overflow: hidden;
            }
            
            .login-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="none"><path d="M0,0 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,0 Z" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
                background-size: 1000px 100px;
                opacity: 0.1;
            }
            
            .login-paper {
                padding: 48px;
                border-radius: var(--border-radius-xl);
                box-shadow: var(--shadow-xl);
                background: var(--white);
                max-width: 450px;
                width: 100%;
                border: 1px solid var(--medium-gray);
                position: relative;
                z-index: 2;
            }
            
            .login-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .login-icon {
                background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
                border-radius: 50%;
                width: 88px;
                height: 88px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                box-shadow: var(--shadow-lg);
                transition: var(--transition-normal);
            }
            
            .login-icon:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow-xl);
            }
            
            .login-title {
                color: var(--text-primary);
                font-weight: 800;
                margin-bottom: 12px;
                font-size: 2.2rem;
            }
            
            .login-subtitle {
                color: var(--text-secondary);
                font-size: 16px;
                font-weight: 500;
                line-height: 1.6;
            }
            
            .login-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .login-button {
                background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
                padding: 16px;
                border-radius: var(--border-radius-md);
                font-weight: 700;
                text-transform: none;
                font-size: 16px;
                margin-top: 16px;
                box-shadow: var(--shadow-md);
                transition: var(--transition-normal);
            }
            
            .login-button:hover {
                background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .login-button:disabled {
                opacity: 0.7;
                transform: none;
            }
            
            .signup-link {
                text-align: center;
                margin-top: 24px;
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .signup-link a {
                color: var(--accent-blue);
                text-decoration: none;
                font-weight: 700;
                transition: var(--transition-fast);
            }
            
            .signup-link a:hover {
                color: var(--accent-teal);
                text-decoration: underline;
            }
            
            .custom-textfield .MuiOutlinedInput-root {
                border-radius: var(--border-radius-md);
                transition: var(--transition-normal);
            }
            
            .custom-textfield .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
                border-color: var(--accent-blue);
            }
            
            .custom-textfield .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                border-color: var(--accent-blue);
                border-width: 2px;
            }
            
            .custom-textfield .MuiInputLabel-root.Mui-focused {
                color: var(--accent-blue);
                font-weight: 600;
            }
            
            .custom-textfield .MuiOutlinedInput-input {
                font-weight: 500;
                color: var(--text-primary);
            }
            
            @media (max-width: 480px) {
                .login-paper {
                    padding: 32px 24px;
                    margin: 16px;
                }
                
                .login-title {
                    font-size: 1.8rem;
                }
            }
        `;

        return (
            <>
                <style>{loginStyles}</style>
                <div className="login-container">
                    <Paper className="login-paper" elevation={0}>
                        <div className="login-header">
                            <div className="login-icon">
                                <LockOutlined style={{ color: 'white', fontSize: '2.4rem' }} />
                            </div>
                            <Typography variant="h3" className="login-title">
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" className="login-subtitle">
                                Sign in to your account to continue shopping
                            </Typography>
                        </div>

                        <Form
                            onSubmit={this.handleLogin}
                            ref={(c) => {
                                this.form = c;
                            }}
                            className="login-form"
                        >
                            <TextField
                                fullWidth
                                label="Username or Email"
                                variant="outlined"
                                value={this.state.username}
                                onChange={this.onChangeUsername}
                                className="custom-textfield"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline style={{ color: 'var(--accent-blue)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                                size="medium"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={this.state.showPassword ? 'text' : 'password'}
                                variant="outlined"
                                value={this.state.password}
                                onChange={this.onChangePassword}
                                className="custom-textfield"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined style={{ color: 'var(--accent-blue)' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={this.togglePasswordVisibility}
                                                edge="end"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                required
                                size="medium"
                            />

                            {message && (
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        borderRadius: 'var(--border-radius-md)',
                                        fontWeight: 500
                                    }}
                                >
                                    {message}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={this.state.loading}
                                className="login-button"
                                startIcon={this.state.loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {this.state.loading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            <CheckButton
                                style={{ display: "none" }}
                                ref={(c) => {
                                    this.checkBtn = c;
                                }}
                            />
                        </Form>

                        <div className="signup-link">
                            Don't have an account? <Link to="/register">Create Account</Link>
                        </div>
                    </Paper>
                </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    const { isLoggedIn } = state.auth;
    const { message } = state.message;
    return {
        isLoggedIn,
        message
    };
}

export default connect(mapStateToProps)(Login);