export const openaiModels = [
  "gpt-5-chat-latest",
  "gpt-5",
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4o",
  "gpt-4o-mini",
  "o4-mini-2025-04-16",

  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano-2025-04-14",

  "gpt-3.5-turbo-0125",
  "gpt-4o-mini-2024-07-18",
];
export const claudeModels = [
  "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-haiku-20241022",
];

export const geminiModels = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

export const mistralModels = ["mistral-medium-2508", "ministral-3b-2410"];

export const onboardingModel = "gpt-5-mini";

export const preSelectedModels = ["chatgpt", "gemini", "claude", "mistral"];

export const allModels = [
  ...openaiModels,
  ...claudeModels,
  ...mistralModels,
  ...geminiModels,
];

export const modelNoobNames = ["chatgpt", "claude", "mistral", "gemini"];

export const modelNoobNamesToActualModelNames = {
  chatgpt: "gpt-5-mini",
  claude: "claude-sonnet-4-20250514",
  mistral: "mistral-medium-2508",
  gemini: "gemini-2.5-pro",
};

export const modelActualNamesToNoobNames = {
  "gpt-5-mini": "chatgpt",
  "claude-sonnet-4-20250514": "claude",
  "mistral-medium-2508": "mistral",
  "gemini-2.5-pro": "gemini",
};

export const checkIfNoobNameAndThenConvertElseReturnModel = (model: string) => {
  let modelName = model;
  if (modelNoobNames.includes(model)) {
    modelName =
      modelNoobNamesToActualModelNames[
        model as keyof typeof modelNoobNamesToActualModelNames
      ];
  }
  return modelName;
};

export const explicitModelProvider = (model: string) => {
  let modelName = model;
  if (modelNoobNames.includes(model)) {
    modelName =
      modelNoobNamesToActualModelNames[
        model as keyof typeof modelNoobNamesToActualModelNames
      ];
  }
  if (openaiModels.includes(modelName)) {
    return "ChatGPT";
  }
  if (claudeModels.includes(modelName)) {
    return "Claude";
  }
  if (mistralModels.includes(modelName)) {
    return "Mistral";
  }
  if (geminiModels.includes(modelName)) {
    return "Google";
  }
  return "Unknown";
};
