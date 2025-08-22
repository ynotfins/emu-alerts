package com.example.coreapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.coreapp.databinding.ActivitySignInBinding
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class SignInActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignInBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignInBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // If already signed in, go straight to MainActivity
        Firebase.auth.currentUser?.let {
            startMainActivity()
            return
        }

        binding.signInButton.setOnClickListener {
            val email = binding.emailInput.text?.toString()?.trim()
            val password = binding.passwordInput.text?.toString()

            if (email.isNullOrEmpty() || password.isNullOrEmpty()) {
                showError(getString(R.string.error_auth_failed))
                return@setOnClickListener
            }

            binding.signInButton.isEnabled = false
            binding.errorText.visibility = View.GONE

            Firebase.auth.signInWithEmailAndPassword(email, password)
                .addOnSuccessListener {
                    startMainActivity()
                }
                .addOnFailureListener { e ->
                    binding.signInButton.isEnabled = true
                    showError(
                        if (e is com.google.firebase.FirebaseNetworkException)
                            getString(R.string.error_network)
                        else
                            getString(R.string.error_auth_failed)
                    )
                }
        }
    }

    private fun showError(message: String) {
        binding.errorText.text = message
        binding.errorText.visibility = View.VISIBLE
    }

    private fun startMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
