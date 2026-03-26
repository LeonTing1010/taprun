---
name: appstore-review
description: "Checks an iOS/iPadOS/macOS app project against Apple's App Store Review Guidelines before submission. Works with native (Swift/Obj-C), Flutter, React Native, Expo, Kotlin Multiplatform, .NET MAUI, Cordova, Ionic, and Unity projects. Use when the user wants to verify their app complies with App Store rules, or when they mention 'app review', 'app store guidelines', 'submission check', or 'review rejection'."
argument-hint: '[path-to-project]'
allowed-tools: Read, Grep, Glob, Bash, Agent
context: fork
agent: general-purpose
---

# App Store Review Guidelines Checker

You are an expert App Store Review compliance auditor. Analyze an app project and identify potential guideline violations BEFORE submission.

**Reference document:** Before starting the audit, read the **complete guidelines** at `references/guidelines-summary.md` (relative to this skill file). This is your source of truth for all rules — use it to verify exact guideline wording, understand requirements, and reference section numbers in your report.

> **Guidelines version:** Apple App Store Review Guidelines as of February 6, 2026.

## Supported Frameworks

| Framework             | Detection Markers                                            |
| --------------------- | ------------------------------------------------------------ |
| **Native Swift/ObjC** | `.xcodeproj`, `.swift` files, `AppDelegate.swift`            |
| **Flutter**           | `pubspec.yaml`, `lib/main.dart`, `ios/Runner/`               |
| **React Native**      | `package.json` with `react-native`, `ios/` directory         |
| **Expo**              | `app.json` or `app.config.js` with `expo`, `eas.json`        |
| **KMP**               | `build.gradle.kts` with `kotlin("multiplatform")`, `iosApp/` |
| **.NET MAUI**         | `.csproj` with `Microsoft.Maui`, `Platforms/iOS/`            |
| **Cordova/Ionic**     | `config.xml`, `ionic.config.json`, `platforms/ios/`          |
| **Capacitor**         | `capacitor.config.ts/json`, `ios/App/`                       |
| **Unity**             | `ProjectSettings/`, `.unity` files, Xcode export             |

## Instructions

Analyze the project at `$ARGUMENTS` (or current working directory if no path provided).

## Prioritization

1. **Must complete (critical rejection risks):** Steps 0-1, then: Sign in with Apple (4.8), Account Deletion (5.1.1v), Privacy Manifest (5.1.1), IAP compliance (3.1), Usage Descriptions (2.3)
2. **Should complete:** Remaining items in Steps 2-7
3. **If time allows:** Best-practice recommendations

If running low on turns, skip Step 7 (overlaps with Steps 2-6). Always produce the final report; note any skipped sections.

## Audit Steps

### Step 0: Detect Project Type & Framework

Identify the framework from the detection markers table above. Adapt all subsequent checks to that framework's file structure.

### Step 1: Project Discovery

Find iOS-relevant config files:

1. Locate `Info.plist` (path varies by framework)
2. Find `PrivacyInfo.xcprivacy`
3. Locate `.entitlements` files
4. Find `.xcodeproj` or `.xcworkspace`

**Framework-specific config locations:**

| Framework         | Key Config Files                                                                    |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Native**        | `Info.plist`, `.entitlements`, `Podfile`, `Package.swift`                           |
| **Flutter**       | `pubspec.yaml`, `ios/Runner/Info.plist`, `ios/Podfile`, `ios/Runner/*.entitlements` |
| **React Native**  | `package.json`, `ios/*/Info.plist`, `ios/Podfile`, `ios/*/*.entitlements`           |
| **Expo**          | `app.json`/`app.config.js`, `eas.json`, `package.json`                              |
| **KMP**           | `iosApp/iosApp/Info.plist`, `build.gradle.kts`, `iosApp/*.entitlements`             |
| **MAUI**          | `Platforms/iOS/Info.plist`, `*.csproj`, `Entitlements.plist`                        |
| **Cordova/Ionic** | `config.xml`, `platforms/ios/*/Info.plist`                                          |
| **Capacitor**     | `capacitor.config.ts`, `ios/App/App/Info.plist`                                     |
| **Unity**         | Xcode export `Info.plist`, `ProjectSettings/ProjectSettings.asset`                  |

**Expo special handling:**

- Managed workflow may have no `ios/` folder — config is in `app.json` / `app.config.js`
- Check `expo.ios.infoPlist` for permission descriptions
- Check `expo.ios.bundleIdentifier`, `expo.ios.config`
- Check `expo.plugins` — many inject permissions/entitlements at build time (e.g., `expo-camera` auto-adds `NSCameraUsageDescription`). Read each plugin's config
- Check `eas.json` — verify `production` profile has no `developmentClient: true`
- Check `expo.ios.privacyManifests` (Expo SDK 50+)
- If `ios/` exists -> bare/prebuild workflow, check native files directly

**Flutter:** Permissions in `ios/Runner/Info.plist` AND via `permission_handler` in `pubspec.yaml`. Check `project.pbxproj` for deployment target.

**React Native:** Check both `ios/` structure and `package.json`. Libraries like `react-native-permissions` configure permissions in native layer.

### Step 2: Safety Checks (Section 1)

**Guideline 1.1 — Objectionable Content (1.1.1-1.1.7):**

- Scan user-facing strings for offensive content
- **(1.1.6)** Scan for fake location tracker code, prank call/SMS libraries
- **(1.1.7)** Scan strings for references capitalizing on disasters, epidemics, conflicts

**Guideline 1.2 — User-Generated Content:**

- Detect UGC features (chat, comments, posts)
- If UGC exists, verify: content filtering, report/flag mechanism, block user, contact info in-app
- **(1.2.1a)** If creator content platform, verify age-gating mechanism

**Guideline 1.3 — Kids Category:**

- If app targets kids, verify NO third-party analytics/ad SDKs

**Guideline 1.4 — Physical Harm (1.4.1-1.4.5):**

- Detect health/medical features
- **(1.4.1)** If medical app, verify disclaimers exist and methodology is disclosed

**Guideline 1.5 — Developer Information:**

- Search for "support", "contact", "help" screens or links in code

**Guideline 1.6 — Data Security:**

- Check `NSAppTransportSecurity` in Info.plist — flag `NSAllowsArbitraryLoads: YES`
- Scan for hardcoded: `apiKey`, `secret`, `password`, `token`, `API_KEY`, `Bearer`
- Check `.env` files in repo (should be in `.gitignore`)
- Verify sensitive data uses secure storage (Keychain, not AsyncStorage/UserDefaults)

### Step 3: Performance Checks (Section 2)

**Guideline 2.1 + 2.2 — App Completeness & Beta Testing:**

- Search for "beta", "trial", "demo version" in user-facing strings
- Scan for `TODO`, `FIXME`, `HACK`, placeholder text, debug code, localhost URLs

**Guideline 2.3 — Accurate Metadata:**

- Verify required keys in Info.plist / `app.json`
- **(2.3.7)** Verify app display name <= 30 characters
- **(2.3.10)** Scan for "Android", "Google Play", "Play Store" in code/strings/assets
- Verify all `NS*UsageDescription` keys exist for used permissions
- Cross-check: permission-requiring package in deps -> corresponding description must exist

**Guideline 2.4 — Hardware Compatibility:**

- Check `UIDeviceFamily` — verify iPad support
- Scan for hardcoded screen sizes
- **(2.4.2)** Scan for crypto mining code

**Guideline 2.5 — Software Requirements:**

- **(2.5.2)** Scan for dynamic code loading: `dlopen`, eval of remote scripts, CodePush
- **(2.5.4)** Cross-check `UIBackgroundModes` against actual code usage
- **(2.5.5)** Verify no hardcoded IPv4 addresses — must work on IPv6-only networks

### Step 4: Business Checks (Section 3)

**Guideline 3.1 — Payments / In-App Purchase:**

- Detect IAP SDK usage
- Flag non-IAP payment for DIGITAL goods (Stripe/PayPal for digital content = violation)
- **(3.1.3e)** Physical goods/services outside app -> MUST use external payment

**Guideline 3.1.2 — Subscriptions & Restore Purchases (Common Rejection):**

- Verify **Restore Purchases** exists
- **(3.1.2c)** Verify terms (price, period, renewal, cancel) displayed BEFORE purchase button
- Verify free trial terms clearly stated if offered

**Guideline 3.1.5 — Cryptocurrencies:**

- Detect crypto packages; flag wallet/exchange/mining

**Guideline 3.2 — Other Business Model Issues:**

- Detect review prompts; flag custom review dialogs bypassing system API
- Scan for incentivized review patterns

### Step 5: Design Checks (Section 4)

**Guideline 4.2 — Minimum Functionality (4.2.1-4.2.7):**

- Detect web-wrapper apps (single WebView)
- **(4.2.6)** Scan for template service markers

**Guideline 4.4 — Extensions:**

- Check keyboard/Safari extension compliance

**Guideline 4.7 — Mini Apps / Emulators:**

- Detect code execution, JS injection patterns

**Guideline 4.8 — Login Services (CRITICAL):**

- Detect third-party login (Google, Facebook, Twitter, OAuth)
- **If ANY third-party login -> verify Sign in with Apple exists**
- Exceptions: company-only login, education/enterprise SSO, government ID

**Guideline 4.10 — Monetizing Built-In Capabilities:**

- No paywalls around native device features (camera, push, gyroscope)

### Step 6: Privacy & Legal Checks (Section 5)

**Guideline 5.1.1 — Data Collection & Storage:**

- Check `PrivacyInfo.xcprivacy` existence and completeness
- Verify privacy manifest declares required API types and reasons
- **(5.1.1i)** Search for privacy policy URL in code/config

**Guideline 5.1.1(v) — Account Deletion (CRITICAL):**

- If account creation exists -> account deletion MUST exist
- Search for "delete account", "remove account" in code/strings

**Guideline 5.1.2 — Data Use and Sharing:**

- Detect tracking/ad SDKs
- If found -> verify AppTrackingTransparency used, `NSUserTrackingUsageDescription` exists

**Guideline 5.1.5 — Location Services:**

- Detect location usage, verify purpose strings

**Guideline 5.2 — Intellectual Property:**

- Scan for copyrighted assets, third-party API TOS compliance

**Guideline 5.3 — Gaming, Gambling, and Lotteries:**

- Scan for gambling-related content; flag licensing requirements

**Guideline 5.6 — Developer Code of Conduct:**

- Scan for dark patterns: hidden cancel buttons, misleading free trial UI

### Step 7: Common Rejection Quick-Check

1. **Crashes** — force unwraps, unhandled rejections
2. **Broken Links** — hardcoded URLs, verify HTTPS
3. **Incomplete Config** — required Info.plist / app.json keys
4. **Missing Privacy Descriptions** — all `NS*UsageDescription` for used permissions
5. **No Privacy Policy URL**
6. **Debug Code** — `console.log`, staging URLs, localhost
7. **Hardcoded Credentials** — API keys, tokens, `.env` files
8. **Missing Sign in with Apple** — when third-party login exists
9. **Missing Account Deletion** — when account creation exists
10. **Missing Privacy Manifest** — `PrivacyInfo.xcprivacy`

## Output Format

```
# App Store Review Compliance Report

## Project Summary
- **App Name:** [name]
- **Bundle ID:** [id]
- **Framework:** [detected framework]
- **Deployment Target:** [version]
- **Platforms:** [iOS/iPadOS/macOS]

## Critical Issues (Will Likely Cause Rejection)

### [CRITICAL] Guideline X.X.X — [Title]
**Issue:** [Description]
**Location:** [File:Line]
**Fix:** [Framework-specific fix]

## Warnings (May Cause Rejection)

### [WARNING] Guideline X.X.X — [Title]
**Issue:** [Description]
**Location:** [File:Line]
**Fix:** [Recommended fix]

## Recommendations (Best Practices)

### [INFO] Guideline X.X.X — [Title]
**Suggestion:** [Description]

## Checklist Summary
- [ ] Project type & framework detected
- [ ] Info.plist / app.json metadata complete
- [ ] App display name <= 30 characters
- [ ] No references to other mobile platforms
- [ ] All NS*UsageDescription keys present
- [ ] No hardcoded secrets or API keys
- [ ] App Transport Security configured
- [ ] Privacy manifest present and complete
- [ ] Privacy policy URL in app
- [ ] Data minimization — pickers over full access
- [ ] Sign in with Apple (if third-party login)
- [ ] Account deletion (if account creation)
- [ ] IAP for digital goods
- [ ] Restore Purchases exists (if IAP/subscriptions)
- [ ] Subscription terms before purchase
- [ ] No debug/test code in production
- [ ] No placeholder/TODO content
- [ ] No beta/trial/demo labels
- [ ] No dynamic code loading / hot-patching
- [ ] Background modes match actual usage
- [ ] No ads in extensions/widgets/App Clips
- [ ] ATT implemented (if tracking/ad SDKs)
- [ ] UGC moderation (if UGC exists)
- [ ] Support URL accessible in-app
- [ ] No on-device crypto mining
- [ ] No dark patterns in purchase flows
- [ ] No illegal media downloading

## Final Verdict
READY / NEEDS FIXES / HIGH RISK — with summary
```

## Important Notes

- Be thorough but avoid false positives
- Always reference the specific guideline number
- Provide framework-specific fix suggestions
- If something cannot be determined from code, note as "Manual Check Required"
- Consider app context — a medical app has different requirements than a game
- For cross-platform projects, check BOTH shared code AND iOS native layer
