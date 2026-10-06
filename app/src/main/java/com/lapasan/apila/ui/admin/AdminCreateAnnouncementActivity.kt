package com.lapasan.apila.ui.admin

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.databinding.ActivityAdminCreateAnnouncementBinding
import com.lapasan.apila.util.Resource

class AdminCreateAnnouncementActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAdminCreateAnnouncementBinding
    private val adminViewModel: AdminViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminCreateAnnouncementBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupListeners()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.createAnnouncementToolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupListeners() {
        binding.btnSubmitAnnouncement.setOnClickListener {
            val title = binding.etAnnouncementTitle.text?.toString().orEmpty().trim()
            val content = binding.etAnnouncementContent.text?.toString().orEmpty().trim()
            val author = binding.etAuthor.text?.toString().orEmpty().trim()
            val isUrgent = binding.rbUrgentPriority.isChecked

            if (title.isBlank()) {
                binding.tilAnnouncementTitle.error = "Title is required"
                return@setOnClickListener
            } else {
                binding.tilAnnouncementTitle.error = null
            }

            if (content.isBlank()) {
                binding.tilAnnouncementContent.error = "Details cannot be empty"
                return@setOnClickListener
            } else {
                binding.tilAnnouncementContent.error = null
            }

            val announcement = Announcement(
                title = title,
                content = content,
                authorName = if (author.isBlank()) "Barangay Lapasan Council" else author,
                priority = if (isUrgent) Announcement.PRIORITY_URGENT else Announcement.PRIORITY_NORMAL
            )

            adminViewModel.publishAnnouncement(announcement)
        }
    }

    private fun observeViewModel() {
        adminViewModel.publishAnnouncementState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.btnSubmitAnnouncement.isEnabled = false
                }
                is Resource.Success -> {
                    binding.btnSubmitAnnouncement.isEnabled = true
                    Toast.makeText(this, "Announcement broadcasted successfully!", Toast.LENGTH_SHORT).show()
                    adminViewModel.clearStates()
                    finish()
                }
                is Resource.Error -> {
                    binding.btnSubmitAnnouncement.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Failed to publish announcement", Toast.LENGTH_SHORT).show()
                    adminViewModel.clearStates()
                }
                null -> {}
            }
        }
    }
}
