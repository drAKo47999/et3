#!/usr/bin/env bash
# Copies the native widget + cutout support into the generated Android project.
set -euo pipefail
PKG_DIR=android/app/src/main/java/com/monet/expensetracker
mkdir -p "$PKG_DIR"
cp android-native/java/*.java "$PKG_DIR/"
cp -r android-native/res/* android/app/src/main/res/

MANIFEST=android/app/src/main/AndroidManifest.xml
if ! grep -q ExpenseWidgetProvider "$MANIFEST"; then
python3 - "$MANIFEST" <<'PY'
import sys
p=sys.argv[1]
s=open(p).read()
rcv='''
        <receiver android:name=".ExpenseWidgetProvider" android:exported="true" android:label="Monet Expense">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/expense_widget_info" />
        </receiver>
    '''
s=s.replace('</application>', rcv+'</application>',1)
open(p,'w').write(s)
PY
fi
echo "Patched Android project."
