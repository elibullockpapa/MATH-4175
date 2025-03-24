class GCD:
    @staticmethod
    def euclidean(a: int, n: int) -> int:
        if n == 0:
            return a
        return GCD.euclidean(n, a % n)

    @staticmethod
    def extended(a: int, m: int) -> int:
        """
        Computes the multiplicative inverse of a modulo m using the Extended Euclidean Algorithm,
        following the k-values method.

        Returns:
            The modular inverse x such that (a * x) ≡ 1 (mod m).

        Raises:
            ValueError: If the modular inverse does not exist (i.e. gcd(a, m) ≠ 1).
        """
        # Lists to store the quotients and remainders.
        quotients = []
        remainders = [m, a]
        # k_values: These will eventually yield the modular inverse.
        # The starting values are defined as in your example:
        k_values = [0, 1]

        # Run the Euclidean algorithm.
        while remainders[-1] != 0:
            q = remainders[-2] // remainders[-1]
            r = remainders[-2] % remainders[-1]
            quotients.append(q)
            remainders.append(r)

        # The gcd is the second-to-last remainder.
        gcd = remainders[-2]
        if gcd != 1:
            raise ValueError(
                f"Multiplicative inverse does not exist because gcd({a}, {m}) = {gcd}"
            )

        # Compute the sequence of k-values.
        # We already have k_0 and k_1; now compute k_2, k_3, ... up to k_{len(remainders)-2}
        for i in range(2, len(remainders) - 1):
            # Using the recurrence: k_i = k_{i-2} - (quotient_{i-2} * k_{i-1})
            next_k = k_values[i - 2] - quotients[i - 2] * k_values[i - 1]
            k_values.append(next_k)

        # The modular inverse is the last computed k_value modulo m.
        return k_values[-1] % m

    @staticmethod
    def test_gcd():
        print("Testing euclidean GCD:")
        test_cases_gcd = [
            (48, 18),  # Should return 6
            (54, 24),  # Should return 6
            (7, 13),  # Should return 1 (coprime)
            (28, 0),  # Should return 28
        ]

        for a, n in test_cases_gcd:
            result = GCD.euclidean(a, n)
            print(f"gcd({a}, {n}) = {result}")

    @staticmethod
    def test_extended():
        print("\nTesting extended euclidean:")
        test_cases_inverse = [
            # Basic cases
            (3, 7),  # Works: 3 * 5 ≡ 1 mod 7
            (5, 11),  # Works: 5 * 9 ≡ 1 mod 11
            # Error cases - not coprime
            (2, 4),  # Error: gcd(2,4) = 2
            (4, 8),  # Error: gcd(4,8) = 4
            (6, 15),  # Error: gcd(6,15) = 3
            (8, 12),  # Error: gcd(8,12) = 4
            # Large number cases
            (653, 1287719),  # Works: coprime
            # Matrix-related cases (mod 26)
            (7, 26),  # Works
            (15, 26),  # Error: gcd(15,26) ≠ 1
            (3, 26),  # Works
            (5, 26),  # Works
            (17, 26),  # Works
        ]

        for a, n in test_cases_inverse:
            try:
                result = GCD.extended(a, n)
                print(f"Multiplicative inverse of {a} mod {n} = {result}")
                print(f"Verification: {a} * {result} mod {n} = {(a * result) % n}")
            except ValueError as e:
                print(f"For a={a}, n={n}: {str(e)}")

    @staticmethod
    def test_all():
        GCD.test_gcd()
        GCD.test_extended()


class IoC:
    @staticmethod
    def calc_ioc(text: str) -> float:
        """Calculate the Index of Coincidence for a text."""
        # Count frequencies
        N = len(text)
        freqs = {}
        for c in text:
            freqs[c] = freqs.get(c, 0) + 1

        # Calculate IoC
        sum_fi_2 = sum(f * (f - 1) for f in freqs.values())
        ioc = sum_fi_2 / (N * (N - 1))
        return ioc

    @staticmethod
    def friedman_test(
        ciphertext: str, max_key_length: int = 20
    ) -> list[tuple[int, float]]:
        """
        Perform the Friedman test to determine possible Vigenère key lengths.
        Returns list of (key_length, avg_ioc) tuples sorted by avg_ioc in descending order.
        """
        results = []

        # Remove non-alphabetic characters and convert to uppercase
        clean_text = "".join(c.upper() for c in ciphertext if c.isalpha())

        # Try different key lengths
        for key_length in range(1, min(max_key_length + 1, len(clean_text))):
            # Split text into key_length cosets
            cosets = [""] * key_length
            for i, char in enumerate(clean_text):
                cosets[i % key_length] += char

            # Calculate IoC for each coset
            coset_iocs = [IoC.calc_ioc(coset) for coset in cosets]
            avg_ioc = sum(coset_iocs) / len(coset_iocs)

            results.append((key_length, avg_ioc))

        # Sort by IoC in descending order
        return sorted(results, key=lambda x: x[1], reverse=True)

    @staticmethod
    def get_column_frequencies(text: str, key_length: int) -> list[dict[str, float]]:
        """
        Split text into columns based on key length and calculate letter frequencies.
        Returns a list of dictionaries containing the frequencies for each column.
        """
        # Clean the text (remove non-alphabetic chars and convert to uppercase)
        clean_text = "".join(c.upper() for c in text if c.isalpha())

        # Split text into columns
        columns = [""] * key_length
        for i, char in enumerate(clean_text):
            columns[i % key_length] += char

        # Calculate frequencies for each column
        column_freqs = []
        for column in columns:
            # Count occurrences of each letter
            freqs = {}
            total = len(column)
            for char in column:
                freqs[char] = freqs.get(char, 0) + 1

            # Convert counts to percentages
            freq_percentages = {
                char: (count / total) * 100 for char, count in freqs.items()
            }

            # Sort by frequency and get top 5
            sorted_freqs = dict(
                sorted(freq_percentages.items(), key=lambda x: x[1], reverse=True)[:5]
            )

            column_freqs.append(sorted_freqs)

        return column_freqs

    @staticmethod
    def print_column_analysis(ciphertext: str, key_length: int):
        """Print frequency analysis for each column."""
        freqs = IoC.get_column_frequencies(ciphertext, key_length)

        for i, column_freq in enumerate(freqs):
            print(f"\nColumn {i + 1} frequencies:")
            for letter, freq in column_freq.items():
                print(f"{letter}: {freq:.1f}%")

    @staticmethod
    def print_columns(text: str, key_length: int):
        """Print text split into columns."""
        # Clean the text
        clean_text = "".join(c.upper() for c in text if c.isalpha())

        # Split text into columns
        columns = [""] * key_length
        for i, char in enumerate(clean_text):
            columns[i % key_length] += char

        # Print each column
        print("\nText split into columns:")
        for i, column in enumerate(columns):
            print(f"Column {i + 1}: {column}")

    @staticmethod
    def test_ioc():
        # Had to remove the spaces from the input texts
        texts = ["OOKOOKZOOK", "OKKOZKOZZ", "ZOKOZOKOOOK"]

        print("\nTesting Index of Coincidence:")
        for i, text in enumerate(texts, 1):
            ioc = IoC.calc_ioc(text)
            print(f"Text {i}: IoC = {ioc:.3f}")

    @staticmethod
    def test_friedman():
        print("\nTesting Friedman Test:")
        # Example ciphertext from Problem 3
        ciphertext = """
        XKJUROWMLLPXWZNPIMBVBQJCNOWXPCCHHVVFVSLLFVXHAZITYXOHULX
        QOJAXELXZXMYJAQFSTSRULHHUCDSKBXKNJQIDALLPQSLLUHIAQFPBPC
        IDSVCIHWHWEWTHBTXRLJNRSNCIHUVFFUXVOUKJLJSWMAQFVJWJSDYLJ
        OGJXDBOXAJULTUCPZMPLIWMLUBZXVOODYBAFDSKXGQFADSHXNXEHSAR
        UOJAQFPFKNDHSAAFVULLUWTAQFRUPWJRSZXGPFUTJQIYNRXNYNTWMHC
        """

        results = IoC.friedman_test(ciphertext, max_key_length=15)
        print("\nPossible key lengths (sorted by average IoC):")
        for length, avg_ioc in results[:5]:  # Show top 5 results
            print(f"Length {length}: Average IoC = {avg_ioc:.3f}")

    @staticmethod
    def test_column_analysis():
        print("\nTesting Column Analysis:")
        ciphertext = """
        XKJUROWMLLPXWZNPIMBVBQJCNOWXPCCHHVVFVSLLFVXHAZITYXOHULX
        QOJAXELXZXMYJAQFSTSRULHHUCDSKBXKNJQIDALLPQSLLUHIAQFPBPC
        IDSVCIHWHWEWTHBTXRLJNRSNCIHUVFFUXVOUKJLJSWMAQFVJWJSDYLJ
        OGJXDBOXAJULTUCPZMPLIWMLUBZXVOODYBAFDSKXGQFADSHXNXEHSAR
        UOJAQFPFKNDHSAAFVULLUWTAQFRUPWJRSZXGPFUTJQIYNRXNYNTWMHC
        """
        IoC.print_columns(ciphertext, 5)
        IoC.print_column_analysis(ciphertext, 5)

    @staticmethod
    def test_all():
        IoC.test_ioc()
        IoC.test_friedman()
        IoC.test_column_analysis()

    # Add the standard English letter frequencies as percentages.
    ENGLISH_FREQ = {
        "A": 8.167,
        "B": 1.492,
        "C": 2.782,
        "D": 4.253,
        "E": 12.702,
        "F": 2.228,
        "G": 2.015,
        "H": 6.094,
        "I": 6.966,
        "J": 0.153,
        "K": 0.772,
        "L": 4.025,
        "M": 2.406,
        "N": 6.749,
        "O": 7.507,
        "P": 1.929,
        "Q": 0.095,
        "R": 5.987,
        "S": 6.327,
        "T": 9.056,
        "U": 2.758,
        "V": 0.978,
        "W": 2.360,
        "X": 0.150,
        "Y": 1.974,
        "Z": 0.074,
    }

    @staticmethod
    def decrypt_with_shift(text: str, shift: int) -> str:
        """
        Decrypts the given text by shifting each letter backwards by the given shift.
        (Assumes that text consists solely of uppercase letters A-Z.)
        """
        decrypted = ""
        for char in text:
            # For decryption, subtract the shift (modulo 26)
            decoded = (ord(char) - ord("A") - shift) % 26
            decrypted += chr(decoded + ord("A"))
        return decrypted

    @staticmethod
    def chi_square_for_text(text: str) -> float:
        """
        Computes the chi-square statistic for a text based on expected English letter frequencies.
        A lower value indicates that the letter frequency of the text is closer to typical English.
        """
        N = len(text)
        counts = {}
        for c in text:
            counts[c] = counts.get(c, 0) + 1

        chi_sq = 0.0
        for letter, expected_freq in IoC.ENGLISH_FREQ.items():
            # Expected count for this letter in the text
            expected_count = N * (expected_freq / 100)
            observed_count = counts.get(letter, 0)
            chi_sq += ((observed_count - expected_count) ** 2) / expected_count
        return chi_sq

    @staticmethod
    def candidate_shifts_for_column(column: str) -> list[tuple[int, float]]:
        """
        For a given column of ciphertext, try every possible shift (0-25) and compute the corresponding
        chi-square statistic. Returns a list of tuples (shift, chi-square score), sorted by score
        (lowest/best first).
        """
        candidates = []
        for shift in range(26):
            decrypted = IoC.decrypt_with_shift(column, shift)
            score = IoC.chi_square_for_text(decrypted)
            candidates.append((shift, score))
        candidates.sort(key=lambda x: x[1])
        return candidates

    @staticmethod
    def chi_square_vigenere_candidates(
        ciphertext: str,
        key_length: int,
        top_candidates: int = 3,
        top_shifts_per_col: int = 3,
    ) -> list[tuple[str, float]]:
        """
        Given a ciphertext and an assumed key length, this method:

        1. Cleans the text and splits it into columns.
        2. Computes chi-square scores for all 26 shifts for each column.
        3. Keeps only the top_shifts_per_col candidates for each column.
        4. Forms overall key candidates by taking the Cartesian product over the columns.
        5. Returns the top_candidates overall keys with their combined chi-square scores.

        Each key candidate is given as a tuple (key, combined_chi_square_score), where the key is a string
        with one letter per column (A–Z, corresponding to shift 0–25).
        """
        # Clean the ciphertext: keep only letters and convert to uppercase
        clean_text = "".join(c.upper() for c in ciphertext if c.isalpha())
        # Split the text into 'key_length' columns (cosets)
        columns = ["" for _ in range(key_length)]
        for i, char in enumerate(clean_text):
            columns[i % key_length] += char

        # For each column, get the candidate shifts (limited to top_shifts_per_col per column)
        candidates_per_column = []
        for col in columns:
            candidates = IoC.candidate_shifts_for_column(col)[:top_shifts_per_col]
            candidates_per_column.append(candidates)

        # Combine the candidates for each column into overall key candidates.
        overall_candidates = []
        from itertools import product

        for candidate_tuple in product(*candidates_per_column):
            # candidate_tuple is a tuple of (shift, score) for each column
            total_score = sum(item[1] for item in candidate_tuple)
            # The candidate key is built by converting the shift (0->'A', 1->'B', etc.)
            key = "".join(chr(item[0] + ord("A")) for item in candidate_tuple)
            overall_candidates.append((key, total_score))

        overall_candidates.sort(key=lambda x: x[1])
        return overall_candidates[:top_candidates]

    @staticmethod
    def vigenere_decrypt(ciphertext: str, key: str) -> str:
        """Decrypt Vigenère cipher with given key."""
        # Clean the ciphertext
        clean_text = "".join(c.upper() for c in ciphertext if c.isalpha())

        # Convert key to shifts
        key_shifts = [ord(k) - ord("A") for k in key.upper()]
        key_len = len(key_shifts)

        # Decrypt
        decrypted = ""
        for i, char in enumerate(clean_text):
            shift = key_shifts[i % key_len]
            # Subtract shift (for decryption) and wrap around
            dec_char = chr((ord(char) - ord("A") - shift) % 26 + ord("A"))
            decrypted += dec_char

        return decrypted

    @staticmethod
    def test_chi_square_candidates():
        """Test chi-square analysis and show decrypted results for top candidates."""
        ciphertext = """
        XKJUROWMLLPXWZNPIMBVBQJCNOWXPCCHHVVFVSLLFVXHAZITYXOHULX
        QOJAXELXZXMYJAQFSTSRULHHUCDSKBXKNJQIDALLPQSLLUHIAQFPBPC
        IDSVCIHWHWEWTHBTXRLJNRSNCIHUVFFUXVOUKJLJSWMAQFVJWJSDYLJ
        OGJXDBOXAJULTUCPZMPLIWMLUBZXVOODYBAFDSKXGQFADSHXNXEHSAR
        UOJAQFPFKNDHSAAFVULLUWTAQFRUPWJRSZXGPFUTJQIYNRXNYNTWMHC
        """

        # Assume key length is known
        key_length = 5
        candidates = IoC.chi_square_vigenere_candidates(ciphertext, key_length)

        print("\nTop candidate keys and their decryptions:")
        print("-" * 50)
        for key, score in candidates:
            decrypted = IoC.vigenere_decrypt(ciphertext, key)
            print(f"\nKey: {key}")
            print(f"Chi-square score: {score:.2f}")
            print("Decrypted text:")
            # Print in blocks of 50 characters
            for i in range(0, len(decrypted), 50):
                print(decrypted[i : i + 50])
            print("-" * 50)


class Matrix2x2:
    @staticmethod
    def multiply_mod26(A: list[list[int]], B: list[list[int]]) -> list[list[int]]:
        """Multiply two 2x2 matrices and reduce entries modulo 26."""
        result = [[0, 0], [0, 0]]
        for i in range(2):
            for j in range(2):
                sum = 0
                for k in range(2):
                    sum += A[i][k] * B[k][j]
                result[i][j] = sum % 26
        return result

    @staticmethod
    def determinant_mod26(A: list[list[int]]) -> int:
        """Calculate determinant of 2x2 matrix modulo 26."""
        det = (A[0][0] * A[1][1] - A[0][1] * A[1][0]) % 26
        return det

    @staticmethod
    def inverse_mod26(A: list[list[int]]) -> list[list[int]]:
        """Calculate inverse of 2x2 matrix modulo 26."""
        det = Matrix2x2.determinant_mod26(A)

        # Find multiplicative inverse of determinant mod 26
        try:
            det_inv = GCD.extended(det, 26)
        except ValueError as e:
            raise ValueError(f"Matrix is not invertible: {str(e)}")

        # Calculate adjugate matrix
        adj = [[A[1][1], (-A[0][1]) % 26], [(-A[1][0]) % 26, A[0][0]]]

        # Multiply adjugate by determinant inverse
        result = [[0, 0], [0, 0]]
        for i in range(2):
            for j in range(2):
                result[i][j] = (det_inv * adj[i][j]) % 26

        return result

    @staticmethod
    def test_matrix():
        print("\nTesting Matrix Operations:")

        # Test cases from Problem 6
        A = [[2, 5], [1, 16]]  # Matrix (a)
        B = [[3, 17], [2, 5]]  # Matrix (b)

        for matrix, label in [(A, "a"), (B, "b")]:
            print(f"\nMatrix ({label}):")
            try:
                inv = Matrix2x2.inverse_mod26(matrix)
                print(
                    f"Inverse = [[{inv[0][0]}, {inv[0][1]}], [{inv[1][0]}, {inv[1][1]}]]"
                )

                # Verify by multiplying original * inverse
                prod = Matrix2x2.multiply_mod26(matrix, inv)
                print(f"Verification (should be identity matrix):")
                print(f"[[{prod[0][0]}, {prod[0][1]}], [{prod[1][0]}, {prod[1][1]}]]")
            except ValueError as e:
                print(f"Error: {str(e)}")


if __name__ == "__main__":
    # Run individual tests
    # GCD.test_gcd()
    GCD.test_extended()
# GCD.test_all()

# IoC.test_ioc()
# IoC.test_friedman()
# IoC.test_column_analysis()
# IoC.test_all()

# Matrix2x2.test_matrix()

# Example: Run just the column analysis for problem 3
# IoC.test_column_analysis()
# IoC.test_chi_square_candidates()
