package com.lapasan.apila.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.lapasan.apila.R
import com.lapasan.apila.databinding.ActivityRegisterBinding
import com.lapasan.apila.ui.resident.ResidentMainActivity
import com.lapasan.apila.util.Resource

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val authViewModel: AuthViewModel by viewModels()

    // Direct references for nested EditTexts inside FrameLayouts
    private lateinit var etFullName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var etAddress: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        etFullName = findViewById(R.id.etFullName)
        etEmail = findViewById(R.id.etEmail)
        etPhone = findViewById(R.id.etPhone)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        etAddress = findViewById(R.id.etAddress)

        setupListeners()
        observeViewModel()
    }

    private fun setupListeners() {
        // Hidden back view — navigate up on any back press
        binding.btnBack.setOnClickListener { finish() }

        binding.tvFooterLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        binding.layoutLoginFooter.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        binding.btnSubmitRegister.setOnClickListener {
            val fullName = etFullName.text?.toString().orEmpty().trim()
            val email = etEmail.text?.toString().orEmpty().trim()
            val password = etPassword.text?.toString().orEmpty().trim()
            val confirmPassword = etConfirmPassword.text?.toString().orEmpty().trim()
            val phone = etPhone.text?.toString().orEmpty().trim()
            val address = etAddress.text?.toString().orEmpty().trim()

            if (fullName.isBlank()) {
                Toast.makeText(this, "Please enter your full name", Toast.LENGTH_SHORT).show()
                etFullName.requestFocus()
                return@setOnClickListener
            }
            if (email.isBlank() || !email.contains("@")) {
                Toast.makeText(this, "Please enter a valid email address", Toast.LENGTH_SHORT).show()
                etEmail.requestFocus()
                return@setOnClickListener
            }
            if (password.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                etPassword.requestFocus()
                return@setOnClickListener
            }
            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                etConfirmPassword.requestFocus()
                return@setOnClickListener
            }

            val finalAddress = if (address.isBlank()) "Barangay Lapasan, CDO" else address
            val purok = if (finalAddress.contains("Purok", ignoreCase = true)) finalAddress else "Purok 2 - Lapasan Proper"

            authViewModel.register(
                fullName = fullName,
                email = email,
                pass = password,
                phone = if (phone.isBlank()) "09170000000" else phone,
                purok = purok,
                address = finalAddress
            )
        }
    }

    private fun observeViewModel() {
        authViewModel.registerState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.registerProgress.visibility = View.VISIBLE
                    binding.btnSubmitRegister.isEnabled = false
                }
                is Resource.Success -> {
                    binding.registerProgress.visibility = View.GONE
                    binding.btnSubmitRegister.isEnabled = true
                    Toast.makeText(this, "Welcome to APILA, ${resource.data?.fullName ?: "Resident"}!", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this, ResidentMainActivity::class.java))
                    finishAffinity()
                }
                is Resource.Error -> {
                    binding.registerProgress.visibility = View.GONE
                    binding.btnSubmitRegister.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Registration failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
