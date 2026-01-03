---
description: how to build an Android APK for testing
---

To build an APK that you can send to a tester, the easiest way is to use **EAS Build**. Follow these steps:

### 1. Install EAS CLI
If you haven't already, install the EAS CLI globally:
```bash
npm install -g eas-cli
```

### 2. Login to Expo
Login to your Expo account:
```bash
eas login
```

### 3. Configure EAS Build
Initialize the EAS configuration in your project:
```bash
eas build:configure
```
This will create an `eas.json` file in your root directory.

### 4. Update eas.json for APK
Open `eas.json` and ensure you have a profile (e.g., `preview`) configured to build an APK instead of an AAB (App Bundle). Add `buildType: "apk"`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 5. Start the Build
Run the following command to start the build on Expo's servers:
```bash
eas build -p android --profile preview
```

### 6. Download and Share
Once the build is complete, Expo will provide a QR code and a link to download the `.apk` file. You can send this file directly to your tester.

---

> [!NOTE]
> If you prefer to build **locally** (requires Android Studio and Java installed), you can run:
> ```bash
> npx expo run:android --variant release
> ```
> This will generate an APK in `android/app/build/outputs/apk/release/`.
