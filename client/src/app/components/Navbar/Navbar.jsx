"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image 
            src="/navbar_logo.png" 
            alt="Aqua Alert Logo" 
            width={40} 
            height={40} 
          />
          <span>Aqua Alert</span>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className={styles.hamburger} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Navigation Links */}
        <ul className={isOpen ? `${styles.navLinks} ${styles.navActive}` : styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </div>
    </nav>
  );
}