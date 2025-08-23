package com.emualerts

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.emualerts.databinding.ActivityMainBinding
import com.google.android.material.appbar.MaterialToolbar
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var alertsAdapter: AlertsAdapter

    private val crashlytics: FirebaseCrashlytics by lazy { Firebase.crashlytics }
    private var alertsRegistration: ListenerRegistration? = null

    private fun logEvent(msg: String) = crashlytics.log("[MainActivity] $msg")

    private fun setAppState(
        key: String,
        value: Any,
    ) = crashlytics.setCustomKey(key, value.toString())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val tb: MaterialToolbar = binding.toolbar
        setSupportActionBar(tb)

        // This is where we set up the click listener for each item in the list.
        alertsAdapter =
            AlertsAdapter { alert ->
                // This is what happens when a user taps an incident.
                Toast.makeText(this, "Opening Incident #${alert.id}", Toast.LENGTH_SHORT).show()

                // Create an intent to open the AlertDetailsActivity.
                // We pass the unique incidentId so the next screen knows which incident to load.
                val intent = Intent(this, AlertDetailsActivity::class.java)
                intent.putExtra("incidentId", alert.id)
                startActivity(intent)
            }

        binding.alertsList.layoutManager = LinearLayoutManager(this)
        binding.alertsList.adapter = alertsAdapter

        logEvent("App started")
    }

    override fun onStart() {
        super.onStart()
        alertsRegistration =
            Firebase.firestore
                .collection("alerts")
                .orderBy("ts", Query.Direction.DESCENDING)
                .limit(200) // Get the 200 most recent updates overall.
                .addSnapshotListener { snap, err ->
                    if (err != null) {
                        crashlytics.recordException(err)
                        Log.e("MainActivity", "Error fetching alerts", err)
                        return@addSnapshotListener
                    }
                    Log.d("MainActivity", "Got snapshot with ${snap?.documents?.size ?: 0} documents")

                    // STEP 1: Parse ALL the documents from Firestore using the rawText logic.
                    val allParsedAlerts =
                        snap
                            ?.documents
                            ?.mapNotNull { d ->
                                val id = d.getString("incidentId") ?: return@mapNotNull null
                                val rawText = d.getString("rawText") ?: return@mapNotNull null
                                val ts = d.getTimestamp("ts")?.toDate()?.time ?: System.currentTimeMillis()

                                val parts = rawText.split("|").map { it.trim() }
                                var state = parts.getOrNull(0).orEmpty()
                                if (state.startsWith("U/D")) {
                                    state = state.removePrefix("U/D").trim()
                                }
                                val county = parts.getOrNull(1).orEmpty()
                                val city = parts.getOrNull(2).orEmpty()
                                val type = parts.getOrNull(3).orEmpty()
                                val message = parts.drop(4).joinToString(" | ")

                                val title =
                                    listOf(state, county, city, type)
                                        .filter { it.isNotBlank() }
                                        .joinToString(" | ")

                                Alert(id, title, message, ts)
                            }.orEmpty()

                    // STEP 2: Group all the parsed alerts by their incidentId.
                    val groupedAlerts = allParsedAlerts.groupBy { it.id }

                    // STEP 3: From each group, find the single MOST RECENT alert.
                    // This creates the list of unique incidents you want to display.
                    val latestAlerts =
                        groupedAlerts.mapNotNull { (_, alertsInGroup) ->
                            alertsInGroup.maxByOrNull { it.timestamp }
                        }

                    // STEP 4: Give the final, grouped list to the adapter to display.
                    alertsAdapter.updateAlerts(latestAlerts)

                    binding.emptyView.root.visibility = if (latestAlerts.isEmpty()) View.VISIBLE else View.GONE
                }
    }

    override fun onStop() {
        super.onStop()
        alertsRegistration?.remove()
        alertsRegistration = null
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean =
        when (item.itemId) {
            R.id.action_test_crash -> {
                logEvent("User triggered test crash")
                setAppState("test_crash", true)
                throw RuntimeException("Test Crash")
            }
            else -> super.onOptionsItemSelected(item)
        }
}
