import os

OAUTH_BASE_URL = "https://dev-7e-rl4t1.eu.auth0.com"
OAUTH_ACCESS_TOKEN_URL = OAUTH_BASE_URL + "/oauth/token"
OAUTH_AUTHORIZE_URL = OAUTH_BASE_URL + "/authorize"
OAUTH_CALLBACK_URL = "https://localhost:8080/callback"
OAUTH_CLIENT_ID = "fbIlZTgv63pFO8AkgMAwcSz43uYu3ND9"
OAUTH_CLIENT_SECRET = os.environ.get("OAUTH_CLIENT_SECRET")
OAUTH_SCOPE = "openid profile"
NICKNAME = "nickname" 