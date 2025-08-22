package com.example.coreapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.coreapp.databinding.ActivityMainBinding
import com.google.android.material.appbar.MaterialToolbar
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.ktx.Firebase
import com.google.firebase.firestore.ktx.firestore

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var alertsAdapter: AlertsAdapter

    private val crashlytics: FirebaseCrashlytics by lazy { Firebase.crashlytics }
    private var alertsRegistration: ListenerRegistration? = null

    private fun logEvent(msg: String) = crashlytics.log("[MainActivity] $msg")
    private fun setAppState(key: String, value: Any) =
        crashlytics.setCustomKey(key, value.toString())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Toolbar
        val tb: MaterialToolbar = binding.toolbar
        setSupportActionBar(tb)

        // Recycler: tap opens AlertDetailsActivity with incidentId extra
        alertsAdapter = AlertsAdapter { alert ->
            // You can remove this toast if you want — kept for quick UX feedback
            Toast.makeText(this, "Opening #${alert.id}", Toast.LENGTH_SHORT).show()

            val intent = Intent(
                this,
                com.example.coreapp.AlertDetailsActivity::class.java
            ).putExtra("incidentId", alert.id)

            startActivity(intent)
        }
        binding.alertsList.layoutManager = LinearLayoutManager(this)
        binding.alertsList.adapter = alertsAdapter

        logEvent("App started")
    }

    override fun onStart() {
        super.onStart()
        // Live Firestore feed
        alertsRegistration = Firebase.firestore
            .collection("alerts")
            .orderBy("ts", Query.Direction.DESCENDING)
            .limit(200)
            .addSnapshotListener { snap, err ->
                if (err != null) {
                    crashlytics.recordException(err)
                    android.util.Log.e("MainActivity", "Error fetching alerts", err)
                    return@addSnapshotListener
                }
                android.util.Log.d("MainActivity", "Got snapshot with ${snap?.documents?.size ?: 0} documents")
                val items = snap?.documents?.mapNotNull { d ->
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

                android.util.Log.d("MainActivity", "Mapped to ${items.size} alerts")
                alertsAdapter.updateAlerts(items)
                binding.emptyView.root.visibility =
                    if (items.isEmpty()) android.view.View.VISIBLE else android.view.View.GONE
                android.util.Log.d("MainActivity", "Empty view visibility: ${if (items.isEmpty()) "VISIBLE" else "GONE"}")
            }
    }

    override fun onStop() {
        super.onStop()
        alertsRegistration?.remove()
        alertsRegistration = null
    }

    override fun onCreateOptionsMenu(menu: android.view.Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: android.view.MenuItem): Boolean =
        when (item.itemId) {
            R.id.action_test_crash -> {
                logEvent("User triggered test crash")
                setAppState("test_crash", true)
                throw RuntimeException("Test Crash")
            }
            else -> super.onOptionsItemSelected(item)
        }
}
