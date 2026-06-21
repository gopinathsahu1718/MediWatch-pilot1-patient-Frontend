import { apiFetch } from "@/lib/api";
import { SymptomQuestionsResponse, SubmissionPayload, SubmissionResult } from "./types";

export async function fetchSymptomQuestions(): Promise<SymptomQuestionsResponse> {
  return await apiFetch("/api/v1/patient/symptom-questions");
}



export async function submitAnswers(
  payload: SubmissionPayload,
  images?: File[],
): Promise<SubmissionResult> {
  const formData = new FormData();

  formData.append(
    "answers",
    JSON.stringify(payload.answers),
  );

  formData.append(
    "overrideAnswers",
    JSON.stringify(payload.overrideAnswers),
  );

  images?.forEach((image) => {
    formData.append("images", image);
  });

  for (const [k, v] of formData.entries()) {
  console.log(k, v);
}

  return await apiFetch("/api/v1/patient/submit", {
    method: "POST",
    body: formData,
  });
}

