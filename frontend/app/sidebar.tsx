'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, NotepadText, Settings, ChevronLeft, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface SidebarProps {
  children: React.ReactNode;
}

export default function CollapsibleSidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: NotepadText,
      label: 'AI Chat',
      href: '/chat',
    },
    {
      icon: NotepadText,
      label: 'Generate Quiz',
      href: '/quiz',
    },
    {
      icon: NotepadText,
      label: 'Quiz History',
      href: '/history',
    },
    // {
    //   icon: Settings,
    //   label: 'Settings',
    //   href: '/settings',
    // },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sidebar-layout">
      <style jsx global>{`
        .sidebar-layout {
          display: flex;
          min-height: 100vh;
          background-color: #1a1a1a;
        }

        .sidebar {
          background-color: #1f1f1f;
          border-right: 1px solid #2a2a2a;
          transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sidebar.expanded {
          width: 240px;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          padding: 1.25rem 1rem;
          gap: 0.75rem;
          border-bottom: 1px solid #2a2a2a;
          min-height: 72px;
        }

        .sidebar.collapsed .sidebar-header {
          justify-content: center;
          padding: 1.25rem 0.5rem;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: opacity 300ms ease;
          flex: 1;
        }

        .sidebar.collapsed .sidebar-logo {
          display: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 200ms ease;
        }

        .collapse-toggle {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: all 300ms ease;
          flex-shrink: 0;
        }

        .collapse-toggle:hover {
          background-color: #2a2a2a;
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.5rem;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          width: 100%;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #d1d5db;
          text-decoration: none;
          border-radius: 0.75rem;
          transition: all 300ms ease;
          font-size: 0.9375rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 0.75rem;
        }

        .nav-link:hover {
          background-color: #2a2a2a;
          color: white;
        }

        .nav-link.active {
          background-color: #374151;
          color: white;
        }

        .nav-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .nav-label {
          opacity: 1;
          transition: opacity 200ms ease;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #2a2a2a;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          color: #d1d5db;
          background: transparent;
          border: none;
          border-radius: 0.75rem;
          transition: all 300ms ease;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
        }

        .sidebar.collapsed .logout-button {
          justify-content: center;
          padding: 0.75rem;
        }

        .logout-button:hover {
          background-color: #2a2a2a;
          color: white;
        }

        .logout-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .logout-label {
          opacity: 1;
          transition: opacity 200ms ease;
        }

        .sidebar.collapsed .logout-label {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          transition: margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 0;
        }

        @media (max-width: 768px) {
          .sidebar.expanded {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
          }

          .sidebar.collapsed {
            width: 0;
            border: none;
          }
        }
      `}</style>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            <div className="logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="logo-text">Memora AI</span>
          </Link>
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="logout-icon" size={20} />
            <span className="logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}