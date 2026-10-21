package com.monet.expensetracker;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Iterator;

@CapacitorPlugin(name = "MonetWidget")
public class MonetWidgetPlugin extends Plugin {
    static final String ACTION_QUICK_ADD = "com.monet.expensetracker.QUICK_ADD";
    static final String PREFS = "monet_widget";

    private boolean pendingQuickAdd = false;
    private JSObject lastInsets = new JSObject();

    @Override
    public void load() {
        Intent launch = getActivity().getIntent();
        if (launch != null && ACTION_QUICK_ADD.equals(launch.getAction())) {
            pendingQuickAdd = true;
        }
        setupWindow();
    }

    /** Draw edge-to-edge, allow display cutouts, and report insets to the web layer. */
    private void setupWindow() {
        final Window window = getActivity().getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
        }
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }

        final View content = getActivity().findViewById(android.R.id.content);
        final float density = getActivity().getResources().getDisplayMetrics().density;
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
            Insets bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            // When the keyboard is open, shrink the web view instead of padding in CSS.
            v.setPadding(0, 0, 0, imeVisible ? ime.bottom : 0);

            JSObject o = new JSObject();
            o.put("top", Math.round(bars.top / density));
            o.put("bottom", imeVisible ? 0 : Math.round(bars.bottom / density));
            o.put("left", Math.round(bars.left / density));
            o.put("right", Math.round(bars.right / density));
            lastInsets = o;
            notifyListeners("insets", o, true);
            return insets;
        });
        ViewCompat.requestApplyInsets(content);
    }

    @PluginMethod
    public void getInsets(PluginCall call) {
        call.resolve(lastInsets);
    }

    @PluginMethod
    public void setBarStyle(PluginCall call) {
        final boolean dark = Boolean.TRUE.equals(call.getBoolean("dark", false));
        getActivity().runOnUiThread(() -> {
            Window w = getActivity().getWindow();
            WindowInsetsControllerCompat c = new WindowInsetsControllerCompat(w, w.getDecorView());
            c.setAppearanceLightStatusBars(!dark);
            c.setAppearanceLightNavigationBars(!dark);
        });
        call.resolve();
    }

    @PluginMethod
    public void updateWidget(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences.Editor ed = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        JSObject data = call.getData();
        Iterator<String> keys = data.keys();
        while (keys.hasNext()) {
            String k = keys.next();
            ed.putString(k, data.optString(k, ""));
        }
        ed.apply();
        ExpenseWidgetProvider.updateAll(ctx);
        call.resolve();
    }

    @PluginMethod
    public void pinWidget(PluginCall call) {
        JSObject res = new JSObject();
        Context ctx = getContext();
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        boolean supported = Build.VERSION.SDK_INT >= 26 && mgr.isRequestPinAppWidgetSupported();
        if (supported) {
            mgr.requestPinAppWidget(new ComponentName(ctx, ExpenseWidgetProvider.class), null, null);
        }
        res.put("supported", supported);
        call.resolve(res);
    }

    @PluginMethod
    public void getLaunchAction(PluginCall call) {
        JSObject res = new JSObject();
        res.put("quickAdd", pendingQuickAdd);
        pendingQuickAdd = false;
        call.resolve(res);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent != null && ACTION_QUICK_ADD.equals(intent.getAction())) {
            notifyListeners("quickAdd", new JSObject());
        }
    }
}
