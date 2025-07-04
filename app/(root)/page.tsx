import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    return (
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Access <span className="gradient-text">Denied</span>
            </h1>
            <p className="hero-subtitle">Authentication required to access AI systems</p>
            <Button asChild className="btn-cyber-primary">
              <Link href="/sign-in">Initialize Login Sequence</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to the <span className="gradient-text">Future</span> of Mock Interview Preparation
            </h1>
            <p className="hero-subtitle">
              Advanced AI algorithms analyze your performance and provide real-time feedback
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{userInterviews?.length || 0}</div>
                <div className="stat-label">Sessions Completed</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">AI</div>
                <div className="stat-label">Powered Analysis</div>
              </div>
            </div>
            <Button asChild className="btn-cyber-primary">
              <Link href="/interview">
                <span>Initialize Mock Interview Protocol</span>
                <div className="btn-glow"></div>
              </Link>
            </Button>
          </div>
          
          <div className="hero-visual">
            <div className="robot-showcase">
              <div className="robot-container-hero">
                <Image 
                  src="/robot.png" 
                  alt="AI Mock Interview Assistant" 
                  width={400} 
                  height={400} 
                  className="robot-image-hero"
                />
                <div className="robot-aura"></div>
                <div className="scanning-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">🤖</span>
            Your Training Archives
          </h2>
          <div className="section-line"></div>
        </div>
        
        <div className="interviews-grid">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} currentUserId={user.id} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p className="empty-text">No training sessions detected</p>
              <p className="empty-subtext">Begin your journey to mock interview mastery</p>
            </div>
          )}
        </div>
      </section>

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            Available Training Modules
          </h2>
          <div className="section-line"></div>
        </div>
        
        <div className="interviews-grid">
          {hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} currentUserId={user.id} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔄</div>
              <p className="empty-text">No modules currently available</p>
              <p className="empty-subtext">Check back soon for new training opportunities</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default page;