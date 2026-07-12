hase 5: AI Progress Summary + WhatsApp
Flow:

Teacher enters marks and publishes report card
Backend triggers Gemini with student's analytics data
Gemini generates: "Alice improved 18% in Math since last test. English remains her strongest subject at 92%. Science needs attention - scored 45%, below class average of 62%."
Store the summary in DB (new progress_summaries table)
Send via WhatsApp to parent (using existing WhatsApp integration)
Show in StudentPerformancePage as "AI Insights" card