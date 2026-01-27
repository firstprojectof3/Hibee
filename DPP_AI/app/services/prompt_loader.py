import os

def load_prompt_from_ai_test(relative_path: str) -> str:
    """
    AI_TEST_ROOT 기준으로 프롬프트 파일을 읽어온다.
    예) relative_path="prompts/report_v1.txt"
    """
    root = os.getenv("AI_TEST_ROOT")
    if not root:
        raise RuntimeError("AI_TEST_ROOT environment variable is missing.")

    abs_path = os.path.join(root, relative_path)
    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"Prompt file not found: {abs_path}")

    with open(abs_path, "r", encoding="utf-8") as f:
        return f.read()