package com.lapasan.apila.ui.admin

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.databinding.ActivityAdminCreateProgramBinding
import com.lapasan.apila.util.Resource

class AdminCreateEditProgramActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PROGRAM = "extra_program"
    }

    private lateinit var binding: ActivityAdminCreateProgramBinding
    private val adminViewModel: AdminViewModel by viewModels()
    private var editingProgram: Program? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminCreateProgramBinding.inflate(layoutInflater)
        setContentView(binding.root)

        @Suppress("DEPRECATION")
        editingProgram = intent.getSerializableExtra(EXTRA_PROGRAM) as? Program

        setupCategorySpinner()
        setupToolbar()
        populateIfEditing()
        setupListeners()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.createProgramToolbar.title = if (editingProgram != null) "Edit Program" else "Create Community Program"
        binding.createProgramToolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupCategorySpinner() {
        val adapter = ArrayAdapter.createFromResource(
            this,
            R.array.program_categories,
            android.R.layout.simple_spinner_item
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerCategory.adapter = adapter
    }

    private fun populateIfEditing() {
        val p = editingProgram ?: return
        binding.etProgramTitle.setText(p.title)
        binding.etProgramVenue.setText(p.venue)
        binding.etStartDate.setText(p.startDate)
        binding.etStartTime.setText(p.startTime)
        binding.etEndDate.setText(p.endDate)
        binding.etEndTime.setText(p.endTime)
        binding.etCapacity.setText(p.maxCapacity.toString())
        binding.etDeadline.setText(p.registrationDeadline)
        binding.etProgramDescription.setText(p.description)
        binding.switchPublish.isChecked = p.status == Program.STATUS_PUBLISHED

        val categories = resources.getStringArray(R.array.program_categories)
        val index = categories.indexOf(p.category)
        if (index >= 0) binding.spinnerCategory.setSelection(index)
    }

    private fun setupListeners() {
        binding.btnSaveProgram.setOnClickListener {
            val title = binding.etProgramTitle.text?.toString().orEmpty().trim()
            val category = binding.spinnerCategory.selectedItem?.toString().orEmpty()
            val venue = binding.etProgramVenue.text?.toString().orEmpty().trim()
            val startDate = binding.etStartDate.text?.toString().orEmpty().trim()
            val startTime = binding.etStartTime.text?.toString().orEmpty().trim()
            val endDate = binding.etEndDate.text?.toString().orEmpty().trim()
            val endTime = binding.etEndTime.text?.toString().orEmpty().trim()
            val capacityStr = binding.etCapacity.text?.toString().orEmpty().trim()
            val deadline = binding.etDeadline.text?.toString().orEmpty().trim()
            val description = binding.etProgramDescription.text?.toString().orEmpty().trim()
            val isPublished = binding.switchPublish.isChecked

            if (title.isBlank()) {
                binding.tilProgramTitle.error = "Title is required"
                return@setOnClickListener
            } else {
                binding.tilProgramTitle.error = null
            }

            val capacity = capacityStr.toIntOrNull() ?: 50

            val programToSave = editingProgram?.copy(
                title = title,
                category = category,
                venue = venue,
                startDate = startDate,
                startTime = startTime,
                endDate = endDate,
                endTime = endTime,
                maxCapacity = capacity,
                registrationDeadline = deadline,
                description = description,
                status = if (isPublished) Program.STATUS_PUBLISHED else Program.STATUS_DRAFT
            ) ?: Program(
                title = title,
                category = category,
                venue = venue,
                startDate = startDate,
                startTime = startTime,
                endDate = endDate,
                endTime = endTime,
                maxCapacity = capacity,
                registrationDeadline = deadline,
                description = description,
                status = if (isPublished) Program.STATUS_PUBLISHED else Program.STATUS_DRAFT
            )

            adminViewModel.saveProgram(programToSave)
        }
    }

    private fun observeViewModel() {
        adminViewModel.saveProgramState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.btnSaveProgram.isEnabled = false
                }
                is Resource.Success -> {
                    binding.btnSaveProgram.isEnabled = true
                    Toast.makeText(this, "Program saved successfully!", Toast.LENGTH_SHORT).show()
                    adminViewModel.clearStates()
                    finish()
                }
                is Resource.Error -> {
                    binding.btnSaveProgram.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Failed to save program", Toast.LENGTH_SHORT).show()
                    adminViewModel.clearStates()
                }
                null -> {}
            }
        }
    }
}
