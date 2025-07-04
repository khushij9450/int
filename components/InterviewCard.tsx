import { getRandomInterviewCover } from '@/lib/utils';
import dayjs from 'dayjs';
import Image from 'next/image';
import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';
import { getFeedbackByInterviewId } from '@/lib/actions/general.action';

interface InterviewCardProps {
    id: string;
    userId: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt: string | Date;
    currentUserId: string;
}

const InterviewCard = async ({ id, userId, role, type, techstack, createdAt, currentUserId }: InterviewCardProps) => {
    const feedback = userId && id && userId === currentUserId ? await getFeedbackByInterviewId({ interviewId: id, userId }) : null;
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');

    return (
        <div className='cyber-card'>
            <div className='card-glow'></div>
            <div className='card-content-cyber'>
                <div className="card-header">
                    <div className='type-badge'>
                        <div className="badge-glow"></div>
                        <span className='badge-text'>{normalizedType}</span>
                    </div>
                    
                    <div className="avatar-section">
                        <div className="avatar-container">
                            <Image 
                                src={getRandomInterviewCover()} 
                                alt='Interview Avatar' 
                                width={80} 
                                height={80} 
                                className='avatar-image'
                            />
                            <div className="avatar-ring"></div>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <h3 className='interview-title'>
                        {role} <span className="title-accent">Protocol</span>
                    </h3>
                    
                    <div className='metrics-row'>
                        <div className='metric-item'>
                            <div className="metric-icon">
                                <Image src='/calendar.svg' alt='Date' width={18} height={18}/>
                            </div>
                            <span className="metric-value">{formattedDate}</span>
                        </div>
                        
                        <div className='metric-item'>
                            <div className="metric-icon">
                                <Image src='/star.svg' alt='Score' width={18} height={18}/>
                            </div>
                            <span className="metric-value">
                                {feedback?.totalScore || '---'}<span className="metric-unit">/100</span>
                            </span>
                        </div>
                    </div>
                    
                    <p className='assessment-preview'>
                        {feedback?.finalAssessment || 'Awaiting neural analysis. Initialize training sequence to unlock AI insights.'}
                    </p>
                </div>

                <div className='card-footer'>
                    <div className="tech-stack">
                        <DisplayTechIcons techStack={techstack}/>
                    </div>
                    
                    <Button asChild className='btn-cyber-secondary'>
                        <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
                            <span>{feedback ? 'View Analysis' : 'Start Protocol'}</span>
                            <div className="btn-arrow">→</div>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;