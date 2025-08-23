package com.example.coreapp

import android.app.Application
import android.os.StrictMode
import com.example.coreapp.util.Logger
import com.google.firebase.FirebaseApp
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.ktx.Firebase

class App : Application() {
    override fun onCreate() {
        super.onCreate()

        // Ensure Firebase is initialized
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this)
        }

        // Enable/disable logs here (debug only)
        Logger.enabled = BuildConfig.DEBUG
        Logger.d("App", "🚀 APP_SMOKE_LOG: Application started (debug=${BuildConfig.DEBUG})")

        // Set a marker so we know the app boots
        Firebase.crashlytics.setCustomKey("app_started", true)

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