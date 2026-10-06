package com.lapasan.apila.ui.resident

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.R
import com.lapasan.apila.databinding.FragmentHomeBinding
import com.lapasan.apila.ui.common.AnnouncementAdapter
import com.lapasan.apila.ui.common.ProgramAdapter
import com.lapasan.apila.util.Resource

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var programAdapter: ProgramAdapter
    private lateinit var announcementAdapter: AnnouncementAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerViews()
        setupListeners()
        observeViewModel()
        loadData()
    }

    private fun setupRecyclerViews() {
        programAdapter = ProgramAdapter { program ->
            val intent = Intent(requireContext(), ProgramDetailActivity::class.java).apply {
                putExtra(ProgramDetailActivity.EXTRA_PROGRAM, program)
            }
            startActivity(intent)
        }
        binding.rvFeaturedPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvFeaturedPrograms.adapter = programAdapter

        announcementAdapter = AnnouncementAdapter()
        binding.rvHomeAnnouncements.layoutManager = LinearLayoutManager(requireContext())
        binding.rvHomeAnnouncements.adapter = announcementAdapter
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            loadData()
        }

        binding.btnBannerBrowse.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }

        binding.btnBannerMyPrograms.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_my_programs)
        }

        binding.cardActiveCount.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_my_programs)
        }

        binding.cardAvailableCount.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }

        binding.tvViewAllPrograms.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }

        binding.tvViewAllAnnouncements.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_notifications)
        }
    }

    private fun loadData() {
        residentViewModel.loadPrograms()
        residentViewModel.loadMyPrograms()
        residentViewModel.loadAnnouncements()
    }

    private fun observeViewModel() {
        val user = residentViewModel.currentUser
        if (user != null) {
            binding.tvWelcomeResident.text = "Maayong Adlaw, ${user.fullName.split(" ").firstOrNull() ?: "Resident"}!"
            binding.tvResidentPurok.text = "${user.purok} • Registered Resident"
        }

        residentViewModel.programs.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefresh.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                val list = resource.data ?: emptyList()
                programAdapter.submitList(list.take(3))
                binding.tvAvailableProgramsCount.text = list.count { it.isRegistrationOpen }.toString()
            }
        }

        residentViewModel.activeRegistrations.observe(viewLifecycleOwner) { activeList ->
            binding.tvActiveRegistrationsCount.text = activeList.size.toString()
        }

        residentViewModel.announcements.observe(viewLifecycleOwner) { resource ->
            if (resource is Resource.Success) {
                announcementAdapter.submitList((resource.data ?: emptyList()).take(2))
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
