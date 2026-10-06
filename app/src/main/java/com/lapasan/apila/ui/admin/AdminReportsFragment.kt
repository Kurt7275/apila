package com.lapasan.apila.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.databinding.FragmentAdminReportsBinding
import com.lapasan.apila.ui.common.ReportProgramAdapter
import com.lapasan.apila.util.Resource

class AdminReportsFragment : Fragment() {

    private var _binding: FragmentAdminReportsBinding? = null
    private val binding get() = _binding!!

    private val adminViewModel: AdminViewModel by activityViewModels()
    private lateinit var reportAdapter: ReportProgramAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminReportsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        observeViewModel()

        adminViewModel.loadDashboardStats()
        adminViewModel.loadPrograms()
    }

    private fun setupRecyclerView() {
        reportAdapter = ReportProgramAdapter()
        binding.rvReportPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvReportPrograms.adapter = reportAdapter
    }

    private fun observeViewModel() {
        adminViewModel.dashboardStats.observe(viewLifecycleOwner) { stats ->
            binding.tvReportTotalRegistered.text = "${stats.totalRegistrations} residents"
            binding.tvReportAttendanceRate.text = "${stats.attendanceRate}%"
        }

        adminViewModel.programs.observe(viewLifecycleOwner) { resource ->
            if (resource is Resource.Success) {
                val list = resource.data ?: emptyList()
                reportAdapter.submitList(list)
                if (list.isNotEmpty()) {
                    val totalCap = list.sumOf { it.maxCapacity }
                    val totalReg = list.sumOf { it.registeredCount }
                    val util = if (totalCap > 0) ((totalReg.toFloat() / totalCap.toFloat()) * 100).toInt() else 0
                    binding.tvReportTotalCapacity.text = "$totalCap slots"
                    binding.tvReportUtilizationRate.text = "$util%"
                    binding.pbReportOverallUtilization.progress = util
                    binding.tvReportUtilizationSummary.text = "$util% of total capacity allocated"
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
