import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.google.services)
    alias(libs.plugins.firebase.crashlytics)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.detekt)
}

// Load local.properties
val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localProperties.load(localPropertiesFile.inputStream())
}

android {
    namespace = "com.emualerts"
    compileSdk =
        libs.versions.compileSdk
            .get()
            .toInt()

    defaultConfig {
        applicationId = "com.emualerts"
        minSdk =
            libs.versions.minSdk
                .get()
                .toInt()
        targetSdk =
            libs.versions.targetSdk
                .get()
                .toInt()
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Securely inject API keys
        buildConfigField("String", "MAPS_API_KEY", "\"${localProperties.getProperty("MAPS_API_KEY", "")}\"")
    }

    buildTypes {
        debug {
            isDebuggable = true
            isMinifyEnabled = false
            configure<com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsExtension> {
                mappingFileUploadEnabled = false
            }
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            configure<com.google.firebase.crashlytics.buildtools.gradle.CrashlyticsExtension> {
                mappingFileUploadEnabled = true
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.valueOf("VERSION_${libs.versions.java.get()}")
        targetCompatibility = JavaVersion.valueOf("VERSION_${libs.versions.java.get()}")
    }
    kotlinOptions {
        jvmTarget = libs.versions.java.get()
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    // Firebase
    implementation(platform(libs.firebase.bom))
    implementation(libs.bundles.firebase)

    // AndroidX & Material
    implementation(libs.bundles.androidx.ui)

    // Networking
    implementation(libs.bundles.networking)
    implementation(libs.play.services.maps)

    // Testing
    testImplementation(libs.bundles.testing)
    androidTestImplementation(libs.bundles.testing.android)
}

// Static Analysis Configuration
ktlint {
    version.set(libs.versions.ktlint.get())
    android.set(true)
    outputColorName.set("RED")
}

detekt {
    config.setFrom("$rootDir/config/detekt/detekt.yml")
    buildUponDefaultConfig = true
    autoCorrect = true
}
