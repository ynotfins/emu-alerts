package com.example.coreapp

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.coreapp.databinding.ActivityAlertDetailsBinding
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import java.text.DateFormat
import java.util.Date

class AlertDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAlertDetailsBinding
    private var incidentId: String = ""
    private var reg: ListenerRegistration? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAlertDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.app_name)

        incidentId = intent.getStringExtra("incidentId") ?: ""
        if (incidentId.isBlank()) {
            finish()
            return
        }

        binding.incidentId.text = getString(R.string.fmt_incident_hash, incidentId)
    }

    override fun onStart() {
        super.onStart()
        reg = Firebase.firestore.collection("incidents").document(incidentId)
            .addSnapshotListener { snap, err ->
                val hasData = err == null && snap != null && snap.exists()
                binding.content.visibility = if (hasData) View.VISIBLE else View.GONE
                binding.detailEmpty.root.visibility = if (hasData) View.GONE else View.VISIBLE
                if (!hasData) return@addSnapshotListener

                val state   = snap!!.getString("state").orEmpty()
                val county  = snap.getString("county").orEmpty()
                val city    = snap.getString("city").orEmpty()
                val address = snap.getString("address").orEmpty()
                val type    = snap.getString("lastType").orEmpty()
                val msg     = snap.getString("lastMessage").orEmpty()
                val lastTs  = (snap.getTimestamp("lastTs") ?: snap.getTimestamp("firstSeenAt"))
                    ?.toDate() ?: Date()

                binding.headerLocation.text = listOf(state, county, city)
                    .filter { it.isNotBlank() }.joinToString(" · ")
                binding.headerType.text = type.ifBlank { "Update" }
                binding.headerAddress.text = address
                binding.headerTime.text = DateFormat.getDateTimeInstance().format(lastTs)
                binding.message.text = msg

                val updates = (snap.getLong("updateCount") ?: 0L).toInt()
                binding.updateCount.text = resources.getQuantityString(R.plurals.fmt_updates, updates, updates)
            }
    }

    override fun onStop() {
        super.onStop()
        reg?.remove()
        reg = null
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
