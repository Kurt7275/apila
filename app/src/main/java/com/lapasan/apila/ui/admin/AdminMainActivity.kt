package com.lapasan.apila.ui.admin

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.lapasan.apila.R
import com.lapasan.apila.databinding.ActivityAdminMainBinding
import com.lapasan.apila.ui.auth.AuthViewModel
import com.lapasan.apila.ui.resident.ProfileFragment
import com.lapasan.apila.ui.resident.ResidentMainActivity

class AdminMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminMainBinding
    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBottomNavigation()
        setupListeners()

        if (savedInstanceState == null) {
            loadFragment(AdminDashboardFragment(), "Personnel Dashboard")
        }
    }

    private fun setupBottomNavigation() {
        binding.adminBottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_admin_dashboard -> {
                    loadFragment(AdminDashboardFragment(), "Personnel Dashboard")
                    true
                }
                R.id.nav_admin_programs -> {
                    loadFragment(AdminProgramsFragment(), "Program Management")
                    true
                }
                R.id.nav_admin_announcements -> {
                    loadFragment(AdminAnnouncementsFragment(), "Announcements")
                    true
                }
                R.id.nav_admin_reports -> {
                    loadFragment(AdminReportsFragment(), "Participation Reports")
                    true
                }
                R.id.nav_admin_profile -> {
                    loadFragment(ProfileFragment(), "Admin Profile")
                    true
                }
                else -> false
            }
        }
    }

    private fun setupListeners() {
        binding.btnExitAdmin.setOnClickListener {
            authViewModel.switchDemoRole(asAdmin = false)
            val intent = Intent(this, ResidentMainActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    fun navigateToTab(tabId: Int) {
        binding.adminBottomNavigation.selectedItemId = tabId
    }

    private fun loadFragment(fragment: Fragment, title: String) {
        binding.tvAdminToolbarTitle.text = title
        supportFragmentManager.beginTransaction()
            .replace(R.id.adminFragmentContainer, fragment)
            .commit()
    }
}
