import { apiFetch } from "@/lib/api";
import { SymptomQuestionsResponse, SubmissionPayload, SubmissionResult } from "./types";

export async function fetchSymptomQuestions(): Promise<SymptomQuestionsResponse> {
  return await apiFetch("/api/v1/patient/symptom-questions");
}

export async function submitAnswers(
  payload: SubmissionPayload,
): Promise<SubmissionResult> {
  return await apiFetch("/api/v1/patient/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}