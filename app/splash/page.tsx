"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SplashScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [mounted, setMounted] = useState(false);

  const loadingTexts = [
    "Initializing AI Systems...",
    "Loading Neural Networks...",
    "Calibrating Mock Interview Protocols...",
    "Preparing Virtual Environment...",
    "Ready for Launch..."
  ];

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Slower progress to last 4-5 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => router.push("/"), 500);
          return 100;
        }
        return prev + 0.5; // Slower increment for 4-5 second duration
      });
    }, 25);

    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [router, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Animated Background Grid */}
        <div className="grid-background">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="grid-line" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        {/* Main Logo and Branding */}
        <div className="splash-logo-section">
          <div className="logo-container">
            <div className="logo-glow">
              <Image src="/mockmate-logo.svg" alt="MockMate Logo" width={80} height={68} className="logo-icon" />
            </div>
            <div className="hologram-effect"></div>
          </div>
          
          <h1 className="brand-title">
            <span className="prep">MOCK</span>
            <span className="wise">MATE</span>
          </h1>
          
          <p className="brand-subtitle">AI-Powered Mock Interview Intelligence</p>
        </div>

        {/* Robot Animation */}
        <div className="robot-section">
          <div className="robot-container">
            <Image 
              src="/robot.png" 
              alt="AI Robot" 
              width={200} 
              height={200} 
              className="robot-image"
            />
            <div className="robot-glow"></div>
            <div className="scanning-line"></div>
          </div>
        </div>

        {/* Loading Section */}
        <div className="loading-section">
          <div className="loading-text">
            {loadingTexts[currentText]}
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>
        </div>

        {/* Static Particles - Fixed positions to prevent hydration issues */}
        <div className="particles">
          <div className="particle" style={{ left: '10%', animationDelay: '0s', animationDuration: '4s' }} />
          <div className="particle" style={{ left: '20%', animationDelay: '0.5s', animationDuration: '3.5s' }} />
          <div className="particle" style={{ left: '30%', animationDelay: '1s', animationDuration: '4.5s' }} />
          <div className="particle" style={{ left: '40%', animationDelay: '1.5s', animationDuration: '3s' }} />
          <div className="particle" style={{ left: '50%', animationDelay: '2s', animationDuration: '5s' }} />
          <div className="particle" style={{ left: '60%', animationDelay: '2.5s', animationDuration: '3.5s' }} />
          <div className="particle" style={{ left: '70%', animationDelay: '3s', animationDuration: '4s' }} />
          <div className="particle" style={{ left: '80%', animationDelay: '0.3s', animationDuration: '4.5s' }} />
          <div className="particle" style={{ left: '90%', animationDelay: '1.8s', animationDuration: '3s' }} />
          <div className="particle" style={{ left: '15%', animationDelay: '2.2s', animationDuration: '5s' }} />
          <div className="particle" style={{ left: '25%', animationDelay: '0.8s', animationDuration: '3.5s' }} />
          <div className="particle" style={{ left: '35%', animationDelay: '1.3s', animationDuration: '4s' }} />
          <div className="particle" style={{ left: '45%', animationDelay: '2.7s', animationDuration: '4.5s' }} />
          <div className="particle" style={{ left: '55%', animationDelay: '0.2s', animationDuration: '3s' }} />
          <div className="particle" style={{ left: '75%', animationDelay: '1.7s', animationDuration: '5s' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;