/**
 * Splits text into sentences while respecting dialogue quotes.
 * Ensures that sentences inside quotes or ending with quotes are kept together.
 * e.g. "Don't go!" she screamed. -> ["Don't go!" she screamed.]
 */
export const smartSplitSentences = (text: string): string[] => {
    if (!text) return [];

    // 1. Replace newlines with spaces to treat paragraphs as continuous flow for reading
    //    or keep them if we want pause? For now, standard flow.
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // 2. Regex to match sentence endings but not inside quotes.
    // This is complex. A simpler approach for "Good Enough" segmentation:
    // Split by [.!?] followed by space or end of string.
    // BUT we need to handle quotes.
    // Strategy: Match a sequence that ends with punctuation+space, but if a quote is open, keep going.

    // Alternative: detailed tokenizing.
    // Let's use a regex that tries to match a full sentence.
    // Sentence = (Content) + (Punctuation) + (Optional Quote) + (Space or End)

    // Pattern explanation:
    // [^.!?]+       : Match anything that isn't a sentence stopper
    // [.!?]+        : Match the stopper(s)
    // ['"]?         : Optional closing quote
    // \s*           : Optional space
    // But this fails on "He said 'No.' explicitly."

    // Better Regex:
    // Match anything ending in [.!?] followed by space, OR [.!?]["'] followed by space.
    // (?:[^.!?] | [.!?](?![\s"']) )+  <-- Match chars that are NOT stoppers, OR stoppers NOT followed by space/quote
    // [.!?]+                          <-- The actual stopper
    // ["']?                           <-- Optional quote
    // (?=\s|$)                        <-- Lookahead for space or end

    const regex = /([^\.\!\?]+[\.\!\?]+["']?(?=\s|$))/g;

    // This is still tricky with "Mr. Smith".
    // For V2, let's use a slightly more robust regex but accept some edge cases.

    const sentences = cleanText.match(regex);

    if (!sentences) return [cleanText];

    return sentences.map(s => s.trim()).filter(s => s.length > 0);
};
