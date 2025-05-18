import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header({ user, onLogout }) {
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors";
    const activeNavLinkClasses = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800";
    const mobileNavLinkClasses = "block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors";
    const activeMobileNavLinkClasses = "block bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800";

    const commonLinks = (
        <>
            <Link
                to='/dashboard'
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname === '/dashboard' ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Dashboard
            </Link>
            <Link
                to='/requests'
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname.startsWith('/requests') ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Give Support
            </Link>
            <Link
                to='/request' // Assuming a page for user's own requests
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname === '/request' ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Request Help
            </Link>
            <Link
                to='/profile'
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname === '/profile' ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Profile
            </Link>
            {/* <Link
                to='/transactions'
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname === '/transactions' ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Transactions
            </Link> */}
            {/* <Link
                to='/settings'
                className={`${isMobileMenuOpen ? mobileNavLinkClasses : navLinkClasses} ${pathname === '/settings' ? (isMobileMenuOpen ? activeMobileNavLinkClasses : activeNavLinkClasses) : ''}`}
            >
                Settings
            </Link> */}
        </>
    );

    return (
        <header className='sticky top-0 w-full bg-white shadow-md z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo / Home link */}
                    <Link to={user ? '/dashboard' : '/'} className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600'>
                        GoFinanceMe
                    </Link>

                    {/* Desktop Navigation links */}
                    <nav className='hidden md:flex items-center space-x-1 lg:space-x-2'>
                        {!user ? (
                            <>
                                <Link
                                    to='/login'
                                    className={`${navLinkClasses} ${pathname === '/login' ? activeNavLinkClasses : ''}`}
                                >
                                    Log In
                                </Link>
                            </>
                        ) : (
                            <>
                                {commonLinks}
                                <button onClick={onLogout} className={`${navLinkClasses} text-red-600 hover:bg-red-50 hover:text-red-700`}>
                                    Log Out
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */} 
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-40 rounded-b-md" id="mobile-menu">
                    <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {!user ? (
                            <>
                                <Link
                                    to='/login'
                                    className={`${mobileNavLinkClasses} ${pathname === '/login' ? activeMobileNavLinkClasses : ''}`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to='/register'
                                    className={`${mobileNavLinkClasses} ${pathname === '/register' ? activeMobileNavLinkClasses : ''} bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white`}
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                {commonLinks}
                                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className={`${mobileNavLinkClasses} text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left`}>
                                    Log Out
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
