package com.lapasan.apila.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.databinding.ActivityAdminParticipantsBinding
import com.lapasan.apila.ui.common.ParticipantAdapter

class AdminParticipantsActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PROGRAM = "extra_program"
    }

    private lateinit var binding: ActivityAdminParticipantsBinding
    private val adminViewModel: AdminViewModel by viewModels()
    private var program: Program? = null
    private lateinit var participantAdapter: ParticipantAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminParticipantsBinding.inflate(layoutInflater)
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
        setupListeners()
        observeViewModel()

        adminViewModel.loadParticipants(program!!.id)
    }

    private fun setupToolbar() {
        binding.participantsToolbar.setNavigationOnClickListener {
            finish()
        }
        val p = program ?: return
        binding.tvProgramHeaderTitle.text = p.title
        binding.tvParticipantsCountBadge.text = "${p.registeredCount} / ${p.maxCapacity} Registered"
    }

    private fun setupRecyclerView() {
        participantAdapter = ParticipantAdapter()
        binding.rvParticipants.layoutManager = LinearLayoutManager(this)
        binding.rvParticipants.adapter = participantAdapter
    }

    private fun setupListeners() {
        binding.btnGoToAttendance.setOnClickListener {
            val intent = Intent(this, AdminAttendanceActivity::class.java).apply {
                putExtra(AdminAttendanceActivity.EXTRA_PROGRAM, program)
            }
            startActivity(intent)
        }
    }

    private fun observeViewModel() {
        adminViewModel.participants.observe(this) { list ->
            participantAdapter.submitList(list)
            if (list.isEmpty()) {
                binding.rvParticipants.visibility = View.GONE
                binding.layoutEmptyParticipants.visibility = View.VISIBLE
            } else {
                binding.rvParticipants.visibility = View.VISIBLE
                binding.layoutEmptyParticipants.visibility = View.GONE
            }
        }
    }
}
