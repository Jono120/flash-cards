# import jwt
# import time
# import os

# def generate_apple_client_secret():
#     headers = {
#         "kid": os.getenv("APPLE_KEY_ID"),
#         "alg": "ES256"
#     }
#     payload = {
#         "iss": os.getenv("APPLE_TEAM_ID"),
#         "iat": int(time.time()),
#         "exp": int(time.time()) + 86400*180,  # 6 months
#         "aud": "https://appleid.apple.com",
#         "sub": os.getenv("APPLE_CLIENT_ID")
#     }
#     client_secret = jwt.encode(
#         payload,
#         os.getenv("APPLE_PRIVATE_KEY").replace("\\n", "\n"),
#         algorithm="ES256",
#         headers=headers
#     )
#     return client_secret
