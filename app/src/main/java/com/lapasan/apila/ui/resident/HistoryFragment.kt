package com.lapasan.apila.ui.resident

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.FragmentHistoryBinding
import com.lapasan.apila.ui.common.HistoryAdapter

class HistoryFragment : Fragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var historyAdapter: HistoryAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupListeners()
        observeViewModel()
        residentViewModel.loadHistory()
    }

    private fun setupRecyclerView() {
        historyAdapter = HistoryAdapter()
        binding.rvHistory.layoutManager = LinearLayoutManager(requireContext())
        binding.rvHistory.adapter = historyAdapter

        binding.swipeRefreshHistory.setOnRefreshListener {
            residentViewModel.loadHistory()
            binding.swipeRefreshHistory.isRefreshing = false
        }
    }

    private fun setupListeners() {
        binding.btnEmptyBrowse.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }
    }

    private fun observeViewModel() {
        residentViewModel.historyRegistrations.observe(viewLifecycleOwner) { list ->
            historyAdapter.submitList(list)
            if (list.isEmpty()) {
                binding.cardCivicSummary.visibility = View.GONE
                binding.tvTimelineHeader.visibility = View.GONE
                binding.rvHistory.visibility = View.GONE
                binding.layoutEmptyHistory.visibility = View.VISIBLE
            } else {
                binding.cardCivicSummary.visibility = View.VISIBLE
                binding.tvTimelineHeader.visibility = View.VISIBLE
                binding.rvHistory.visibility = View.VISIBLE
                binding.layoutEmptyHistory.visibility = View.GONE

                val total = list.size
                val attended = list.count { it.attendanceStatus == Registration.ATTENDANCE_PRESENT }
                val rate = if (total > 0) ((attended.toDouble() / total) * 100).toInt() else 0

                binding.tvStatTotal.text = total.toString()
                binding.tvStatAttended.text = attended.toString()
                binding.tvStatRate.text = "$rate%"

                if (attended > 0) {
                    binding.tvStandingBadge.text = "Active Resident"
                } else {
                    binding.tvStandingBadge.text = "Registered"
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
