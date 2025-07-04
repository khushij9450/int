"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SplashScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Initializing AI Systems...",
    "Loading Neural Networks...",
    "Calibrating Interview Protocols...",
    "Preparing Virtual Environment...",
    "Ready for Launch..."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => router.push("/"), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [router]);

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
              <Image src="/logo.svg" alt="PrepWise Logo" width={80} height={68} className="logo-icon" />
            </div>
            <div className="hologram-effect"></div>
          </div>
          
          <h1 className="brand-title">
            <span className="prep">PREP</span>
            <span className="wise">WISE</span>
          </h1>
          
          <p className="brand-subtitle">AI-Powered Interview Intelligence</p>
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
            <div className="progress-percentage">{progress}%</div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;