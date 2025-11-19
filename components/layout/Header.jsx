// components/layout/Header.jsx
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import Button from '../common/Button';

const Header = ({ onMenuClick, title = 'Dashboard' }) => {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        {session?.user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{session.user.name}</p>
              <p className={styles.userEmail}>{session.user.email}</p>
            </div>
            <div className={styles.avatar}>
              {session.user.name?.charAt(0) || 'U'}
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={() => signOut()}
              icon="🚪"
            >
              Salir
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;