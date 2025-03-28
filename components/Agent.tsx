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
    ERROR = 'ERROR',
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastMessage = messages[messages.length - 1];
    const latestMessage = messages[messages.length - 1]?.content;

    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    useEffect(() => {
        console.log("Agent Component Mounted");
        console.log("Props:", { userName, userId, type, interviewId, questions });

        const onCallStart = () => {
            console.log("Vapi Event: call-start");
            setCallStatus(CallStatus.ACTIVE);
            setError(null);
        };

        const onCallEnd = () => {
            console.log("Vapi Event: call-end");
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: Message) => {
            console.log("Vapi Event: message", message);
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => {
            console.log("Vapi Event: speech-start");
            setIsSpeaking(true);
        };

        const onSpeechEnd = () => {
            console.log("Vapi Event: speech-end");
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.log("Vapi Event: error", error);
            setError(error.message);
            setCallStatus(CallStatus.ERROR);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            console.log("Agent Component Unmounted");
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log("Generating Feedback with messages:", messages);
        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages
        });

        if (success && id) {
            console.log("Feedback generated successfully, redirecting to feedback page:", `/interview/${interviewId}/feedback`);
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log("Error saving feedback, redirecting to home");
            router.push("/");
        }
    };

    useEffect(() => {
        console.log("Call Status Changed:", callStatus);
        console.log("Messages:", messages);
        if (callStatus === CallStatus.FINISHED && !error) {
            if (type === 'generate') {
                console.log("Type is 'generate', redirecting to home");
                router.push('/');
            } else {
                console.log("Type is 'interview', generating feedback");
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, error]);

    const handleCall = async () => {
        console.log("Starting Vapi Call");
        console.log("Questions:", questions);
        setCallStatus(CallStatus.CONNECTING);
        setError(null);
        if (type === 'generate') {
            console.log("Starting Vapi with workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            let formattedQuestions = '';
            if (questions && questions.length > 0) {
                formattedQuestions = questions
                    .map((question) => `- ${question}`)
                    .join("\n");
                console.log("Formatted Questions:", formattedQuestions);
            } else {
                console.log("No questions provided, using empty string");
                formattedQuestions = "No questions provided. Please ask general interview questions.";
            }
            console.log("Starting Vapi with interviewer configuration");
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions
                }
            });
        }
    };

    const handleDisconnect = () => {
        console.log("Disconnecting Vapi Call");
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <>
            {error && (
                <div className="text-red-500 p-4">
                    <p>Error: {error}</p>
                    <button className="btn-primary mt-2" onClick={() => router.push('/')}>
                        Return to Home
                    </button>
                </div>
            )}
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className='avatar'>
                        <Image 
                            src='/ai-avatar.png' 
                            alt="vapi" 
                            width={65} 
                            height={54} 
                            className='object-cover'
                        />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className='card-border'>
                    <div className='card-content'>
                        <Image 
                            src="/user-avatar.png" 
                            alt="user avatar" 
                            width={540} 
                            height={540} 
                            className='rounded-full object-cover size-[120px]'
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 && (
                <div className='transcript-border'>
                    <div className='transcript'>
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== "ACTIVE" && callStatus !== "ERROR" ? (
                    <button className="relative btn-call" onClick={() => handleCall()}>
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75",
                                callStatus !== "CONNECTING" && "hidden"
                            )}
                        />
                        <span className="relative">
                            {callStatus === "INACTIVE" || callStatus === "FINISHED"
                                ? "Call"
                                : ". . ."}
                        </span>
                    </button>
                ) : callStatus === "ACTIVE" ? (
                    <button className="btn-disconnect" onClick={() => handleDisconnect()}>
                        End
                    </button>
                ) : null}
            </div>
        </>
    );
};

export default Agent;