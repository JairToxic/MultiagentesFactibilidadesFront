// components/layout/Sidebar.jsx
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/tickets', icon: '🎫', label: 'Tickets' },
    { path: '/analytics', icon: '📈', label: 'Analíticas' },
    { path: '/settings', icon: '⚙️', label: 'Configuración' },
  ];

  const handleNavigate = (path) => {
    router.push(path);
    onClose?.();
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎫</span>
          <span className={styles.logoText}>Ticket System</span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${
                pathname === item.path ? styles.active : ''
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.version}>v1.0.0</p>
          <p className={styles.copyright}>© 2024 Inova Solutions</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;