package com.lapasan.apila.ui.auth

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.lapasan.apila.data.model.User
import com.lapasan.apila.data.repository.AuthRepository
import com.lapasan.apila.databinding.ActivitySplashBinding
import com.lapasan.apila.ui.resident.ResidentMainActivity

@SuppressLint("CustomSplashScreen")
class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val authRepository = AuthRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        Handler(Looper.getMainLooper()).postDelayed({
            val currentUser = authRepository.getCurrentUser()
            if (currentUser != null) {
                startActivity(Intent(this, ResidentMainActivity::class.java))
            } else {
                startActivity(Intent(this, GetStartedActivity::class.java))
            }
            finish()
        }, 1200)
    }
}
