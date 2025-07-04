"use client";
import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const lastMessage = messages[messages.length-1];
    const latestMessage = messages[messages.length-1]?.content;

    useEffect(() => {
        const onCallStart = () => {
          setCallStatus(CallStatus.ACTIVE);
        };
    
        const onCallEnd = () => {
          setCallStatus(CallStatus.FINISHED);
        };
    
        const onMessage = (message: Message) => {
          if (message.type === "transcript" && message.transcriptType === "final") {
            const newMessage = { role: message.role, content: message.transcript };
            setMessages((prev) => [...prev, newMessage]);
          }
        };
    
        const onSpeechStart = () => {
          setIsSpeaking(true);
        };
    
        const onSpeechEnd = () => {
          setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.log("Error:", error);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
          vapi.off("call-start", onCallStart);
          vapi.off("call-end", onCallEnd);
          vapi.off("message", onMessage);
          vapi.off("speech-start", onSpeechStart);
          vapi.off("speech-end", onSpeechEnd);
          vapi.off("error", onError);
        };
    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages
      })

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    useEffect(() => {
      if(callStatus === CallStatus.FINISHED) {
        if(type === 'generate') {
          router.push('/')
        } else {
          handleGenerateFeedback(messages);
        }
      }
    }, [messages, callStatus, type, userId]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        if(type === 'generate') {
          await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
              username: userName,
              userid: userId,
            },
          });
        } else {
          let formattedQuestions = '';
          if(questions) {
            formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
          }
          await vapi.start(interviewer, {
            variableValues: {
              questions: formattedQuestions
            }
          })
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };
    
    return (
        <>
            <div className='interview-interface'>
                <div className='ai-interviewer-panel'>
                    <div className="panel-header">
                        <div className="status-bar">
                            <div className={cn("status-indicator", {
                                "status-inactive": callStatus === CallStatus.INACTIVE,
                                "status-connecting": callStatus === CallStatus.CONNECTING,
                                "status-active": callStatus === CallStatus.ACTIVE,
                                "status-finished": callStatus === CallStatus.FINISHED
                            })}>
                                <div className="status-dot"></div>
                                <span className="status-text">
                                    {callStatus === CallStatus.INACTIVE && "AI STANDBY"}
                                    {callStatus === CallStatus.CONNECTING && "INITIALIZING"}
                                    {callStatus === CallStatus.ACTIVE && "AI ACTIVE"}
                                    {callStatus === CallStatus.FINISHED && "SESSION COMPLETE"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className='ai-avatar-container'>
                        <div className="avatar-hologram">
                            <Image 
                                src='/ai-avatar.png' 
                                alt="AI Interviewer" 
                                width={120} 
                                height={100} 
                                className='ai-avatar'
                            />
                            {isSpeaking && (
                                <>
                                    <div className='voice-wave wave-1' />
                                    <div className='voice-wave wave-2' />
                                    <div className='voice-wave wave-3' />
                                </>
                            )}
                            <div className="hologram-grid"></div>
                        </div>
                        <h3 className="ai-title">Neural Interview Assistant</h3>
                        <p className="ai-subtitle">Advanced AI Protocol v2.1</p>
                    </div>
                </div>

                <div className='candidate-panel'>
                    <div className="panel-header">
                        <div className="user-info">
                            <div className="user-status">
                                <div className="user-dot"></div>
                                <span>CANDIDATE ONLINE</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className='candidate-avatar-container'>
                        <div className="user-avatar-frame">
                            <Image 
                                src="/user-avatar.png" 
                                alt={userName} 
                                width={120} 
                                height={120} 
                                className='user-avatar'
                            />
                            <div className="avatar-border"></div>
                        </div>
                        <h3 className="user-name">{userName}</h3>
                        <p className="user-role">Interview Candidate</p>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className='transcript-panel'>
                    <div className="transcript-header">
                        <div className="transcript-title">
                            <span className="transcript-icon">📡</span>
                            Live Transcript
                        </div>
                        <div className="transcript-indicator">
                            <div className="recording-dot"></div>
                            <span>RECORDING</span>
                        </div>
                    </div>
                    <div className='transcript-content'>
                        <p key={latestMessage} className={cn('transcript-text', 'animate-fadeIn')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="control-center">
                {callStatus !== "ACTIVE" ? (
                    <button className="cyber-call-btn" onClick={() => handleCall()}>
                        <div className="btn-background"></div>
                        <div className="btn-content">
                            {callStatus === "CONNECTING" && (
                                <div className="loading-spinner">
                                    <div className="spinner-ring"></div>
                                </div>
                            )}
                            <span className="btn-text">
                                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                                    ? "Initialize Protocol"
                                    : "Connecting..."}
                            </span>
                        </div>
                        <div className="btn-glow-effect"></div>
                    </button>
                ) : (
                    <button className="cyber-disconnect-btn" onClick={() => handleDisconnect()}>
                        <div className="btn-background-danger"></div>
                        <div className="btn-content">
                            <span className="btn-text">Terminate Session</span>
                        </div>
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;