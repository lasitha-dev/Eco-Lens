/**
 * Survey Questions for Onboarding
 * Used to personalize user dashboard experience
 */

export const SURVEY_QUESTIONS = [
  {
    id: 1,
    question: "What type of products are you most interested in?",
    type: "multi-select",
    options: [
      "Electronics",
      "Fashion & Apparel", 
      "Home & Kitchen",
      "Books & Learning",
      "Beauty & Personal Care",
      "Fitness & Wellness",
      "Gaming",
      "Automotive"
    ],
    required: true,
    maxSelections: 5
  },
  {
    id: 2,
    question: "What is your preferred shopping frequency?",
    type: "single-select",
    options: [
      "Daily",
      "Weekly", 
      "Occasionally",
      "Only during sales or deals"
    ],
    required: true
  },
  {
    id: 3,
    question: "What best describes your shopping purpose?",
    type: "single-select",
    options: [
      "Personal use",
      "Gifts for others",
      "Business/resale",
      "Browsing for trends"
    ],
    required: true
  },
  {
    id: 4,
    question: "Which price range do you usually prefer?",
    type: "single-select",
    options: [
      "Budget-friendly",
      "Mid-range",
      "Premium / Luxury"
    ],
    required: true
  },
  {
    id: 5,
    question: "Are you interested in receiving personalized deals or offers?",
    type: "boolean",
    options: ["Yes", "No"],
    required: true
  },
  {
    id: 6,
    question: "Which platforms/devices do you usually use to shop?",
    type: "multi-select",
    options: [
      "Mobile",
      "Desktop", 
      "Tablet",
      "All of the above"
    ],
    required: true,
    maxSelections: 4
  },
  {
    id: 7,
    question: "Would you like to get product suggestions based on trends or your previous activity?",
    type: "single-select",
    options: [
      "Yes, based on trends",
      "Yes, based on my activity",
      "Both",
      "No"
    ],
    required: true
  },
  {
    id: 8,
    question: "Do you prefer eco-friendly or sustainable products?",
    type: "single-select",
    options: [
      "Yes",
      "No preference",
      "Not important to me"
    ],
    required: true
  },
  {
    id: 9,
    question: "Are you interested in new or trending product launches?",
    type: "boolean",
    options: ["Yes", "No"],
    required: true
  },
  {
    id: 10,
    question: "What categories would you like to see on your dashboard first?",
    type: "multi-select",
    options: [
      "Electronics",
      "Fashion",
      "Home & Garden",
      "Food & Beverages",
      "Personal Care",
      "Sports & Outdoors",
      "Books & Stationery",
      "Toys & Games"
    ],
    required: true,
    maxSelections: 6
  }
];

export const SURVEY_CONFIG = {
  totalQuestions: SURVEY_QUESTIONS.length,
  allowSkip: true,
  showProgress: true,
  estimatedTime: "2-3 minutes"
};

export const SURVEY_VALIDATION = {
  minSelections: {
    multiSelect: 1,
    singleSelect: 1
  },
  maxSelections: {
    multiSelect: 5,
    singleSelect: 1
  }
};
