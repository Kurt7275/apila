package com.lapasan.apila.ui.resident

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ActivityProgramDetailBinding
import com.lapasan.apila.util.Resource

class ProgramDetailActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PROGRAM = "extra_program"
    }

    private lateinit var binding: ActivityProgramDetailBinding
    private val residentViewModel: ResidentViewModel by viewModels()
    private var program: Program? = null
    private var activeRegistration: Registration? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProgramDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        @Suppress("DEPRECATION")
        program = intent.getSerializableExtra(EXTRA_PROGRAM) as? Program

        if (program == null) {
            Toast.makeText(this, "Program details unavailable", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setupToolbar()
        bindProgramData()
        checkRegistrationStatus()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.detailToolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun bindProgramData() {
        val p = program ?: return
        binding.tvDetailTitle.text = p.title
        binding.tvDetailCategory.text = p.category
        binding.tvDetailDescription.text = p.description
        binding.tvDetailVenue.text = p.venue
        binding.tvDetailDateTime.text = "${p.startDate} • ${p.startTime} - ${p.endTime}"
        binding.tvDetailDeadline.text = "Registration Deadline: ${p.registrationDeadline.ifBlank { p.startDate }}"

        val available = p.availableSlots
        val max = p.maxCapacity
        binding.pbDetailSlots.max = max
        binding.pbDetailSlots.progress = p.registeredCount

        binding.tvDetailSlotsText.text = "$available of $max slots left"
        binding.tvDetailSlotNote.text = "${p.registeredCount} residents currently registered"

        if (p.isFull) {
            binding.tvDetailStatus.text = "Slots Full / Closed"
            binding.tvDetailStatus.backgroundTintList = ContextCompat.getColorStateList(this, R.color.status_closed_bg)
            binding.tvDetailStatus.setTextColor(ContextCompat.getColor(this, R.color.status_closed_text))
            binding.pbDetailSlots.progressTintList = ContextCompat.getColorStateList(this, R.color.status_closed_text)
        } else {
            binding.tvDetailStatus.text = "Open for Registration"
            binding.tvDetailStatus.backgroundTintList = ContextCompat.getColorStateList(this, R.color.status_open_bg)
            binding.tvDetailStatus.setTextColor(ContextCompat.getColor(this, R.color.status_open_text))
            binding.pbDetailSlots.progressTintList = ContextCompat.getColorStateList(this, R.color.brand_orange)
        }
    }

    private fun checkRegistrationStatus() {
        val p = program ?: return
        val isRegistered = residentViewModel.isRegistered(p.id)
        activeRegistration = residentViewModel.getRegistration(p.id)

        if (isRegistered && activeRegistration != null) {
            binding.btnRegisterProgram.text = "Cancel My Registration"
            binding.btnRegisterProgram.backgroundTintList = ContextCompat.getColorStateList(this, R.color.badge_absent_bg)
            binding.btnRegisterProgram.setTextColor(ContextCompat.getColor(this, R.color.badge_absent_text))
            binding.btnRegisterProgram.setOnClickListener {
                showCancelConfirmation()
            }
        } else if (p.isFull) {
            binding.btnRegisterProgram.text = "Program is Full"
            binding.btnRegisterProgram.isEnabled = false
            binding.btnRegisterProgram.backgroundTintList = ContextCompat.getColorStateList(this, R.color.surface_variant)
            binding.btnRegisterProgram.setTextColor(ContextCompat.getColor(this, R.color.text_tertiary))
        } else {
            binding.btnRegisterProgram.text = getString(R.string.register_program)
            binding.btnRegisterProgram.isEnabled = true
            binding.btnRegisterProgram.backgroundTintList = ContextCompat.getColorStateList(this, R.color.brand_orange)
            binding.btnRegisterProgram.setTextColor(ContextCompat.getColor(this, R.color.white))
            binding.btnRegisterProgram.setOnClickListener {
                showRegisterConfirmation()
            }
        }
    }

    private fun showRegisterConfirmation() {
        val p = program ?: return
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.confirm_registration_title)
            .setMessage(getString(R.string.confirm_registration_msg, p.title))
            .setPositiveButton("Confirm & Register") { _, _ ->
                residentViewModel.registerForProgram(p)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showCancelConfirmation() {
        val reg = activeRegistration ?: return
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.confirm_cancel_title)
            .setMessage(R.string.confirm_cancel_msg)
            .setPositiveButton("Yes, Cancel") { _, _ ->
                residentViewModel.cancelRegistration(reg.id)
            }
            .setNegativeButton("Keep Registration", null)
            .show()
    }

    private fun observeViewModel() {
        residentViewModel.registrationAction.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.btnRegisterProgram.isEnabled = false
                }
                is Resource.Success -> {
                    binding.btnRegisterProgram.isEnabled = true
                    Toast.makeText(this, "Successfully registered for ${program?.title}!", Toast.LENGTH_LONG).show()
                    val p = program
                    if (p != null) {
                        program = p.copy(registeredCount = p.registeredCount + 1)
                        bindProgramData()
                    }
                    checkRegistrationStatus()
                    residentViewModel.clearActionState()
                }
                is Resource.Error -> {
                    binding.btnRegisterProgram.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Registration failed", Toast.LENGTH_SHORT).show()
                    residentViewModel.clearActionState()
                }
                null -> {}
            }
        }

        residentViewModel.cancelAction.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.btnRegisterProgram.isEnabled = false
                }
                is Resource.Success -> {
                    binding.btnRegisterProgram.isEnabled = true
                    Toast.makeText(this, "Registration cancelled successfully.", Toast.LENGTH_LONG).show()
                    val p = program
                    if (p != null) {
                        program = p.copy(registeredCount = (p.registeredCount - 1).coerceAtLeast(0))
                        bindProgramData()
                    }
                    checkRegistrationStatus()
                    residentViewModel.clearActionState()
                }
                is Resource.Error -> {
                    binding.btnRegisterProgram.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Cancellation failed", Toast.LENGTH_SHORT).show()
                    residentViewModel.clearActionState()
                }
                null -> {}
            }
        }
    }
}
