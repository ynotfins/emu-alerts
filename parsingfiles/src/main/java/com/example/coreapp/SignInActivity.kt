package com.example.coreapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.coreapp.databinding.ActivitySignInBinding
import com.example.coreapp.util.Logger
import com.example.coreapp.util.logD
import com.example.coreapp.util.logE
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class SignInActivity : AppCompatActivity() {
    companion object { private const val TAG = "SignInActivity" }
    private lateinit var binding: ActivitySignInBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignInBinding.inflate(layoutInflater)
        setContentView(binding.root)

        Logger.d(TAG, "✅ SIGNIN_SMOKE_LOG: SignInActivity created")
        logAuthState("onCreate")

        // If already signed in, go straight to MainActivity
        Firebase.auth.currentUser?.let {
            Logger.d(TAG, "already signed in → MainActivity (uid=${it.uid.take(8)}...)")
            startMainActivity()
            return
        }

        binding.signInButton.setOnClickListener {
            val email = binding.emailInput.text?.toString()?.trim()
            val password = binding.passwordInput.text?.toString()

            logD("sign in clicked; hasEmail=${!email.isNullOrEmpty()} hasPassword=${!password.isNullOrEmpty()}")
            if (email.isNullOrEmpty() || password.isNullOrEmpty()) {
                showError(getString(R.string.error_auth_failed))
                return@setOnClickListener
            }

            binding.signInButton.isEnabled = false
            binding.errorText.visibility = View.GONE

            Firebase.auth.signInWithEmailAndPassword(email, password)
                .addOnSuccessListener {
                    Logger.d(TAG, "firebase signInWithEmailAndPassword ok uid=${Firebase.auth.currentUser?.uid?.take(8) ?: "-"}...")
                    startMainActivity()
                }
                .addOnFailureListener { e ->
                    binding.signInButton.isEnabled = true
                    logE("firebase signInWithEmailAndPassword failed", e)
                    showError(
                        if (e is com.google.firebase.FirebaseNetworkException)
                            getString(R.string.error_network)
                        else
                            getString(R.string.error_auth_failed)
                    )
                }
        }
    }

    override fun onStart() {
        super.onStart()
        logAuthState("onStart")
    }

    private fun showError(message: String) {
        binding.errorText.text = message
        binding.errorText.visibility = View.VISIBLE
    }

    private fun startMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun logAuthState(where: String) {
        val u = Firebase.auth.currentUser
        if (u == null) Logger.d(TAG, "$where: user=null")
        else Logger.d(TAG, "$where: user=${u.uid.take(8)}... email=${u.email ?: "-"}")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Logger.d(TAG, "onActivityResult rc=$requestCode result=$resultCode hasData=${data != null}")
        super.onActivityResult(requestCode, resultCode, data)
    }
}
