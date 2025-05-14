import re

def ExtractFeatures(path, body):
    features = {}
    combined = (str(path) + " " + str(body)).lower()

    patterns = [
        r"<script>",        # Feature 0: XSS detection
        r"select.+from",    # Feature 1: SQL injection
        r"drop\s+table",    # Feature 2: SQL injection
        r"union\s+select",  # Feature 3: SQL injection
        r"insert\s+into",   # Feature 4: SQL injection
        r"or\s+1=1",        # Feature 5: SQL injection
        r"\.\./",          # Feature 6: Path traversal
        r"alert\s*\(",      # Feature 7: XSS detection
        r"--",             # Feature 8: SQL comment
        r"'",              # Feature 9: SQL injection
        r'"',              # Feature 10: Potential injection
        r"\b(admin|root|passwd|password)\b"  # Feature 11: Suspicious keywords
    ]

    # Create dictionary with all 12 features
    for i, pattern in enumerate(patterns):
        match = re.search(pattern, combined)
        features[f'feature_{i}'] = 1 if match else 0

    return features