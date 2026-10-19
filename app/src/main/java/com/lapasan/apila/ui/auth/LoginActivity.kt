package com.lapasan.apila.ui.auth

import android.content.Intent
import android.os.Bundle
import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.lapasan.apila.R
import com.lapasan.apila.data.model.User
import com.lapasan.apila.databinding.ActivityLoginBinding
import com.lapasan.apila.ui.resident.ResidentMainActivity
import com.lapasan.apila.util.Resource

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val authViewModel: AuthViewModel by viewModels()
    private var passwordVisible = false

    // Direct findViewById references since fields are nested inside FrameLayouts
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var ivPasswordToggle: ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Find nested views by ID
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        ivPasswordToggle = findViewById(R.id.ivPasswordToggle)

        setupListeners()
        observeViewModel()
    }

    private fun setupListeners() {

        ivPasswordToggle.setOnClickListener {
            passwordVisible = !passwordVisible
            etPassword.transformationMethod = if (passwordVisible)
                HideReturnsTransformationMethod.getInstance()
            else
                PasswordTransformationMethod.getInstance()
            etPassword.setSelection(etPassword.text?.length ?: 0)
        }

        binding.btnLogin.setOnClickListener {
            val email = etEmail.text?.toString().orEmpty().trim()
            val pass = etPassword.text?.toString().orEmpty()

            if (email.isBlank()) {
                Toast.makeText(this, "Please enter your email address", Toast.LENGTH_SHORT).show()
                etEmail.requestFocus()
                return@setOnClickListener
            }
            if (pass.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                etPassword.requestFocus()
                return@setOnClickListener
            }
            authViewModel.login(email, pass)
        }

        binding.tvForgotPassword.setOnClickListener {
            val email = etEmail.text?.toString().orEmpty().trim()
            MaterialAlertDialogBuilder(this)
                .setTitle("Forgot Password")
                .setMessage(
                    if (email.isNotEmpty())
                        "A reset link has been sent to $email."
                    else
                        "Enter your email above to receive reset instructions."
                )
                .setPositiveButton("OK", null)
                .show()
        }

        binding.btnGoogleSignIn.setOnClickListener {
            Toast.makeText(this, "Signing in with Google...", Toast.LENGTH_SHORT).show()
            authViewModel.switchDemoRole(asAdmin = false)
        }

        binding.tvFooterRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.layoutRegisterFooter.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.btnQuickResident.setOnClickListener {
            etEmail.setText("resident@lapasan.gov.ph")
            etPassword.setText("123456")
            authViewModel.switchDemoRole(asAdmin = false)
        }
    }

    private fun observeViewModel() {
        authViewModel.loginState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.loginProgress.visibility = View.VISIBLE
                    binding.btnLogin.isEnabled = false
                }
                is Resource.Success -> {
                    binding.loginProgress.visibility = View.GONE
                    binding.btnLogin.isEnabled = true
                    resource.data?.let { navigateToRoleHome(it) }
                }
                is Resource.Error -> {
                    binding.loginProgress.visibility = View.GONE
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Authentication failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun navigateToRoleHome(user: User) {
        if (user.isPersonnel) {
            MaterialAlertDialogBuilder(this)
                .setTitle("Barangay Personnel Portal")
                .setMessage("Personnel operations have moved to the APILA Web Portal. Please log in from your computer to manage programs, participants, and reports.")
                .setPositiveButton("Continue as Resident") { _, _ ->
                    startActivity(Intent(this, ResidentMainActivity::class.java))
                    finishAffinity()
                }
                .setNegativeButton("Cancel", null)
                .show()
        } else {
            val intent = Intent(this, ResidentMainActivity::class.java)
            startActivity(intent)
            finishAffinity()
        }
    }
}
