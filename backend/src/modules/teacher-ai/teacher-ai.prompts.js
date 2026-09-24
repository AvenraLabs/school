export const PROMPTS = {
  question_paper: ({ subject, classLevel, chapter, marks }) => `
Create a CBSE-style question paper for:

Class: ${classLevel}
Subject: ${subject}
Chapter: ${chapter}
Total Marks: ${marks}

Instructions:
- Follow CBSE exam pattern
- Include a mix of difficulty levels
- DO NOT use or include any emojis in the generated question paper.

Paper structure:
Section A: MCQs  
Section B: Short answer questions  
Section C: Long answer questions  

Clearly mention marks for each question.
`,

  quiz: ({ topic, classLevel }) => `
Create a quiz for:
Class: ${classLevel}
Topic: ${topic}

Rules:
- 10 multiple choice questions
- 4 options per question
- Clearly mark the correct answer
- DO NOT use or include any emojis in the quiz content.
`,

  homework: ({ topic, classLevel, subject }) => `
Create homework for:
Class: ${classLevel}
Subject: ${subject}
Topic: ${topic}

Include:
- 5 theory questions
- 5 application-based questions
- Clear instructions for students
- DO NOT use or include any emojis in the homework assignment.
`,
};
