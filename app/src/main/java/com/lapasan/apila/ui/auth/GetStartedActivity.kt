package com.lapasan.apila.ui.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.lapasan.apila.databinding.ActivityGetStartedBinding

class GetStartedActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGetStartedBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGetStartedBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupListeners()
    }

    private fun setupListeners() {
        binding.btnGetStarted.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.layoutLoginFooter.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        binding.tvFooterLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }
    }
}
