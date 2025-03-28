"use server";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewById(id: string): Promise<Interview | null> {
  // Validate id
  if (!id) {
    console.error("getInterviewById: id is undefined or empty");
    return null;
  }

  try {
    const interview = await db.collection("interviews").doc(id).get();

    if (!interview.exists) {
      console.log(`No interview found for id: ${id}`);
      return null;
    }

    return interview.data() as Interview;
  } catch (error) {
    console.error("Error in getInterviewById:", error);
    return null;
  }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[]> {
  const { userId, limit = 20 } = params;

  // Validate userId
  if (!userId) {
    console.error("getLatestInterviews: userId is undefined or empty");
    return [];
  }

  try {
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    if (interviews.empty) {
      console.log(`No latest interviews found for userId: ${userId}`);
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error in getLatestInterviews:", error);
    return [];
  }
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  // Validate userId
  if (!userId) {
    console.error("getInterviewsByUserId: userId is undefined or empty");
    return [];
  }

  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (interviews.empty) {
      console.log(`No interviews found for userId: ${userId}`);
      return [];
    }

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error in getInterviewsByUserId:", error);
    return [];
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  // Validate input parameters
  if (!interviewId || !userId || !transcript) {
    console.error("createFeedback: Missing required parameters", { interviewId, userId, transcript });
    return { success: false };
  }

  try {
    const formattedTranscript = transcript
      .map((sentence: { role: string; content: string }) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
      `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Remove undefined values from the feedback object
    const feedbackData = {
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // Filter out undefined values
    const cleanFeedbackData = Object.fromEntries(
      Object.entries(feedbackData).filter(([_, value]) => value !== undefined)
    );

    const feedback = await db.collection("feedback").add(cleanFeedbackData);

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // Validate input parameters
  if (!interviewId || !userId) {
    console.error("getFeedbackByInterviewId: Missing required parameters", { interviewId, userId });
    return null;
  }

  try {
    const feedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (feedback.empty) {
      console.log(`No feedback found for interviewId: ${interviewId}, userId: ${userId}`);
      return null;
    }

    const feedbackDoc = feedback.docs[0];
    return {
      id: feedbackDoc.id,
      ...feedbackDoc.data(),
    } as Feedback;
  } catch (error) {
    console.error("Error in getFeedbackByInterviewId:", error);
    return null;
  }
}