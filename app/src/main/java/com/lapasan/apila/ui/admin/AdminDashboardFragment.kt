package com.lapasan.apila.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.R
import com.lapasan.apila.databinding.FragmentAdminDashboardBinding
import com.lapasan.apila.ui.common.AdminProgramAdapter
import com.lapasan.apila.util.Resource

class AdminDashboardFragment : Fragment() {

    private var _binding: FragmentAdminDashboardBinding? = null
    private val binding get() = _binding!!

    private val adminViewModel: AdminViewModel by activityViewModels()
    private lateinit var programAdapter: AdminProgramAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupListeners()
        observeViewModel()
        loadData()
    }

    private fun setupRecyclerView() {
        programAdapter = AdminProgramAdapter(
            onViewParticipants = { program ->
                val intent = Intent(requireContext(), AdminParticipantsActivity::class.java).apply {
                    putExtra(AdminParticipantsActivity.EXTRA_PROGRAM, program)
                }
                startActivity(intent)
            },
            onRecordAttendance = { program ->
                val intent = Intent(requireContext(), AdminAttendanceActivity::class.java).apply {
                    putExtra(AdminAttendanceActivity.EXTRA_PROGRAM, program)
                }
                startActivity(intent)
            },
            onProgramClick = { program ->
                val intent = Intent(requireContext(), AdminCreateEditProgramActivity::class.java).apply {
                    putExtra(AdminCreateEditProgramActivity.EXTRA_PROGRAM, program)
                }
                startActivity(intent)
            }
        )
        binding.rvAdminDashboardPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAdminDashboardPrograms.adapter = programAdapter

        binding.swipeRefreshAdminDashboard.setOnRefreshListener {
            loadData()
        }
    }

    private fun setupListeners() {
        binding.btnQuickCreateProgram.setOnClickListener {
            startActivity(Intent(requireContext(), AdminCreateEditProgramActivity::class.java))
        }

        binding.btnQuickNewAnnouncement.setOnClickListener {
            startActivity(Intent(requireContext(), AdminCreateAnnouncementActivity::class.java))
        }

        binding.tvAdminManageAll.setOnClickListener {
            (activity as? AdminMainActivity)?.navigateToTab(R.id.nav_admin_programs)
        }
    }

    private fun loadData() {
        adminViewModel.loadDashboardStats()
        adminViewModel.loadPrograms()
    }

    private fun observeViewModel() {
        adminViewModel.dashboardStats.observe(viewLifecycleOwner) { stats ->
            binding.tvKpiTotalPrograms.text = stats.totalPrograms.toString()
            binding.tvKpiActivePrograms.text = stats.activePrograms.toString()
            binding.tvKpiRegistrations.text = stats.totalRegistrations.toString()
            binding.tvKpiAttendanceRate.text = "${stats.attendanceRate}%"
        }

        adminViewModel.programs.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefreshAdminDashboard.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                val list = resource.data ?: emptyList()
                programAdapter.submitList(list.take(4))
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
