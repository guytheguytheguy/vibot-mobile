# Building Vibot Mobile APK

Complete guide to building an installable APK for Android devices.

## Table of Contents

- [Method 1: EAS Build (Recommended)](#method-1-eas-build-recommended)
- [Method 2: Local Build](#method-2-local-build)
- [Method 3: Expo Development Build](#method-3-expo-development-build)
- [Troubleshooting](#troubleshooting)
- [Installing the APK](#installing-the-apk)

---

## Method 1: EAS Build (Recommended)

**Best for:** Most users. Builds in the cloud, no local Android SDK needed.

### Prerequisites

- Expo account (free) - Sign up at https://expo.dev/signup
- Node.js installed
- Project files

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo username/email and password when prompted.

Verify you're logged in:
```bash
eas whoami
```

### Step 3: Configure the Project

The project is already configured! But if needed, you can check `eas.json`:

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

### Step 4: Build the APK

```bash
cd vibot-mobile
eas build --platform android --profile preview
```

**What happens next:**
1. EAS will ask if you want to create a new project (if first time)
2. Choose a project name or use default
3. Build starts on Expo's servers
4. You'll see a build URL to track progress

**Build time:** Usually 10-20 minutes

### Step 5: Download the APK

When the build completes:

**Option A: From terminal**
- The build URL will be shown in terminal
- Click it to download the APK

**Option B: From Expo website**
```bash
eas build:list
```
- Copy the URL and open in browser
- Click "Download" button

**Option C: Direct download**
```bash
# Get the download URL
eas build:list --platform android --profile preview --limit 1

# Or download directly
eas build:download --platform android --profile preview
```

### Step 6: Install on Device

See [Installing the APK](#installing-the-apk) section below.

---

## Method 2: Local Build

**Best for:** Users who want full control or can't use cloud builds.

### Prerequisites

- Android Studio installed
- Android SDK configured
- Java JDK 17 or later
- Environment variables set (ANDROID_HOME, JAVA_HOME)

### Step 1: Check Prerequisites

```bash
# Check Java
java -version
# Should show version 17+

# Check Android SDK
echo $ANDROID_HOME
# Should show path like: /Users/yourname/Library/Android/sdk

# Check Android tools
adb --version
```

### Step 2: Install Android Studio

If not installed:

1. Download from https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
4. Install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools
   - Android Emulator (optional)

### Step 3: Set Environment Variables

**macOS/Linux** - Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

**Windows** - Set in System Environment Variables:
```
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
```

Reload terminal after setting.

### Step 4: Generate Android Native Files

```bash
cd vibot-mobile
npx expo prebuild --platform android
```

This creates the `android/` directory with native code.

### Step 5: Create Signing Keystore

For a release build, you need a signing key:

```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore vibot-release.keystore \
  -alias vibot-key \
  -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (can be same as keystore password)
# - Your name, organization, etc.
```

**Save this information securely!** You'll need it for updates.

### Step 6: Configure Gradle for Signing

Create `android/gradle.properties` (or add to existing):

```properties
VIBOT_UPLOAD_STORE_FILE=../vibot-release.keystore
VIBOT_UPLOAD_KEY_ALIAS=vibot-key
VIBOT_UPLOAD_STORE_PASSWORD=your_keystore_password
VIBOT_UPLOAD_KEY_PASSWORD=your_key_password
```

**⚠️ Security:** Add `gradle.properties` to `.gitignore`!

Edit `android/app/build.gradle` to use the keystore:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('VIBOT_UPLOAD_STORE_FILE')) {
                storeFile file(VIBOT_UPLOAD_STORE_FILE)
                storePassword VIBOT_UPLOAD_STORE_PASSWORD
                keyAlias VIBOT_UPLOAD_KEY_ALIAS
                keyPassword VIBOT_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### Step 7: Build the APK

```bash
cd android
./gradlew assembleRelease
```

**Build time:** 5-15 minutes (first build slower)

### Step 8: Find the APK

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Copy it somewhere easy to access:
```bash
cp android/app/build/outputs/apk/release/app-release.apk ~/vibot-mobile.apk
```

---

## Method 3: Expo Development Build

**Best for:** Development and testing. Includes dev tools.

### Step 1: Build Development APK with EAS

```bash
eas build --platform android --profile development
```

### Step 2: Install on Device

Once downloaded, install the APK on your device.

### Step 3: Start Development Server

```bash
npx expo start --dev-client
```

The app will connect to your development server.

---

## Installing the APK

### On Physical Android Device

#### Method A: USB Cable (ADB)

1. **Enable Developer Options**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back, open Developer Options
   - Enable "USB Debugging"

2. **Connect Device**
   ```bash
   # Connect phone via USB

   # Verify connection
   adb devices

   # Install APK
   adb install vibot-mobile.apk
   ```

#### Method B: Direct Transfer

1. **Transfer APK to Phone**
   - Email it to yourself
   - Use Google Drive / Dropbox
   - Use USB cable (copy to Downloads folder)
   - Use AirDroid / similar app

2. **Install on Phone**
   - Open Files app
   - Navigate to Downloads (or where you saved it)
   - Tap the APK file
   - If prompted, allow "Install from Unknown Sources"
   - Tap "Install"

3. **Allow Unknown Sources** (if needed)
   - Settings → Security
   - Enable "Unknown Sources" or "Install Unknown Apps"
   - Or grant permission when prompted

#### Method C: QR Code

Use a service to share via QR:

1. Upload APK to file hosting (Google Drive, Dropbox, etc.)
2. Get shareable link
3. Create QR code from link
4. Scan QR on phone and download

### On Android Emulator

```bash
# Start emulator
emulator -avd Pixel_5_API_34

# Wait for emulator to boot, then:
adb install vibot-mobile.apk
```

---

## Troubleshooting

### EAS Build Issues

#### "Not logged in"
```bash
eas login
# Or use access token:
export EXPO_TOKEN=your_token_here
eas build --platform android --profile preview
```

#### "Project not configured"
```bash
eas build:configure
```

#### Build fails with "No Android credentials"
```bash
# Let EAS generate credentials automatically
eas credentials
```

#### "Rate limit exceeded"
Wait 1 hour or upgrade to paid plan for more builds.

### Local Build Issues

#### "ANDROID_HOME not set"
```bash
# Find your Android SDK location
# Usually:
# macOS: ~/Library/Android/sdk
# Linux: ~/Android/Sdk
# Windows: C:\Users\YourName\AppData\Local\Android\Sdk

export ANDROID_HOME=/path/to/android/sdk
```

#### "Java version incorrect"
```bash
# Check version
java -version

# Install JDK 17 if needed
# macOS (Homebrew):
brew install openjdk@17

# Linux:
sudo apt install openjdk-17-jdk

# Windows: Download from Oracle or use Chocolatey
choco install openjdk17
```

#### "Gradle build failed"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease

# If still fails, try:
rm -rf android/build android/app/build
./gradlew assembleRelease
```

#### "SDK version not found"
Open Android Studio:
- Tools → SDK Manager
- Install Android 14 (API 34)
- Install Build Tools 34.0.0

#### "Out of memory during build"
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Installation Issues

#### "App not installed"
- **Cause:** APK is corrupted or incompatible
- **Fix:** Re-download or rebuild APK

#### "Parse error"
- **Cause:** APK built for wrong architecture
- **Fix:** Use `buildType: "apk"` not "app-bundle"

#### "Unknown sources blocked"
- **Cause:** Security settings
- **Fix:** Settings → Security → Enable "Unknown Sources"

#### App crashes on launch
1. Check if API keys are set in `.env`
2. Rebuild with correct environment variables
3. Check Android logs:
   ```bash
   adb logcat | grep -i vibot
   ```

---

## Building for Production

### Before Release

1. **Update Version**

   Edit `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.0",
       "android": {
         "versionCode": 1
       }
     }
   }
   ```

2. **Add API Keys to Build**

   In `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_ANTHROPIC_API_KEY": "your-key",
           "EXPO_PUBLIC_OPENAI_API_KEY": "your-key"
         }
       }
     }
   }
   ```

   **⚠️ Security:** Don't commit this file with keys!

3. **Test Thoroughly**
   - Test on multiple devices
   - Test all features
   - Check performance
   - Verify API integrations

### Production Build

```bash
# EAS Build
eas build --platform android --profile production

# Local Build
cd android
./gradlew bundleRelease
```

Production builds create an **AAB** (Android App Bundle) for Play Store, not APK.

### Submitting to Google Play

```bash
# After production build
eas submit --platform android
```

Follow the wizard to upload to Google Play Console.

---

## Build Profiles Comparison

| Profile | Output | Use Case | Size | Dev Tools |
|---------|--------|----------|------|-----------|
| **development** | APK | Development | Larger | Yes |
| **preview** | APK | Testing/Internal | Medium | No |
| **production** | AAB | Play Store | Smallest | No |

---

## Quick Reference Commands

```bash
# EAS Build
eas build -p android --profile preview        # Preview APK
eas build -p android --profile production     # Production AAB
eas build:list                                 # List builds
eas build:download                             # Download latest

# Local Build
npx expo prebuild --platform android          # Generate native code
cd android && ./gradlew assembleRelease       # Build APK
cd android && ./gradlew bundleRelease         # Build AAB

# Installation
adb install app-release.apk                   # Install via USB
adb devices                                    # List connected devices
adb logcat                                     # View logs
```

---

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup)
- [Android Developer Guide](https://developer.android.com/studio/build/building-cmdline)
- [Google Play Console](https://play.google.com/console)

---

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Search [Expo forums](https://forums.expo.dev/)
3. Open an issue on GitHub
4. Check [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

## Security Checklist

Before sharing APK:

- [ ] Remove debug logs
- [ ] API keys in environment variables (not hardcoded)
- [ ] `.env` not committed to git
- [ ] Keystore backed up securely
- [ ] ProGuard/R8 enabled (production)
- [ ] Test on clean device
- [ ] Verify all API integrations work

---

**Happy Building! 🚀**
