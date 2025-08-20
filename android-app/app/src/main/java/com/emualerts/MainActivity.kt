package com.emualerts

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.Firebase
import com.google.firebase.firestore.firestore

private const val EMU_TAG = "EMU-FirebaseTest"

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<TextView>(R.id.helloText).text = "Hello EMU Alerts!"
        
        findViewById<Button>(R.id.testFirestoreButton).setOnClickListener {
            testFirestore()
        }
        
        // Automatic Firestore smoke test on startup
        testFirestore()
    }
    
    private fun testFirestore() {
        val db = Firebase.firestore
        db.collection("alerts").limit(1).get()
            .addOnSuccessListener { q ->
                Log.i(EMU_TAG, "Firestore OK, docs: ${q.size()}")
            }
            .addOnFailureListener { e ->
                Log.e(EMU_TAG, "Firestore error", e)
            }
    }
}

