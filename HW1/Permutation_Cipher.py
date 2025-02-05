def encrypt_permutation(plaintext, m, n):
    # Remove spaces from plaintext
    plaintext = plaintext.replace(" ", "")

    # Print the matrix with rectangles side by side
    # print("\nMatrix with rectangles:")
    for row in range(m):
        line = ""
        for rect_start in range(0, len(plaintext), m * n):
            for col in range(n):
                char_idx = rect_start + row * n + col
                if char_idx < len(plaintext):
                    line += plaintext[char_idx] + " "
        # print(line.rstrip())

    # Encrypt by reading down columns within each rectangle
    ciphertext = ""
    for rect_start in range(0, len(plaintext), m * n):
        for col in range(n):
            for row in range(m):
                char_idx = rect_start + row * n + col
                if char_idx < len(plaintext):
                    ciphertext += plaintext[char_idx]

    return ciphertext


# Example usage
# plaintext = "cryptography is intriguing"
# m, n = 3, 4

# print(f"Plaintext: {plaintext}")
# print(f"Dimensions: {m}x{n}")
# ciphertext = encrypt_permutation(plaintext, m, n)
# print(f"Ciphertext: {ciphertext}")


def decrypt_permutation(ciphertext, m, n):
    # Calculate dimensions
    rectangle_width = n
    num_rows = m
    row_width = len(ciphertext) // num_rows
    rectangles_per_row = row_width // rectangle_width

    # 1. Create initial matrix and fill column-wise
    matrix = []
    for _ in range(num_rows):
        matrix.append([""] * row_width)

    pos = 0
    for col in range(row_width):
        for row in range(num_rows):
            if pos < len(ciphertext):
                matrix[row][col] = ciphertext[pos]
                pos += 1

    # Print character matrix
    print("\nCharacter Matrix:")
    for row in matrix:
        print(" ".join(row))

    # 2. Create rectangles matrix
    rectangles = []
    for rect_row in range(rectangles_per_row):
        rectangle = []
        start_col = rect_row * rectangle_width
        for row in range(num_rows):
            # Join the characters into a single string for each row
            row_string = "".join(matrix[row][start_col : start_col + rectangle_width])
            rectangle.append(row_string)
        rectangles.append(rectangle)

    # 3. Read rectangles top-down, left-to-right to get plaintext
    plaintext = ""
    for rect in rectangles:
        for row in rect:
            plaintext += row

    return plaintext


# Test cases
def test_permutation_cipher():
    # Test case 1: Example from the problem
    plaintext = "cryptographyisintriguing"
    m, n = 3, 4

    print("Test Case 1:")
    print(f"Original plaintext: {plaintext}")
    print(f"Dimensions: {m}x{n}")

    ciphertext = encrypt_permutation(plaintext, m, n)
    print(f"Encrypted: {ciphertext}")

    decrypted = decrypt_permutation(ciphertext, m, n)
    print(f"Decrypted: {decrypted}")
    print(f"Successful decryption: {plaintext == decrypted}\n")


def find_possible_dimensions(ciphertext):
    """
    Find all possible m,n combinations that could have been used to encrypt the text.
    Returns list of (m,n) tuples that produce readable results.
    """
    length = len(ciphertext)
    possible_dims = []

    # Find all factor pairs of the length
    for m in range(2, length):
        if length % m == 0:
            # Calculate total width (n * num_rectangles)
            total_width = length // m
            # Try all possible rectangle widths that evenly divide total_width
            for n in range(2, total_width + 1):
                if total_width % n == 0:
                    # Try decrypting with these dimensions
                    decrypted = decrypt_permutation(ciphertext, m, n)
                    possible_dims.append((m, n, decrypted))

    return possible_dims


def solve_problem_2b():
    ciphertext = "MYAMRARUYIQTENCTORAHROYWDSOYEOUARRGDERNOGW"
    print(f"\nTrying to decrypt: {ciphertext}")
    print(f"Length: {len(ciphertext)}")

    possibilities = find_possible_dimensions(ciphertext)

    print("\nPossible solutions:")
    for m, n, decrypted in possibilities:
        print(f"\nDimensions: {m}x{n}")
        print(f"Decrypted: {decrypted}")


if __name__ == "__main__":
    # test_permutation_cipher()
    solve_problem_2b()
