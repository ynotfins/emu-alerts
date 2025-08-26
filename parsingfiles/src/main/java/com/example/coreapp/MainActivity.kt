package com.example.coreapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.coreapp.databinding.ActivityMainBinding
import com.example.coreapp.util.Logger
import com.example.coreapp.util.logD
import com.example.coreapp.util.logE
import com.example.coreapp.util.logI
import com.example.coreapp.util.logW
import com.google.android.material.appbar.MaterialToolbar
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.ktx.Firebase
import com.google.firebase.firestore.ktx.firestore

class MainActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var alertsAdapter: AlertsAdapter

    private val crashlytics: FirebaseCrashlytics by lazy { Firebase.crashlytics }
    private var alertsRegistration: ListenerRegistration? = null

    private fun logEvent(msg: String) = crashlytics.log("[MainActivity] $msg")
    private fun setAppState(key: String, value: Any) =
        crashlytics.setCustomKey(key, value.toString())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Logger.d(TAG, "✅ MAIN_SMOKE_LOG: MainActivity created")
        logD("onCreate(savedInstanceState=$savedInstanceState)")

        Logger.time(TAG, "initialization") {
            binding = ActivityMainBinding.inflate(layoutInflater)
            setContentView(binding.root)

            // Toolbar
            val tb: MaterialToolbar = binding.toolbar
            setSupportActionBar(tb)

            // Recycler: tap opens AlertDetailsActivity with incidentId extra
            alertsAdapter = AlertsAdapter { alert ->
                logD("Alert clicked: #${alert.id}")
                Toast.makeText(this, getString(R.string.toast_opening_incident, alert.id), Toast.LENGTH_SHORT).show()

                val intent = Intent(
                    this,
                    AlertDetailsActivity::class.java
                ).putExtra("incidentId", alert.id)

                startActivity(intent)
            }
            binding.alertsList.layoutManager = LinearLayoutManager(this)
            binding.alertsList.adapter = alertsAdapter
        }

        // Enable Crashlytics in debug (disabled by default)
        if (BuildConfig.DEBUG) {
            crashlytics.setCrashlyticsCollectionEnabled(true)
        }

        // Set initial app state
        setAppState("build_type", if (BuildConfig.DEBUG) "debug" else "release")
        setAppState("version_name", BuildConfig.VERSION_NAME)
        setAppState("version_code", BuildConfig.VERSION_CODE)

        logEvent("App started")
        logI("App initialized successfully")
    }

    override fun onStart() {
        super.onStart()
        logD("onStart()")
        com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.let {
            Logger.d(TAG, "user=${it.uid.take(8)}... email=${it.email ?: "-"}")
        } ?: Logger.d(TAG, "user=null")

        // Live Firestore feed
        alertsRegistration = Logger.time(TAG, "Firestore query setup") {
            Firebase.firestore
                .collection("alerts")
                .orderBy("ts", Query.Direction.DESCENDING)
                .limit(200)
                .addSnapshotListener { snap, err ->
                    if (err != null) {
                        crashlytics.recordException(err)
                        logE("Error fetching alerts", err)
                        return@addSnapshotListener
                    }

                    // === Firestore schema probe (temporary) ===
                    val docs = snap?.documents.orEmpty()
                    Logger.d(TAG, "probe: query returned ${docs.size} docs")
                    docs.take(3).forEachIndexed { idx, d ->
                        Logger.d(TAG, "probe: doc[$idx] id=${d.id} keys=${com.example.coreapp.util.FirestoreProbe.keys(d)}")
                        Logger.json(TAG, com.example.coreapp.util.FirestoreProbe.json(d))
                    }
                    // === end probe ===

                    logD("Got snapshot with ${snap?.documents?.size ?: 0} documents")
                    
                    val items = Logger.time(TAG, "Process alerts") {
                        snap?.documents?.mapNotNull { d ->
                            val id = d.getString("incidentId") ?: return@mapNotNull null
                            val state = d.getString("state").orEmpty()
                            val county = d.getString("county").orEmpty()
                            val city = d.getString("city").orEmpty()
                            val address = d.getString("address").orEmpty()
                            val type = (d.getString("alertType") ?: "Update").ifBlank { "Update" }
                            val message = d.getString("alertMessage") ?: d.getString("rawText") ?: ""
                            val title = listOf(state, county, city, address, type)
                                .filter { it.isNotBlank() }
                                .joinToString(" | ")
                            val ts = d.getTimestamp("ts")?.toDate()?.time ?: System.currentTimeMillis()
                            Alert(id, title, message, ts)
                        }.orEmpty()
                    }

                    logD("Mapped to ${items.size} alerts")
                    alertsAdapter.updateAlerts(items)
                    
                    val isEmptyVisible = items.isEmpty()
                    binding.emptyView.root.visibility =
                        if (isEmptyVisible) android.view.View.VISIBLE else android.view.View.GONE
                    logD("Empty view visibility: ${if (isEmptyVisible) "VISIBLE" else "GONE"}")
                }
        }
    }

    override fun onResume() {
        super.onResume()
        logD("onResume()")
    }

    override fun onPause() {
        logD("onPause()")
        super.onPause()
    }

    override fun onStop() {
        logD("onStop()")
        super.onStop()
        alertsRegistration?.remove()
        alertsRegistration = null
    }

    override fun onDestroy() {
        logD("onDestroy()")
        super.onDestroy()
    }

    override fun onCreateOptionsMenu(menu: android.view.Menu): Boolean {
        logD("onCreateOptionsMenu()")
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: android.view.MenuItem): Boolean =
        when (item.itemId) {
            R.id.action_test_crash -> {
                logD("Test crash triggered")
                logEvent("User triggered test crash")
                setAppState("test_crash", true)
                throw RuntimeException("Test Crash")
            }
            R.id.action_refresh -> {
                logD("Manual refresh triggered")
                refreshFeed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }

    /** Example of error logging with context */
    private fun refreshFeed() {
        try {
            Logger.time(TAG, "refreshFeed") {
                // TODO: Implement refresh logic
                logD("Feed refresh completed")
            }
        } catch (t: Throwable) {
            logE("refreshFeed failed", t)
        }
    }
}
