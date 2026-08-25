import os
import time
import logging
import httpx
from typing import Optional, List, Tuple
from groq import Groq
from groq.types.chat import ChatCompletion
from groq import RateLimitError, APIError

from app.config import settings

logger = logging.getLogger(__name__)


class GroqServiceError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


_client: Optional[Groq] = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = settings.GROQ_API_KEY
        if not api_key or api_key == "your_groq_api_key":
            raise GroqServiceError("AI_CONFIG_ERROR", "GROQ_API_KEY is not configured.")
        _client = Groq(api_key=api_key)
    return _client


def build_podcast_prompt(document_text: str) -> str:
    return f"""You are an educational podcast script writer.

Use ONLY information contained in the supplied document. Do not introduce external facts, statistics, examples, names, dates, or claims that are not supported by the document.

The document is below. Transform it into a natural, spoken podcast-style explanation for a listener.

Requirements:
- Begin with a brief, engaging introduction that explains the topic clearly.
- Explain the major concepts from the document in natural spoken language.
- Simplify difficult concepts without losing important technical meaning.
- Use logical transitions between sections.
- Preserve all important technical information from the document.
- End with key takeaways and a brief conclusion.
- Write as a conversational host-and-expert dialogue (HOST and EXPERT speakers).
- Do NOT say you are an AI.
- Do NOT refer unnecessarily to "the uploaded PDF" — treat the content as the source material.
- Keep the script engaging but accurate.

Document text:
{document_text}
"""


def split_text_into_chunks(text: str, max_chunk_chars: int = 6000) -> List[str]:
    words = text.split()
    chunks: List[str] = []
    current_chunk: List[str] = []
    current_length = 0

    for word in words:
        word_len = len(word) + 1  # approximate
        if current_length + word_len > max_chunk_chars and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = len(word)
        else:
            current_chunk.append(word)
            current_length += word_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def generate_script_from_text(
    cleaned_text: str,
    model: Optional[str] = None,
) -> str:
    client = get_client()
    selected_model = model or settings.GROQ_MODEL

    prompt = build_podcast_prompt(cleaned_text)
    chunks = split_text_into_chunks(cleaned_text, max_chunk_chars=6000)

    # For very long text: process chunks then combine
    # For MVP simplicity: send full text if small enough; else split and combine
    if len(chunks) == 1:
        return _call_groq(client, selected_model, prompt)

    # Multiple chunks: process each, then combine
    partial_scripts: List[str] = []
    for idx, chunk in enumerate(chunks):
        chunk_prompt = (
            f"{prompt}\n\nThis is chunk {idx + 1} of {len(chunks)}. "
            f"Generate a section of the podcast script based on the chunk below. "
            f"Keep it coherent with the previous sections.\n\nChunk:\n{chunk}"
        )
        partial = _call_groq(client, selected_model, chunk_prompt)
        partial_scripts.append(partial)

    combined = "\n\n".join(partial_scripts)
    # Final pass to smooth transitions
    final_prompt = (
        f"Below are sections of a podcast script generated from a document. "
        f"Combine them into one coherent, engaging podcast script. Maintain the HOST / EXPERT format. "
        f"Improve transitions and ensure no repetition. Do NOT add external facts.\n\n"
        f"Sections:\n{combined}"
    )
    result = _call_groq(client, selected_model, final_prompt)
    return result


def _call_groq(client: Groq, model: str, prompt: str, retries: int = 2) -> str:
    max_retries = retries
    last_exception = None

    for attempt in range(max_retries + 1):
        try:
            logger.info("Groq call attempt %d with model %s", attempt + 1, model)
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert podcast script writer for educational content."},
                    {"role": "user", "content": prompt},
                ],
                model=model,
                temperature=0.7,
                max_tokens=2500,
            )
            content = chat_completion.choices[0].message.content
            if not content or not content.strip():
                raise GroqServiceError("AI_EMPTY_RESPONSE", "The AI service returned an empty response.")
            logger.info("Groq response received (%d chars)", len(content))
            return content
        except RateLimitError as exc:
            last_exception = exc
            logger.warning("Groq rate limit: %s", exc)
            if attempt < max_retries:
                time.sleep(2 ** attempt)
            else:
                break
        except (APIError, httpx.NetworkError, httpx.TimeoutException) as exc:
            last_exception = exc
            logger.warning("Groq temporary error: %s", exc)
            if attempt < max_retries:
                time.sleep(1)
            else:
                break
        except Exception as exc:
            logger.error("Groq unexpected error: %s", type(exc).__name__)
            raise GroqServiceError("AI_UNEXPECTED_ERROR", f"Unexpected error: {exc}")

    # If we get here, retries exhausted for temporary errors
    logger.error("Groq retries exhausted: %s", last_exception)
    if isinstance(last_exception, RateLimitError):
        raise GroqServiceError("AI_RATE_LIMIT", "The AI service is temporarily busy. Please try again.")
    if isinstance(last_exception, (APIError, httpx.NetworkError, httpx.TimeoutException)):
        raise GroqServiceError("AI_NETWORK_ERROR", "Unable to reach the AI service. Please check your connection and try again.")
    raise GroqServiceError("AI_ERROR", "The AI service could not complete the request.")
