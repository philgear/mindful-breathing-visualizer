package com.example.breathing

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.RemoteViews

class BreathingWidgetProvider : AppWidgetProvider() {

    private val handler = Handler(Looper.getMainLooper())
    private val boxCycle = listOf(
        Phase("Inhale", 4000),
        Phase("Hold", 4000),
        Phase("Exhale", 4000),
        Phase("Hold", 4000)
    )
    private val diaphragmaticCycle = listOf(
        Phase("Inhale", 5000),
        Phase("Exhale", 5000)
    )
    private val alternateCycle = listOf(
        Phase("Inhale Left", 4000),
        Phase("Hold", 4000),
        Phase("Exhale Right", 4000),
        Phase("Hold", 4000),
        Phase("Inhale Right", 4000),
        Phase("Hold", 4000),
        Phase("Exhale Left", 4000),
        Phase("Hold", 4000)
    )
    
    // Default
    private val cycle = boxCycle
    private var currentIndex = 0

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        // In a real implementation, you would use AlarmManager or WorkManager 
        // for periodic updates rather than a Handler loop in a Provider, 
        // as the Provider lifecycle is short. 
        // This is a simplified logic example.
        
        val views = RemoteViews(context.packageName, R.layout.breathing_widget)
        val phase = cycle[currentIndex]
        
        views.setTextViewText(R.id.phase_text, phase.name)
        
        // Push update for this widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
    
    data class Phase(val name: String, val duration: Long)
}
