package com.emualerts

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.emualerts.databinding.ActivityAlertDetailsBinding
import com.emualerts.util.Logger
import com.emualerts.util.logD
import com.emualerts.util.logE
import com.emualerts.util.logW
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import java.text.DateFormat
import java.util.Date

class AlertDetailsActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "AlertDetailsActivity"
    }

    private lateinit var binding: ActivityAlertDetailsBinding
    private var incidentId: String = ""
    private var reg: ListenerRegistration? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Logger.d(TAG, "✅ DETAILS_SMOKE_LOG: AlertDetailsActivity created")
        logD("onCreate(savedInstanceState=$savedInstanceState)")

        Logger.time(TAG, "initialization") {
            binding = ActivityAlertDetailsBinding.inflate(layoutInflater)
            setContentView(binding.root)

            setSupportActionBar(binding.toolbar)
            supportActionBar?.setDisplayHomeAsUpEnabled(true)
            supportActionBar?.title = getString(R.string.app_name)

            incidentId = intent.getStringExtra("incidentId") ?: ""
            if (incidentId.isBlank()) {
                logW("No incident ID provided, finishing activity")
                finish()
                return
            }

            logD("Loading incident #$incidentId")
            binding.incidentId.text = getString(R.string.fmt_incident_hash, incidentId)
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

    override fun onStart() {
        super.onStart()
        logD("onStart()")

        val tag = TAG
        val documentPath = incidentId.takeIf { it.isNotBlank() } ?: return logD("no incidentId")

        // Firestore read with timing + safe logging
        reg = Logger.time(tag, "Firestore incident load") {
            Firebase.firestore
                .collection("incidents")
                .document(documentPath)
                .addSnapshotListener { snap, err ->
                    if (err != null) {
                        logE("Error loading incident $incidentId", err)
                        return@addSnapshotListener
                    }

                    val hasData = (snap != null && snap.exists())
                    binding.content.visibility = if (hasData) View.VISIBLE else View.GONE
                    binding.detailEmpty.root.visibility = if (hasData) View.GONE else View.VISIBLE

                    if (!hasData) {
                        logD("No data for incident $incidentId")
                        return@addSnapshotListener
                    }

                    Logger.time(tag, "Process incident data") {
                        val state  = snap!!.getString("state").orEmpty()
                        val county = snap.getString("county").orEmpty()
                        val city   = snap.getString("city").orEmpty()
                        val address= snap.getString("address").orEmpty()
                        val type   = snap.getString("lastType").orEmpty()
                        val lastTs = (snap.getTimestamp("lastTs") ?: snap.getTimestamp("firstSeenAt"))
                            ?.toDate() ?: Date()

                        binding.headerLocation.text = listOf(state, county, city)
                            .filter { it.isNotBlank() }
                            .joinToString(" • ")

                        binding.headerType.text = type.ifBlank { "Update" }
                        binding.headerAddress.text = address
                        binding.headerTime.text = DateFormat
                            .getDateTimeInstance()
                            .format(lastTs)

                        logD("bound incident: state=$state county=$county city=$city type=$type")
                    }
                }
        }
    }

    override fun onStop() {
        logD("onStop()")
        super.onStop()
        reg?.remove()
        reg = null
    }

    override fun onDestroy() {
        logD("onDestroy()")
        super.onDestroy()
    }

    override fun onSupportNavigateUp(): Boolean {
        logD("onSupportNavigateUp()")
        onBackPressedDispatcher.onBackPressed()
        return true
    }

    // Removed unused private function previously flagged by detekt
}


