import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

const ProfilePage = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const interviews = await getInterviewsByUserId(user.id);
  
  // Get feedback for each interview
  const interviewsWithFeedback = await Promise.all(
    interviews.map(async (interview) => {
      const feedback = await getFeedbackByInterviewId({
        interviewId: interview.id,
        userId: user.id
      });
      return { ...interview, feedback };
    })
  );

  const completedInterviews = interviewsWithFeedback.filter(i => i.feedback);
  const averageScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.feedback?.totalScore || 0), 0) / completedInterviews.length)
    : 0;

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            <Image 
              src="/bot-avatar.svg" 
              alt="Bot Avatar" 
              width={120} 
              height={120} 
              className="avatar-image-large"
            />
            <div className="avatar-glow-large"></div>
          </div>
          
          <div className="profile-info-section">
            <h1 className="profile-name-large">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-status">
              <div className="status-dot"></div>
              <span>Neural Profile Active</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{interviews.length}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">{averageScore}</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{completedInterviews.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-number">{interviews.length - completedInterviews.length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className="interview-history">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📊</span>
            Interview History & Performance
          </h2>
          <div className="section-line"></div>
        </div>

        {interviews.length > 0 ? (
          <div className="interview-list">
            {interviewsWithFeedback.map((interview) => (
              <div key={interview.id} className="interview-history-card">
                <div className="interview-card-header">
                  <div className="interview-meta">
                    <h3 className="interview-role">{interview.role} Interview</h3>
                    <p className="interview-date">
                      {dayjs(interview.createdAt).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                  
                  <div className="interview-type-badge">
                    <span>{interview.type}</span>
                  </div>
                </div>

                <div className="interview-card-body">
                  <div className="tech-stack-display">
                    <span className="tech-label">Tech Stack:</span>
                    <div className="tech-tags">
                      {interview.techstack.slice(0, 3).map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                      {interview.techstack.length > 3 && (
                        <span className="tech-tag">+{interview.techstack.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {interview.feedback ? (
                    <div className="feedback-summary">
                      <div className="score-display">
                        <div className="score-circle">
                          <span className="score-number">{interview.feedback.totalScore}</span>
                          <span className="score-max">/100</span>
                        </div>
                        <div className="score-breakdown">
                          <p className="score-label">Overall Performance</p>
                          <div className="category-scores">
                            {interview.feedback.categoryScores.slice(0, 2).map((category, index) => (
                              <span key={index} className="category-score">
                                {category.name}: {category.score}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="feedback-preview">
                        <p className="feedback-text">
                          {interview.feedback.finalAssessment.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="no-feedback">
                      <p>Interview pending completion</p>
                    </div>
                  )}
                </div>

                <div className="interview-card-footer">
                  <Button asChild className="btn-cyber-secondary">
                    <Link href={interview.feedback ? `/interview/${interview.id}/feedback` : `/interview/${interview.id}`}>
                      {interview.feedback ? "View Full Report" : "Continue Interview"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <p className="empty-text">No interview sessions found</p>
            <p className="empty-subtext">Start your first mock interview to see your progress here</p>
            <Button asChild className="btn-cyber-primary">
              <Link href="/interview">Start First Interview</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            Quick Actions
          </h2>
          <div className="section-line"></div>
        </div>
        
        <div className="action-grid">
          <Button asChild className="action-card">
            <Link href="/interview">
              <div className="action-icon">🎯</div>
              <div className="action-content">
                <h3>New Interview</h3>
                <p>Start a fresh mock interview session</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild className="action-card">
            <Link href="/">
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h3>Dashboard</h3>
                <p>View your training overview</p>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;