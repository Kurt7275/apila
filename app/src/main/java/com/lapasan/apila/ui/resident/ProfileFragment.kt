package com.lapasan.apila.ui.resident

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.lapasan.apila.databinding.FragmentProfileBinding
import com.lapasan.apila.ui.auth.AuthViewModel
import com.lapasan.apila.ui.auth.LoginActivity

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val authViewModel: AuthViewModel by activityViewModels()
    private val residentViewModel: ResidentViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        populateUserData()
        observeActivePrograms()
        setupListeners()

        // Trigger live load of active registrations
        residentViewModel.loadMyPrograms()
    }

    private fun populateUserData() {
        val user = authViewModel.currentUser.value
        if (user != null) {
            binding.tvProfileName.text = user.fullName
            binding.tvProfileEmail.text = user.email
            binding.tvProfilePurok.text = user.purok.ifBlank { "Barangay Lapasan" }
            binding.tvProfilePhone.text = user.phone.ifBlank { "N/A" }
            binding.tvProfileAddress.text = user.address.ifBlank { "Barangay Lapasan, Cagayan de Oro City" }
            binding.tvProfileResidentId.text = "ID #${user.uid.takeLast(6).uppercase()}"

            if (user.isPersonnel) {
                binding.tvProfileRoleBadge.text = "Barangay Lapasan Personnel"
                binding.tvProfileRoleBadge.setTextColor(android.graphics.Color.parseColor("#C2410C"))
                binding.tvProfileRoleBadge.background = androidx.core.content.ContextCompat.getDrawable(requireContext(), com.lapasan.apila.R.drawable.bg_badge_advisory)
            } else {
                binding.tvProfileRoleBadge.text = "Verified Lapasan Resident"
                binding.tvProfileRoleBadge.setTextColor(android.graphics.Color.parseColor("#15803D"))
                binding.tvProfileRoleBadge.background = androidx.core.content.ContextCompat.getDrawable(requireContext(), com.lapasan.apila.R.drawable.bg_badge_attendance_present)
            }
        }
    }

    private fun observeActivePrograms() {
        residentViewModel.activeRegistrations.observe(viewLifecycleOwner) { registrations ->
            val count = registrations?.size ?: 0
            binding.tvRegisteredProgramCount.text = when (count) {
                0 -> "No Active Programs"
                1 -> "1 Active Program"
                else -> "$count Active Programs"
            }
        }
    }

    private fun setupListeners() {
        binding.layoutRegisteredPrograms.setOnClickListener {
            (activity as? ResidentMainActivity)?.selectTab(2)
        }

        binding.btnLogout.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Sign Out")
                .setMessage("Are you sure you want to sign out of APILA?")
                .setPositiveButton("Sign Out") { _, _ ->
                    authViewModel.logout()
                    val intent = Intent(requireContext(), LoginActivity::class.java)
                    startActivity(intent)
                    requireActivity().finishAffinity()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
