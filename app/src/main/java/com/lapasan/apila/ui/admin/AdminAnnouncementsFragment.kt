package com.lapasan.apila.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.databinding.FragmentAdminAnnouncementsBinding
import com.lapasan.apila.ui.common.AnnouncementAdapter
import com.lapasan.apila.util.Resource

class AdminAnnouncementsFragment : Fragment() {

    private var _binding: FragmentAdminAnnouncementsBinding? = null
    private val binding get() = _binding!!

    private val adminViewModel: AdminViewModel by activityViewModels()
    private lateinit var announcementAdapter: AnnouncementAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminAnnouncementsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupListeners()
        observeViewModel()
        adminViewModel.loadAnnouncements()
    }

    private fun setupRecyclerView() {
        announcementAdapter = AnnouncementAdapter()
        binding.rvAdminAnnouncements.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAdminAnnouncements.adapter = announcementAdapter

        binding.swipeRefreshAdminAnnouncements.setOnRefreshListener {
            adminViewModel.loadAnnouncements()
        }
    }

    private fun setupListeners() {
        binding.fabCreateAnnouncement.setOnClickListener {
            startActivity(Intent(requireContext(), AdminCreateAnnouncementActivity::class.java))
        }
    }

    private fun observeViewModel() {
        adminViewModel.announcements.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefreshAdminAnnouncements.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                announcementAdapter.submitList(resource.data ?: emptyList())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
