package com.emualerts

import android.app.Application
import android.os.StrictMode
import com.emualerts.util.Logger
import com.google.firebase.FirebaseApp
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.ktx.Firebase

class App : Application() {
    override fun onCreate() {
        super.onCreate()

        // Enable/disable logs here (debug only)
        Logger.enabled = BuildConfig.DEBUG
        Logger.d("App", "🚀 APP_SMOKE_LOG: Application started (debug=${BuildConfig.DEBUG})")

        // Initialize Firebase if available (no generic catch)
        val crashlyticsOrNull: FirebaseCrashlytics? = runCatching {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this)
            }
            Firebase.crashlytics
        }.onFailure { e ->
            Logger.w("App", "⚠️ Firebase not available: ${e.message}")
            Logger.w("App", "   📋 To enable Firebase: see docs/identity/plan.md")
        }.getOrNull()

        crashlyticsOrNull?.setCustomKey("app_started", true)
        if (crashlyticsOrNull != null) Logger.d("App", "✅ Firebase initialized successfully")

        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectAll()
                    .penaltyLog()
                    .build()
            )
            StrictMode.setVmPolicy(
                StrictMode.VmPolicy.Builder()
                    .detectLeakedClosableObjects()
                    .penaltyLog()
                    .build()
            )
        }
    }
}


