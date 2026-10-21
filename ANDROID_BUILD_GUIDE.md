# Build the Monet Expense Tracker APK with GitHub

No Android Studio needed. GitHub builds the APK for you.

## One-time setup
1. Go to https://github.com/new, name the repo (e.g. `monet-expense-tracker`), choose **Private**, click **Create repository**.
2. Unzip this project. On the new repo page click **uploading an existing file**.
3. Drag in **everything inside the folder** (including the hidden `.github` folder, `src`, `public`, `resources`, `package.json`, `capacitor.config.json`, etc.).
   - Do NOT upload `node_modules` or `dist` if they exist.
   - Tip: if the `.github` folder doesn't drag in, use **Add file > Create new file**, type `.github/workflows/build-apk.yml` as the name and paste the file contents.
4. Click **Commit changes**.

## Get the APK
1. Open the **Actions** tab. A run called **Build Android APK** starts by itself (about 5–8 minutes). If not, click it > **Run workflow**.
2. When it shows a green tick, open the run and scroll to **Artifacts**.
3. Download **monet-expense-tracker-apk** (a zip) and unzip it to get `app-debug.apk`.
4. Send the APK to your phone, open it, and allow "Install unknown apps" when asked.

## Updating later
Change files in the repo (or re-upload them) and commit. A new APK builds automatically.

## If the build fails
Open the failed run, click the red step, and copy the last ~30 lines of the log to Claude.

## Google Drive sign-in (one-time setup)
Google's normal pop-up sign-in doesn't work inside an Android app, so the app uses Google's "enter a code" sign-in.
1. Open https://console.cloud.google.com/apis/credentials and select project **gen-lang-client-0041089367**.
2. Make sure the **Google Drive API** is enabled (APIs & Services > Library).
3. **Create credentials > OAuth client ID > Application type: "TVs and Limited Input devices"**. Copy the **Client ID** and **Client secret**.
4. On the **OAuth consent screen**, either add your Google account under *Test users*, or click *Publish app* (Drive "file" access needs no review; publishing also stops sign-in expiring every 7 days).
5. In the app: Drive Sync > Google setup > paste both values > Save > Sign in with Google. Enter the shown code on the Google page that opens.

## Home screen widget
After installing: long-press the home screen > **Widgets** > **Monet Expense**, or open the app's Widget tab and tap **Add to Home Screen**. The widget shows today's and this month's spending in your theme colors; **+ Add expense** opens the app straight to the add-expense form. It refreshes whenever you open the app or change an expense.

## Camera cutouts
The app draws edge-to-edge and pads its header and bottom bar for the status bar, camera cutout and gesture bar.
