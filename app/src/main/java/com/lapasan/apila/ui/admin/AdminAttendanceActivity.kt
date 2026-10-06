package com.lapasan.apila.ui.admin

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ActivityAdminAttendanceBinding
import com.lapasan.apila.ui.common.AttendanceAdapter
import com.lapasan.apila.util.Resource

class AdminAttendanceActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PROGRAM = "extra_program"
    }

    private lateinit var binding: ActivityAdminAttendanceBinding
    private val adminViewModel: AdminViewModel by viewModels()
    private var program: Program? = null
    private lateinit var attendanceAdapter: AttendanceAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminAttendanceBinding.inflate(layoutInflater)
        setContentView(binding.root)

        @Suppress("DEPRECATION")
        program = intent.getSerializableExtra(EXTRA_PROGRAM) as? Program

        if (program == null) {
            Toast.makeText(this, "Program data missing", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        setupToolbar()
        setupRecyclerView()
        observeViewModel()

        adminViewModel.loadParticipants(program!!.id)
    }

    private fun setupToolbar() {
        binding.attendanceToolbar.setNavigationOnClickListener {
            finish()
        }
        val p = program ?: return
        binding.tvAttendanceProgramTitle.text = p.title
    }

    private fun setupRecyclerView() {
        val progId = program?.id.orEmpty()
        attendanceAdapter = AttendanceAdapter(
            onMarkPresent = { registration ->
                adminViewModel.updateAttendance(registration.id, Registration.ATTENDANCE_PRESENT, progId)
            },
            onMarkAbsent = { registration ->
                adminViewModel.updateAttendance(registration.id, Registration.ATTENDANCE_ABSENT, progId)
            }
        )
        binding.rvAttendanceChecklist.layoutManager = LinearLayoutManager(this)
        binding.rvAttendanceChecklist.adapter = attendanceAdapter
    }

    private fun observeViewModel() {
        adminViewModel.participants.observe(this) { list ->
            attendanceAdapter.submitList(list)

            val total = list.size
            val present = list.count { it.attendanceStatus == Registration.ATTENDANCE_PRESENT }
            val pendingOrAbsent = list.count { it.attendanceStatus != Registration.ATTENDANCE_PRESENT }

            binding.tvTallyRegistered.text = total.toString()
            binding.tvTallyPresent.text = present.toString()
            binding.tvTallyPending.text = pendingOrAbsent.toString()
        }

        adminViewModel.attendanceUpdateState.observe(this) { resource ->
            if (resource is Resource.Success) {
                Toast.makeText(this, "Attendance updated", Toast.LENGTH_SHORT).show()
                adminViewModel.clearStates()
            }
        }
    }
}
