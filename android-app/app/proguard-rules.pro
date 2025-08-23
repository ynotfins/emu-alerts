# EMU Alerts ProGuard Rules

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep Retrofit and Moshi
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.squareup.moshi.** { *; }
-keep class * extends com.squareup.moshi.JsonAdapter { *; }
-keep @com.squareup.moshi.JsonClass class * { *; }

# Keep data classes used with Moshi
-keep class com.emualerts.geocoding.** { *; }
-keep class com.emualerts.Alert { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
