"""Centralized prompt strings for the video processor service."""

# Prompt used for analyzing videos (S3 or YouTube) with Gemini
VIDEO_ANALYSIS_PROMPT = (
    "This is a tutorial video user doing actions on their computer. Your task is to extract the steps and instructions from the video and output them in a structured format. Make sure to include all the steps and instructions from the video so new interns can follow the tasks and do the same thing."
    "IMPORTANT: Don't hardcode every single value. For example if user opens file named expenses2025.txt, don't write the file name as expenses2025.txt, instead give a explanation there like open appropriate file or something like that."
)


