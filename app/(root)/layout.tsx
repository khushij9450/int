import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className="cyber-nav">
        <Link href="/" className="nav-brand">
          <div className="logo-container-nav">
            <div className="logo-glow-nav">
              <Image src="/mockmate-logo.svg" alt="MockMate Logo" width={38} height={32} />
            </div>
          </div>
          <h2 className="brand-text">
            <span className="prep-text">MOCK</span>
            <span className="wise-text">MATE</span>
          </h2>
        </Link>
        
        <div className="nav-actions">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">AI ONLINE</span>
          </div>
          
          {user && (
            <div className="profile-section">
              <div className="user-profile">
                <Image 
                  src="/user-avatar.png" 
                  alt={user.name} 
                  width={32} 
                  height={32} 
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <span className="profile-name">{user.name}</span>
                  <span className="profile-role">Candidate</span>
                </div>
              </div>
            </div>
          )}
          
          <LogoutButton />
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
      
      {/* Ambient Background Effects */}
      <div className="ambient-effects">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>
    </div>
  );
};

export default Layout;