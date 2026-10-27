package com.lapasan.apila.ui.resident

import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.lapasan.apila.R
import com.lapasan.apila.data.model.User
import com.lapasan.apila.databinding.FragmentProfileBinding
import com.lapasan.apila.ui.auth.AuthViewModel
import com.lapasan.apila.ui.auth.LoginActivity
import com.lapasan.apila.util.Resource
import java.util.Calendar

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

        observeUser()
        observeActivePrograms()
        setupListeners()

        // Sync live profile & verification status from Firestore
        authViewModel.refreshProfile()
        residentViewModel.loadMyPrograms()
    }

    private fun observeUser() {
        authViewModel.currentUser.observe(viewLifecycleOwner) { user ->
            populateUserData(user)
        }
    }

    private fun populateUserData(user: User?) {
        if (user == null) return

        binding.tvProfileName.text = user.fullName
        binding.tvProfileEmail.text = user.email
        binding.tvProfilePurok.text = user.purok.ifBlank { "Barangay Lapasan" }
        binding.tvProfilePhone.text = user.phone.ifBlank { "N/A" }
        binding.tvProfileAddress.text = user.address.ifBlank { "Barangay Lapasan, Cagayan de Oro City" }
        binding.tvProfileResidentId.text = "ID #${user.uid.takeLast(6).uppercase()}"

        // Demographic additions
        binding.tvProfileGender.text = user.gender.ifBlank { "Not specified" }
        binding.tvProfileBirthdate.text = formatBirthdate(user.birthdate)
        binding.tvProfileHouseholdId.text = user.householdId.ifBlank { "Pending Assignment" }

        // Dynamic Role & Live Verification Status Badge
        if (user.isPersonnel) {
            binding.tvProfileRoleBadge.text = "Barangay Lapasan Personnel"
            binding.tvProfileRoleBadge.setTextColor(Color.parseColor("#C2410C"))
            binding.tvProfileRoleBadge.background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_badge_advisory)
        } else if (user.isVerified) {
            binding.tvProfileRoleBadge.text = "Verified Lapasan Resident"
            binding.tvProfileRoleBadge.setTextColor(Color.parseColor("#15803D"))
            binding.tvProfileRoleBadge.background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_badge_attendance_present)
        } else {
            binding.tvProfileRoleBadge.text = "Verification Pending"
            binding.tvProfileRoleBadge.setTextColor(Color.parseColor("#D97706"))
            binding.tvProfileRoleBadge.background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_badge_attendance_pending)
        }
    }

    private fun formatBirthdate(isoDate: String): String {
        if (isoDate.isBlank()) return "Not specified"
        return try {
            val parts = isoDate.split("-")
            val year = parts[0].toInt()
            val month = parts[1].toInt() - 1
            val day = parts[2].toInt()
            val monthNames = arrayOf(
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            )
            "${monthNames[month]} %02d, %04d".format(day, year)
        } catch (_: Exception) {
            isoDate
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

        binding.btnEditProfile.setOnClickListener {
            showEditProfileBottomSheet()
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

    private fun showEditProfileBottomSheet() {
        val user = authViewModel.currentUser.value ?: return

        val dialog = BottomSheetDialog(requireContext())
        val view = layoutInflater.inflate(R.layout.bottom_sheet_edit_profile, null)
        dialog.setContentView(view)

        val etName = view.findViewById<EditText>(R.id.etEditFullName)
        val etPhone = view.findViewById<EditText>(R.id.etEditPhone)
        val spinnerPurok = view.findViewById<Spinner>(R.id.spinnerEditPurok)
        val etAddress = view.findViewById<EditText>(R.id.etEditAddress)
        val spinnerGender = view.findViewById<Spinner>(R.id.spinnerEditGender)
        val layoutBirthdate = view.findViewById<View>(R.id.layoutEditBirthdate)
        val etBirthdate = view.findViewById<EditText>(R.id.etEditBirthdate)
        val progressBar = view.findViewById<ProgressBar>(R.id.progressEditProfile)
        val btnSave = view.findViewById<MaterialButton>(R.id.btnSaveProfile)
        val btnCancel = view.findViewById<MaterialButton>(R.id.btnCancelEdit)

        // Pre-fill existing data
        etName.setText(user.fullName)
        etPhone.setText(user.phone)
        etAddress.setText(user.address)

        var selectedBirthdateIso = user.birthdate
        if (selectedBirthdateIso.isNotBlank()) {
            etBirthdate.setText(formatBirthdate(selectedBirthdateIso))
        }

        // Setup Purok Spinner
        val rawPuroks = resources.getStringArray(R.array.lapasan_puroks).toList()
        val purokList = listOf("Select Your Purok") + rawPuroks
        val purokAdapter = object : ArrayAdapter<String>(requireContext(), R.layout.item_spinner_selected, purokList) {
            override fun isEnabled(position: Int): Boolean = position != 0
            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                val tv = super.getView(position, convertView, parent) as TextView
                tv.setTextColor(ContextCompat.getColor(context, if (position == 0) R.color.text_tertiary else R.color.text_primary))
                return tv
            }
            override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
                val tv = super.getDropDownView(position, convertView, parent) as TextView
                tv.setTextColor(ContextCompat.getColor(context, if (position == 0) R.color.text_tertiary else R.color.text_primary))
                return tv
            }
        }
        purokAdapter.setDropDownViewResource(R.layout.item_spinner_dropdown)
        spinnerPurok.adapter = purokAdapter

        // Pre-select Purok
        val purokIndex = rawPuroks.indexOfFirst { it.equals(user.purok, ignoreCase = true) }
        if (purokIndex >= 0) {
            spinnerPurok.setSelection(purokIndex + 1)
        }

        // Setup Gender Spinner
        val rawGenders = resources.getStringArray(R.array.resident_genders).toList()
        val genderList = listOf("Select Sex / Gender") + rawGenders
        val genderAdapter = object : ArrayAdapter<String>(requireContext(), R.layout.item_spinner_selected, genderList) {
            override fun isEnabled(position: Int): Boolean = position != 0
            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                val tv = super.getView(position, convertView, parent) as TextView
                tv.setTextColor(ContextCompat.getColor(context, if (position == 0) R.color.text_tertiary else R.color.text_primary))
                return tv
            }
            override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup): View {
                val tv = super.getDropDownView(position, convertView, parent) as TextView
                tv.setTextColor(ContextCompat.getColor(context, if (position == 0) R.color.text_tertiary else R.color.text_primary))
                return tv
            }
        }
        genderAdapter.setDropDownViewResource(R.layout.item_spinner_dropdown)
        spinnerGender.adapter = genderAdapter

        // Pre-select Gender
        val genderIndex = rawGenders.indexOfFirst { it.equals(user.gender, ignoreCase = true) }
        if (genderIndex >= 0) {
            spinnerGender.setSelection(genderIndex + 1)
        }

        // Setup DatePicker
        val openDatePicker = {
            val cal = Calendar.getInstance()
            if (selectedBirthdateIso.isNotBlank()) {
                try {
                    val parts = selectedBirthdateIso.split("-")
                    cal.set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt())
                } catch (_: Exception) {}
            } else {
                cal.add(Calendar.YEAR, -20)
            }

            val dpDialog = DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    selectedBirthdateIso = String.format("%04d-%02d-%02d", year, month + 1, day)
                    etBirthdate.setText(formatBirthdate(selectedBirthdateIso))
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            )
            dpDialog.datePicker.maxDate = System.currentTimeMillis() - 86400000L
            dpDialog.show()
        }

        layoutBirthdate.setOnClickListener { openDatePicker() }
        etBirthdate.setOnClickListener { openDatePicker() }

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSave.setOnClickListener {
            val newName = etName.text?.toString().orEmpty().trim()
            val newPhone = etPhone.text?.toString().orEmpty().trim()
            val newAddress = etAddress.text?.toString().orEmpty().trim()

            if (newName.isBlank()) {
                Toast.makeText(requireContext(), "Please enter your full name", Toast.LENGTH_SHORT).show()
                etName.requestFocus()
                return@setOnClickListener
            }
            if (newPhone.isBlank()) {
                Toast.makeText(requireContext(), "Please enter your contact phone number", Toast.LENGTH_SHORT).show()
                etPhone.requestFocus()
                return@setOnClickListener
            }
            if (spinnerPurok.selectedItemPosition <= 0) {
                Toast.makeText(requireContext(), "Please select your Purok", Toast.LENGTH_SHORT).show()
                spinnerPurok.performClick()
                return@setOnClickListener
            }
            if (spinnerGender.selectedItemPosition <= 0) {
                Toast.makeText(requireContext(), "Please select your sex/gender", Toast.LENGTH_SHORT).show()
                spinnerGender.performClick()
                return@setOnClickListener
            }
            if (selectedBirthdateIso.isBlank()) {
                Toast.makeText(requireContext(), "Please select your date of birth", Toast.LENGTH_SHORT).show()
                layoutBirthdate.performClick()
                return@setOnClickListener
            }

            val newPurok = spinnerPurok.selectedItem.toString()
            val newGender = spinnerGender.selectedItem.toString()

            progressBar.visibility = View.VISIBLE
            btnSave.isEnabled = false
            btnCancel.isEnabled = false

            authViewModel.updateProfile(
                fullName = newName,
                phone = newPhone,
                purok = newPurok,
                address = newAddress.ifBlank { "$newPurok, Barangay Lapasan, CDO" },
                gender = newGender,
                birthdate = selectedBirthdateIso
            )

            Toast.makeText(requireContext(), "Profile updated successfully!", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        dialog.show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
