from collections import Counter
import string
import math


def clean_text(text):
    """Remove spaces and convert to uppercase."""
    return "".join(c for c in text.upper() if c.isalpha())


def frequency_analysis(text):
    """Analyze letter frequencies in the text."""
    # Count occurrences of each letter
    freq = Counter(text)
    # Calculate percentages
    total = sum(freq.values())
    freq_percent = {k: (v / total) * 100 for k, v in freq.items()}
    # Sort by frequency
    return dict(sorted(freq_percent.items(), key=lambda x: x[1], reverse=True))


def analyze_common_letters(frequencies, text):
    """Analyze possible matches for the most common letters."""
    # Most common letters in English (in order)
    english_common = ["E", "T", "A", "O", "I", "N"]

    # Get the three most common letters from our text
    most_common = list(frequencies.items())[:3]

    print("\nThree most common letters in ciphertext:")
    for letter, freq in most_common:
        print(f"{letter}: {freq:.2f}%")

    print("\nPossible matches and resulting patterns:")
    cipher_letters = [letter for letter, _ in most_common]

    # Try each combination of English letters for our top 3
    for e1 in english_common:
        for e2 in english_common:
            for e3 in english_common:
                if len({e1, e2, e3}) == 3:  # Ensure no duplicates
                    mapping = dict(zip(cipher_letters, [e1, e2, e3]))
                    print(
                        f"\nIf {cipher_letters[0]} → {e1}, {cipher_letters[1]} → {e2}, {cipher_letters[2]} → {e3}:"
                    )
                    print(
                        f"Frequencies: {cipher_letters[0]}({frequencies[cipher_letters[0]]:.2f}%) = {e1}(12.7%), "
                        + f"{cipher_letters[1]}({frequencies[cipher_letters[1]]:.2f}%) = {e2}(9.1%), "
                        + f"{cipher_letters[2]}({frequencies[cipher_letters[2]]:.2f}%) = {e3}(7.5%)"
                    )

                    # Show partial decoding
                    decoded = ""
                    for c in text:
                        if c in mapping:
                            decoded += mapping[c]
                        else:
                            decoded += "*"
                    print(f"Partial decode: {decoded}")


def analyze_common_words(ciphertext, frequencies):
    """
    Attempts to find substitution mappings that produce common English words in the decoded text.
    For a list of common words (e.g., THE, AND, FOR, THAT, BUT, NOT, ARE, YOU, ALL, THIS, WILL),
    slide over the ciphertext and generate a candidate mapping for each occurrence.
    Additionally, check if the candidate mapping results in more than one common word in the full decode.
    Also, attempt to merge candidate mappings if possible.
    """
    # Extended list of common words (2-5 letter words)
    common_words = [
        "THE",
        "AND",
        "FOR",
        "THAT",
        "BUT",
        "NOT",
        "ARE",
        "YOU",
        "ALL",
        "THIS",
        "WILL",
        "TO",
        "IN",
        "IT",
        "IS",
        "BE",
        "AS",
        "AT",
        "SO",
        "WE",
        "HE",
        "BY",
        "OR",
        "ON",
        "DO",
        "IF",
        "ME",
        "MY",
        "UP",
        "AN",
        "GO",
        "NO",
        "US",
        "AM",
        "WHAT",
        "WHEN",
        "YOUR",
        "FROM",
        "WERE",
        "WITH",
        "THEY",
        "HAVE",
        "HERE",
        "LIKE",
        "THEN",
    ]

    # Expected letter frequencies for typical English text (in percentages)
    expected_freqs = {
        "A": 8.17,
        "B": 1.49,
        "C": 2.78,
        "D": 4.25,
        "E": 12.70,
        "F": 2.23,
        "G": 2.02,
        "H": 6.09,
        "I": 6.97,
        "J": 0.15,
        "K": 0.77,
        "L": 4.03,
        "M": 2.41,
        "N": 6.75,
        "O": 7.51,
        "P": 1.93,
        "Q": 0.10,
        "R": 5.99,
        "S": 6.33,
        "T": 9.06,
        "U": 2.76,
        "V": 0.98,
        "W": 2.36,
        "X": 0.15,
        "Y": 1.97,
        "Z": 0.07,
    }
    sigma = 3.0  # standard deviation for our frequency matching model

    def partial_decode(text, mapping):
        return "".join(mapping.get(c, "*") for c in text)

    # List to hold candidate mappings.
    # Each candidate is a dict with keys: "mapping", "score", "sources" (list of (word, position)),
    # and "found_words" (set of common words found in the decoded message).
    candidates = []
    text_length = len(ciphertext)
    for word in common_words:
        word_len = len(word)
        for i in range(text_length - word_len + 1):
            substr = ciphertext[i : i + word_len]
            mapping_candidate = {}
            valid = True
            # Build a candidate mapping from the ciphertext substring to the common word.
            for j, cipher_char in enumerate(substr):
                plain_char = word[j]
                if cipher_char in mapping_candidate:
                    if mapping_candidate[cipher_char] != plain_char:
                        valid = False
                        break
                else:
                    mapping_candidate[cipher_char] = plain_char
            if not valid:
                continue

            # Compute a probability score based on frequency differences.
            prob_score = 1.0
            for cipher_char, plain_char in mapping_candidate.items():
                obs_freq = frequencies.get(cipher_char, 0)
                exp_freq = expected_freqs.get(
                    plain_char, 5
                )  # default if letter not in dict
                likelihood = math.exp(-((obs_freq - exp_freq) ** 2) / (2 * sigma**2))
                prob_score *= likelihood

            # Decode the full ciphertext with this candidate mapping
            decoded = partial_decode(ciphertext, mapping_candidate)
            # Check which of the common words appear in the decoded text.
            found = {cw for cw in common_words if cw in decoded}
            candidate_info = {
                "mapping": mapping_candidate,
                "score": prob_score,
                "sources": [(word, i)],
                "found_words": found,
            }
            candidates.append(candidate_info)

    # Helper function: merge two mapping candidates if they are compatible.
    def merge_mappings(m1, m2):
        merged = m1.copy()
        for k, v in m2.items():
            if k in merged and merged[k] != v:
                return None
            merged[k] = v
        return merged

    # Filter candidates that (when applied) yield more than one common word.
    valid_candidates = [c for c in candidates if len(c["found_words"]) > 1]

    # Try combining candidate mappings pairwise.
    combined_candidates = []
    n = len(candidates)
    for i in range(n):
        for j in range(i + 1, n):
            merged_mapping = merge_mappings(
                candidates[i]["mapping"], candidates[j]["mapping"]
            )
            if merged_mapping is not None:
                combined_score = candidates[i]["score"] * candidates[j]["score"]
                combined_sources = candidates[i]["sources"] + candidates[j]["sources"]
                decoded = partial_decode(ciphertext, merged_mapping)
                combined_found = {cw for cw in common_words if cw in decoded}
                if len(combined_found) > 1:
                    combined_candidates.append(
                        {
                            "mapping": merged_mapping,
                            "score": combined_score,
                            "sources": combined_sources,
                            "found_words": combined_found,
                        }
                    )

    # Sort candidates by probability score in descending order (higher score is more promising)
    valid_candidates.sort(key=lambda x: x["score"], reverse=True)
    combined_candidates.sort(key=lambda x: x["score"], reverse=True)

    print("\nIndividual candidate mappings producing multiple common words:")
    if valid_candidates:
        for candidate in valid_candidates[:15]:
            decoded = partial_decode(ciphertext, candidate["mapping"])
            print("\nFound mapping from sources:", candidate["sources"])
            print("Probability Score: {:.6f}".format(candidate["score"]))
            print("Common words found in decoded text:", candidate["found_words"])
            print("Partial decode: {}...".format(decoded[:100]))
    else:
        print("No individual candidate mapping resulted in more than one common word.")

    print(
        "\nCombined candidate mappings (merged from pairs) producing multiple common words:"
    )
    if combined_candidates:
        for candidate in combined_candidates[:15]:
            decoded = partial_decode(ciphertext, candidate["mapping"])
            print("\nCombined mapping from sources:", candidate["sources"])
            print("Combined Probability Score: {:.6f}".format(candidate["score"]))
            print("Common words found in decoded text:", candidate["found_words"])
            print("Partial decode: {}...".format(decoded[:100]))
    else:
        print(
            "No combined candidate mappings (from merging) resulted in more than one common word."
        )


def main():
    # The encrypted text (without spaces)
    ciphertext = (
        "AOFKWGOZLPOKLUQKLGDOBGKCLBQGHLIOCPLGDLWGLZZCPGDOGSKONQBPLMFPGHCGHLIOCP"
        + "LGDLWGLZZCPGDOGSKONQBPIOBHLHLOGLB"
    )

    # Clean the text
    clean_ciphertext = clean_text(ciphertext)

    # Get frequency analysis
    frequencies = frequency_analysis(clean_ciphertext)

    # Print results
    print("Letter Frequencies:")
    for letter, freq in frequencies.items():
        print(f"{letter}: {freq:.2f}%")

    # Print some basic statistics
    print(f"\nTotal characters: {len(clean_ciphertext)}")
    print(f"Unique characters: {len(frequencies)}")

    # Analyze common letters (basic frequency mapping strategy)
    analyze_common_letters(frequencies, clean_ciphertext)

    # New strategy: analyze for common words and compute mapping candidate scores with multi-word detection
    analyze_common_words(clean_ciphertext, frequencies)


if __name__ == "__main__":
    main()
