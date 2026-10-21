package com.monet.expensetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class ExpenseWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            mgr.updateAppWidget(id, build(context));
        }
    }

    static void updateAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, ExpenseWidgetProvider.class));
        for (int id : ids) {
            mgr.updateAppWidget(id, build(context));
        }
    }

    private static int color(SharedPreferences p, String key, String fallback) {
        try {
            return Color.parseColor(p.getString(key, fallback));
        } catch (Exception e) {
            return Color.parseColor(fallback);
        }
    }

    private static RemoteViews build(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(MonetWidgetPlugin.PREFS, Context.MODE_PRIVATE);
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.widget_expense);

        int surface = color(p, "surface", "#F1F1E9");
        int primary = color(p, "primary", "#386A20");
        int onPrimary = color(p, "onPrimary", "#FFFFFF");
        int onSurface = color(p, "onSurface", "#1A1C18");
        int onSurfaceVariant = color(p, "onSurfaceVariant", "#44483E");

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        boolean fresh = today.equals(p.getString("date", ""));
        String todayText = fresh ? p.getString("todayText", "0") : p.getString("zeroText", "0");
        String monthText = p.getString("monthText", "0");

        rv.setInt(R.id.widget_bg, "setColorFilter", surface);
        rv.setInt(R.id.widget_pill, "setColorFilter", primary);
        rv.setTextColor(R.id.widget_title, onSurfaceVariant);
        rv.setTextColor(R.id.widget_today, onSurface);
        rv.setTextColor(R.id.widget_sub, onSurfaceVariant);
        rv.setTextColor(R.id.widget_add_text, onPrimary);
        rv.setTextViewText(R.id.widget_today, todayText);
        rv.setTextViewText(R.id.widget_sub, "This month  " + monthText);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;

        Intent open = new Intent(ctx, MainActivity.class);
        open.setAction("com.monet.expensetracker.OPEN");
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        rv.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(ctx, 1, open, flags));

        Intent add = new Intent(ctx, MainActivity.class);
        add.setAction(MonetWidgetPlugin.ACTION_QUICK_ADD);
        add.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        rv.setOnClickPendingIntent(R.id.widget_add, PendingIntent.getActivity(ctx, 2, add, flags));

        return rv;
    }
}
