import hashlib
import hmac
import secrets
import re
from typing import List, Tuple

def hash_password(password: str) -> str:
    """
    Hashes a password using standard Python hashlib.scrypt with a 16-byte cryptographically secure salt.
    Format: scrypt$16384$8$1$<salt_hex>$<hash_hex>
    """
    salt = secrets.token_bytes(16)
    n = 16384
    r = 8
    p = 1
    key = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=n, r=r, p=p, maxmem=0, dklen=64)
    return f"scrypt${n}${r}${p}${salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against an scrypt hash string in constant time.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 6 or parts[0] != "scrypt":
            return False
        n = int(parts[1])
        r = int(parts[2])
        p = int(parts[3])
        salt = bytes.fromhex(parts[4])
        expected_key = bytes.fromhex(parts[5])
        
        derived_key = hashlib.scrypt(
            plain_password.encode("utf-8"),
            salt=salt,
            n=n,
            r=r,
            p=p,
            maxmem=0,
            dklen=len(expected_key)
        )
        return hmac.compare_digest(derived_key, expected_key)
    except Exception:
        return False

def generate_otp(length: int = 6) -> str:
    """
    Generates a cryptographically random numeric OTP code (e.g. 6 digits).
    """
    # Generate random number between 0 and 10^length - 1
    max_val = 10 ** length
    num = secrets.randbelow(max_val)
    return f"{num:0{length}d}"

def hash_token(token: str) -> str:
    """
    Hashes a sensitive token, verification code, or recovery code using SHA-256 for persistent database storage.
    """
    return hashlib.sha256(token.strip().encode("utf-8")).hexdigest()

def generate_session_token() -> str:
    """
    Generates a high-entropy URL-safe session token.
    """
    return secrets.token_urlsafe(32)

def generate_recovery_codes(count: int = 8) -> List[str]:
    """
    Generates human-readable, high-entropy recovery codes (e.g. '8F2K-9X1M-4P7Q').
    """
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ" # Avoid ambiguous 0/O, 1/I
    codes = []
    for _ in range(count):
        part1 = "".join(secrets.choice(alphabet) for _ in range(4))
        part2 = "".join(secrets.choice(alphabet) for _ in range(4))
        part3 = "".join(secrets.choice(alphabet) for _ in range(4))
        codes.append(f"{part1}-{part2}-{part3}")
    return codes

def compute_device_fingerprint(user_agent: str, client_ip: str) -> str:
    """
    Generates a normalized hash of device identification signals.
    """
    normalized_ua = (user_agent or "").strip().lower()
    raw = f"{normalized_ua}|{client_ip or ''}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def parse_device_name(user_agent: str) -> str:
    """
    Derives a friendly device name from a User-Agent header (e.g., 'Chrome on macOS').
    """
    ua = (user_agent or "").lower()
    
    # Browser
    browser = "Browser"
    if "firefox" in ua:
        browser = "Firefox"
    elif "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua:
        browser = "Chrome"
    elif "safari" in ua:
        browser = "Safari"
    elif "curl" in ua or "python" in ua or "http" in ua:
        browser = "API Client"

    # OS
    os_name = "Unknown OS"
    if "macintosh" in ua or "mac os" in ua:
        os_name = "macOS"
    elif "windows" in ua:
        os_name = "Windows"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua:
        os_name = "iOS"
    elif "linux" in ua:
        os_name = "Linux"

    return f"{browser} on {os_name}"

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validates password strength: at least 8 characters, containing uppercase, lowercase, and numbers.
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    return True, ""
