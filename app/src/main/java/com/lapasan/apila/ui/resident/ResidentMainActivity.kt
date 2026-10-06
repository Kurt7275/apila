package com.lapasan.apila.ui.resident

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.lapasan.apila.R
import com.lapasan.apila.databinding.ActivityResidentMainBinding

class ResidentMainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityResidentMainBinding
    private var currentTabIndex = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityResidentMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupTabs()
        setupListeners()

        if (savedInstanceState == null) {
            selectTab(0)
        }
    }

    private fun setupTabs() {
        binding.tabHome.setOnClickListener { selectTab(0) }
        binding.tabPrograms.setOnClickListener { selectTab(1) }
        binding.tabMyPrograms.setOnClickListener { selectTab(2) }
        binding.tabHistory.setOnClickListener { selectTab(3) }
        binding.tabNotifications.setOnClickListener { selectTab(4) }
        binding.tabProfile.setOnClickListener { selectTab(5) }
    }

    private fun setupListeners() {
        binding.btnQuickNotification.setOnClickListener {
            selectTab(4)
        }
    }

    fun selectTab(index: Int) {
        currentTabIndex = index
        resetTabStyles()

        val activeColor = ContextCompat.getColor(this, R.color.brand_orange)
        val activeTextColor = ContextCompat.getColor(this, R.color.brand_orange)

        val fragment: Fragment
        val title: String

        when (index) {
            0 -> {
                highlightTab(binding.ivTabHome, binding.tvTabHome, activeColor, activeTextColor)
                fragment = HomeFragment()
                title = "APILA • Home"
            }
            1 -> {
                highlightTab(binding.ivTabPrograms, binding.tvTabPrograms, activeColor, activeTextColor)
                fragment = ProgramsFragment()
                title = "Barangay Programs"
            }
            2 -> {
                highlightTab(binding.ivTabMyPrograms, binding.tvTabMyPrograms, activeColor, activeTextColor)
                fragment = MyProgramsFragment()
                title = "My Programs"
            }
            3 -> {
                highlightTab(binding.ivTabHistory, binding.tvTabHistory, activeColor, activeTextColor)
                fragment = HistoryFragment()
                title = "Participation History"
            }
            4 -> {
                highlightTab(binding.ivTabNotifications, binding.tvTabNotifications, activeColor, activeTextColor)
                fragment = NotificationsFragment()
                title = "Notifications & Alerts"
            }
            5 -> {
                highlightTab(binding.ivTabProfile, binding.tvTabProfile, activeColor, activeTextColor)
                fragment = ProfileFragment()
                title = "Resident Profile"
            }
            else -> {
                fragment = HomeFragment()
                title = "APILA • Home"
            }
        }

        binding.tvToolbarTitle.text = title
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    private fun highlightTab(iv: ImageView, tv: TextView, iconColor: Int, textColor: Int) {
        iv.setColorFilter(iconColor)
        tv.setTextColor(textColor)
        tv.paint.isFakeBoldText = true
    }

    private fun resetTabStyles() {
        val inactiveColor = ContextCompat.getColor(this, R.color.text_tertiary)

        val tabIcons = listOf(
            binding.ivTabHome,
            binding.ivTabPrograms,
            binding.ivTabMyPrograms,
            binding.ivTabHistory,
            binding.ivTabNotifications,
            binding.ivTabProfile
        )

        val tabTexts = listOf(
            binding.tvTabHome,
            binding.tvTabPrograms,
            binding.tvTabMyPrograms,
            binding.tvTabHistory,
            binding.tvTabNotifications,
            binding.tvTabProfile
        )

        for (iv in tabIcons) {
            iv.setColorFilter(inactiveColor)
        }
        for (tv in tabTexts) {
            tv.setTextColor(inactiveColor)
            tv.paint.isFakeBoldText = false
        }
    }

    fun navigateToTab(tabId: Int) {
        when (tabId) {
            R.id.nav_home -> selectTab(0)
            R.id.nav_programs -> selectTab(1)
            R.id.nav_my_programs -> selectTab(2)
            R.id.nav_history -> selectTab(3)
            R.id.nav_notifications -> selectTab(4)
            R.id.nav_profile -> selectTab(5)
            else -> selectTab(tabId)
        }
    }
}
