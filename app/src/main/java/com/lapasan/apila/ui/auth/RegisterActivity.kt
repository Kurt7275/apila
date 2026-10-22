package com.lapasan.apila.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
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
    private lateinit var spinnerPurok: Spinner

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
        spinnerPurok = findViewById(R.id.spinnerPurok)

        setupPurokSpinner()
        setupListeners()
        observeViewModel()
    }

    private fun setupPurokSpinner() {
        val purokList = listOf("Select Your Purok (Required)") + resources.getStringArray(R.array.lapasan_puroks).toList()
        val adapter = object : ArrayAdapter<String>(this, R.layout.item_spinner_selected, purokList) {
            override fun isEnabled(position: Int): Boolean {
                return position != 0
            }

            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                val view = super.getView(position, convertView, parent) as TextView
                if (position == 0) {
                    view.setTextColor(ContextCompat.getColor(context, R.color.text_tertiary))
                } else {
                    view.setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                }
                return view
            }

            override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
                val view = super.getDropDownView(position, convertView, parent) as TextView
                if (position == 0) {
                    view.setTextColor(ContextCompat.getColor(context, R.color.text_tertiary))
                } else {
                    view.setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                }
                return view
            }
        }
        adapter.setDropDownViewResource(R.layout.item_spinner_dropdown)
        spinnerPurok.adapter = adapter
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
            if (spinnerPurok.selectedItemPosition <= 0) {
                Toast.makeText(this, "Please select your Purok", Toast.LENGTH_SHORT).show()
                spinnerPurok.performClick()
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

            val selectedPurok = spinnerPurok.selectedItem.toString()
            val finalAddress = if (address.isBlank()) {
                "$selectedPurok, Barangay Lapasan, CDO"
            } else {
                "$address, $selectedPurok, Barangay Lapasan, CDO"
            }

            authViewModel.register(
                fullName = fullName,
                email = email,
                pass = password,
                phone = if (phone.isBlank()) "09170000000" else phone,
                purok = selectedPurok,
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
