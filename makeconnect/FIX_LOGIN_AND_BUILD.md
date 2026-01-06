# How to Build APK (Login Issue Fix)

If `eas login` fails to accept your password (common issue with terminals/2FA), use an **Access Token** instead. This bypasses the password prompt entirely.

## Step 1: Get your Token
1. Go to [https://expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).
2. Click **"Create token"**.
3. Name it "Windows Build" and copy the token string (it starts with `oT...` or similar).

## Step 2: Build with Token
Run these commands in your terminal (PowerShell):

1. **Set the token** (replace `your_token_here` with the token you copied):
   ```powershell
   $env:EXPO_TOKEN="your_token_here"
   ```

2. **Run the build**:
   ```powershell
   npx eas-cli build -p android --profile preview
   ```

## Alternative (One-line command)
You can copy-paste this ensuring you put your actual token inside the quotes:
```powershell
$env:EXPO_TOKEN="your_token_here"; npx eas-cli build -p android --profile preview
```

---
**Why this works:** Setting `EXPO_TOKEN` authenticates you immediately without needing the interactive login command.
