package com.lapasan.apila.ui.resident

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.databinding.FragmentNotificationsBinding
import com.lapasan.apila.ui.common.AnnouncementAdapter
import com.lapasan.apila.util.Resource

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var announcementAdapter: AnnouncementAdapter
    private var allAnnouncements: List<Announcement> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupFilterChips()
        observeViewModel()
        residentViewModel.loadAnnouncements()
    }

    private fun setupRecyclerView() {
        announcementAdapter = AnnouncementAdapter()
        binding.rvNotifications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotifications.adapter = announcementAdapter

        binding.swipeRefreshNotifications.setOnRefreshListener {
            residentViewModel.loadAnnouncements()
        }
    }

    private fun setupFilterChips() {
        binding.chipGroupBulletins.setOnCheckedStateChangeListener { _, checkedIds ->
            applyFilter(checkedIds.firstOrNull())
        }
    }

    private fun applyFilter(checkedId: Int?) {
        val filtered = when (checkedId) {
            binding.chipUrgentOnly.id -> allAnnouncements.filter { it.isUrgent }
            binding.chipAdvisoriesOnly.id -> allAnnouncements.filter { !it.isUrgent }
            else -> allAnnouncements
        }

        announcementAdapter.submitList(filtered)

        val countText = when (checkedId) {
            binding.chipUrgentOnly.id -> "Showing ${filtered.size} urgent alert${if (filtered.size == 1) "" else "s"}"
            binding.chipAdvisoriesOnly.id -> "Showing ${filtered.size} official advisor${if (filtered.size == 1) "y" else "ies"}"
            else -> "Showing ${filtered.size} official bulletin${if (filtered.size == 1) "" else "s"}"
        }
        binding.tvBulletinCount.text = countText

        if (filtered.isEmpty()) {
            binding.rvNotifications.visibility = View.GONE
            binding.layoutEmptyNotifications.visibility = View.VISIBLE
        } else {
            binding.rvNotifications.visibility = View.VISIBLE
            binding.layoutEmptyNotifications.visibility = View.GONE
        }
    }

    private fun observeViewModel() {
        residentViewModel.announcements.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefreshNotifications.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                allAnnouncements = resource.data ?: emptyList()
                val selectedChipId = binding.chipGroupBulletins.checkedChipId
                applyFilter(if (selectedChipId != View.NO_ID) selectedChipId else null)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
