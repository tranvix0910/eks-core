import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { PersonAdd, PersonOutline, EmailOutlined, LockOutlined, VisibilityOff, Visibility } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';

import Form from "react-validation/build/form";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { register } from "../actions/auth";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const email = (value) => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const vusername = (value) => {
    if (value.length < 3 || value.length > 20) {
        return (
            <div className="alert alert-danger" role="alert">
                The username must be between 3 and 20 characters.
            </div>
        );
    }
};

const vpassword = (value) => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
};

class Register extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);

        this.state = {
            username: "",
            email: "",
            password: "",
            successful: false,
            loading: false,
            showPassword: false,
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value,
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value,
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

    handleRegister(e) {
        e.preventDefault();

        this.setState({
            successful: false,
            loading: true,
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            this.props
                .dispatch(
                    register(this.state.username, this.state.email, this.state.password)
                )
                .then(() => {
                    this.setState({
                        successful: true,
                        loading: false,
                    });
                    toast.success("Account created successfully! Please sign in.");
                })
                .catch(() => {
                    this.setState({
                        successful: false,
                        loading: false,
                    });
                });
        } else {
            this.setState({
                loading: false,
            });
        }
    }

    render() {
        const { message } = this.props;

        const registerStyles = `
            .register-container {
                min-height: 100vh;
                background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                position: relative;
                overflow: hidden;
            }
            
            .register-container::before {
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
            
            .register-paper {
                padding: 48px;
                border-radius: var(--border-radius-xl);
                box-shadow: var(--shadow-xl);
                background: var(--white);
                max-width: 500px;
                width: 100%;
                border: 1px solid var(--medium-gray);
                position: relative;
                z-index: 2;
            }
            
            .register-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .register-icon {
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
            
            .register-icon:hover {
                transform: scale(1.05);
                box-shadow: var(--shadow-xl);
            }
            
            .register-title {
                color: var(--text-primary);
                font-weight: 800;
                margin-bottom: 12px;
                font-size: 2.2rem;
            }
            
            .register-subtitle {
                color: var(--text-secondary);
                font-size: 16px;
                font-weight: 500;
                line-height: 1.6;
            }
            
            .register-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .register-button {
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
            
            .register-button:hover {
                background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-purple) 100%);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .register-button:disabled {
                opacity: 0.7;
                transform: none;
            }
            
            .signin-link {
                text-align: center;
                margin-top: 24px;
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .signin-link a {
                color: var(--accent-blue);
                text-decoration: none;
                font-weight: 700;
                transition: var(--transition-fast);
            }
            
            .signin-link a:hover {
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
            
            .custom-textfield .MuiFormHelperText-root {
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .success-message {
                background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(72, 187, 120, 0.05) 100%);
                color: var(--success);
                padding: 32px;
                border-radius: var(--border-radius-lg);
                text-align: center;
                margin-bottom: 24px;
                border: 2px solid rgba(72, 187, 120, 0.2);
                box-shadow: var(--shadow-md);
            }
            
            .success-icon {
                font-size: 4rem;
                color: var(--success);
                margin-bottom: 16px;
            }
            
            .success-title {
                color: var(--success);
                font-weight: 800;
                margin-bottom: 12px;
            }
            
            .success-text {
                color: var(--text-secondary);
                font-weight: 500;
                line-height: 1.6;
            }
            
            .success-link {
                color: var(--accent-blue);
                text-decoration: none;
                font-weight: 700;
                transition: var(--transition-fast);
            }
            
            .success-link:hover {
                color: var(--accent-teal);
                text-decoration: underline;
            }
            
            @media (max-width: 480px) {
                .register-paper {
                    padding: 32px 24px;
                    margin: 16px;
                }
                
                .register-title {
                    font-size: 1.8rem;
                }
            }
        `;

        if (this.state.successful) {
            return (
                <>
                    <style>{registerStyles}</style>
                    <div className="register-container">
                        <Paper className="register-paper" elevation={0}>
                            <div className="success-message">
                                <div className="success-icon">🎉</div>
                                <Typography variant="h4" className="success-title">
                                    Welcome to ShopNow!
                                </Typography>
                                <Typography variant="body1" className="success-text">
                                    Your account has been created successfully. You can now sign in and start shopping.
                                </Typography>
                                <Typography variant="body1" style={{ marginTop: '16px' }}>
                                    <Link to="/login" className="success-link">
                                        Sign In to Your Account →
                                    </Link>
                                </Typography>
                            </div>
                        </Paper>
                    </div>
                </>
            );
        }

        return (
            <>
                <style>{registerStyles}</style>
                <div className="register-container">
                    <Paper className="register-paper" elevation={0}>
                        <div className="register-header">
                            <div className="register-icon">
                                <PersonAdd style={{ color: 'white', fontSize: '2.4rem' }} />
                            </div>
                            <Typography variant="h3" className="register-title">
                                Create Account
                            </Typography>
                            <Typography variant="body1" className="register-subtitle">
                                Join ShopNow and discover amazing products with exclusive deals
                            </Typography>
                        </div>

                        <Form
                            onSubmit={this.handleRegister}
                            ref={(c) => {
                                this.form = c;
                            }}
                            className="register-form"
                        >
                            <TextField
                                fullWidth
                                label="Username"
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
                                helperText="Choose a unique username (3-20 characters)"
                                required
                                size="medium"
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                variant="outlined"
                                value={this.state.email}
                                onChange={this.onChangeEmail}
                                className="custom-textfield"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined style={{ color: 'var(--accent-blue)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="We'll use this for account verification and updates"
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
                                helperText="Create a strong password (6-40 characters)"
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
                                className="register-button"
                                startIcon={this.state.loading && <CircularProgress size={20} color="inherit" />}
                            >
                                {this.state.loading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <CheckButton
                                style={{ display: "none" }}
                                ref={(c) => {
                                    this.checkBtn = c;
                                }}
                            />
                        </Form>

                        <div className="signin-link">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>
                    </Paper>
                </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    const { message } = state.message;
    return {
        message,
    };
}

export default connect(mapStateToProps)(Register);