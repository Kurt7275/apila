package com.lapasan.apila.ui.resident

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
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
    private var countdownTimer: android.os.CountDownTimer? = null
    private var upcomingProgram: Program? = null
    private var allPrograms: List<Program> = emptyList()
    private var selectedCategory: String? = null

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
            upcomingProgram?.let { prog ->
                val intent = Intent(requireContext(), ProgramDetailActivity::class.java).apply {
                    putExtra(ProgramDetailActivity.EXTRA_PROGRAM, prog)
                }
                startActivity(intent)
            } ?: run {
                (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
            }
        }

        binding.cardUpcomingSchedule.setOnClickListener {
            upcomingProgram?.let { prog ->
                val intent = Intent(requireContext(), ProgramDetailActivity::class.java).apply {
                    putExtra(ProgramDetailActivity.EXTRA_PROGRAM, prog)
                }
                startActivity(intent)
            }
        }

        binding.cardActiveCount.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_my_programs)
        }

        binding.cardAvailableCount.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }

        binding.tvViewAllPrograms.setOnClickListener {
            residentViewModel.pendingCategoryFilter = selectedCategory
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }

        binding.tvViewAllAnnouncements.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_notifications)
        }

        // Civic Sector Chips
        binding.chipSectorAll.setOnClickListener { selectSector(null, binding.chipSectorAll) }
        binding.chipSectorHealth.setOnClickListener { selectSector("Health & Wellness", binding.chipSectorHealth) }
        binding.chipSectorLivelihood.setOnClickListener { selectSector("Livelihood & Skills", binding.chipSectorLivelihood) }
        binding.chipSectorDRRM.setOnClickListener { selectSector("Disaster & Safety", binding.chipSectorDRRM) }
        binding.chipSectorYouth.setOnClickListener { selectSector("Youth & Sports", binding.chipSectorYouth) }
        binding.chipSectorSeniors.setOnClickListener { selectSector("Senior Citizens", binding.chipSectorSeniors) }
        binding.chipSectorEducation.setOnClickListener { selectSector("Education", binding.chipSectorEducation) }
    }

    private fun selectSector(category: String?, selectedChip: TextView) {
        selectedCategory = category
        val chips = listOf(
            binding.chipSectorAll,
            binding.chipSectorHealth,
            binding.chipSectorLivelihood,
            binding.chipSectorDRRM,
            binding.chipSectorYouth,
            binding.chipSectorSeniors,
            binding.chipSectorEducation
        )
        for (chip in chips) {
            if (chip == selectedChip) {
                chip.setBackgroundResource(R.drawable.bg_pill_button_orange)
                chip.setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
            } else {
                chip.setBackgroundResource(R.drawable.bg_pill_button_outline)
                chip.setTextColor(android.graphics.Color.parseColor("#0F172A"))
            }
        }
        applySectorFilter()
    }

    private fun applySectorFilter() {
        val cat = selectedCategory
        val filtered = if (cat == null) {
            allPrograms
        } else {
            allPrograms.filter { p ->
                p.category.contains(cat, ignoreCase = true) ||
                (cat.contains("Health", true) && p.category.contains("Health", true)) ||
                (cat.contains("Livelihood", true) && (p.category.contains("Livelihood", true) || p.category.contains("TESDA", true) || p.category.contains("Skills", true))) ||
                (cat.contains("Disaster", true) && (p.category.contains("DRRM", true) || p.category.contains("Disaster", true) || p.category.contains("Calamity", true) || p.category.contains("Safety", true))) ||
                (cat.contains("Youth", true) && (p.category.contains("Youth", true) || p.category.contains("Sports", true))) ||
                (cat.contains("Senior", true) && p.category.contains("Senior", true)) ||
                (cat.contains("Education", true) && p.category.contains("Education", true))
            }
        }

        if (filtered.isEmpty()) {
            binding.rvFeaturedPrograms.visibility = View.GONE
            binding.tvEmptyFeaturedHome.visibility = View.VISIBLE
            binding.tvEmptyFeaturedHome.text = if (cat == null) {
                "No upcoming initiatives scheduled yet."
            } else {
                "No $cat initiatives currently scheduled."
            }
        } else {
            binding.rvFeaturedPrograms.visibility = View.VISIBLE
            binding.tvEmptyFeaturedHome.visibility = View.GONE
            programAdapter.submitList(filtered.take(3))
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
                allPrograms = list
                binding.tvAvailableProgramsCount.text = list.count { it.isRegistrationOpen }.toString()

                if (list.isEmpty()) {
                    countdownTimer?.cancel()
                    upcomingProgram = null
                    binding.cardUpcomingSchedule.visibility = View.GONE
                    binding.rvFeaturedPrograms.visibility = View.GONE
                    binding.tvEmptyFeaturedHome.visibility = View.VISIBLE
                    binding.tvEmptyFeaturedHome.text = "No upcoming initiatives scheduled yet."
                } else {
                    val upcoming = list.first()
                    upcomingProgram = upcoming
                    binding.cardUpcomingSchedule.visibility = View.VISIBLE
                    binding.tvBannerProgramTitle.text = upcoming.title
                    binding.tvBannerProgramVenue.text = "${upcoming.venue} • ${upcoming.startTime}"
                    startCountdown(upcoming.startDate, upcoming.startTime)
                    applySectorFilter()
                }
            }
        }

        residentViewModel.activeRegistrations.observe(viewLifecycleOwner) { activeList ->
            binding.tvActiveRegistrationsCount.text = activeList.size.toString()
        }

        residentViewModel.announcements.observe(viewLifecycleOwner) { resource ->
            if (resource is Resource.Success) {
                val list = resource.data ?: emptyList()
                announcementAdapter.submitList(list.take(2))
                if (list.isEmpty()) {
                    binding.rvHomeAnnouncements.visibility = View.GONE
                    binding.tvEmptyAnnouncementsHome.visibility = View.VISIBLE
                } else {
                    binding.rvHomeAnnouncements.visibility = View.VISIBLE
                    binding.tvEmptyAnnouncementsHome.visibility = View.GONE
                }
            }
        }
    }

    private fun startCountdown(dateStr: String, timeStr: String) {
        countdownTimer?.cancel()
        val formats = listOf(
            java.text.SimpleDateFormat("yyyy-MM-dd hh:mm a", java.util.Locale.US),
            java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.US),
            java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US),
            java.text.SimpleDateFormat("MMM dd, yyyy hh:mm a", java.util.Locale.US),
            java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.US)
        )
        var targetDate: java.util.Date? = null
        val combined = "$dateStr $timeStr".trim()
        for (format in formats) {
            try {
                targetDate = format.parse(combined)
                if (targetDate != null) break
            } catch (_: Exception) {}
        }
        if (targetDate == null) {
            for (format in formats) {
                try {
                    targetDate = format.parse(dateStr)
                    if (targetDate != null) break
                } catch (_: Exception) {}
            }
        }

        val targetMs = targetDate?.time ?: return
        val remainingMs = targetMs - System.currentTimeMillis()
        if (remainingMs <= 0) {
            binding.tvCountdownDays.text = "00"
            binding.tvCountdownHours.text = "00"
            binding.tvCountdownMin.text = "00"
            binding.tvCountdownSec.text = "00"
            return
        }

        countdownTimer = object : android.os.CountDownTimer(remainingMs, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val days = java.util.concurrent.TimeUnit.MILLISECONDS.toDays(millisUntilFinished)
                val hours = java.util.concurrent.TimeUnit.MILLISECONDS.toHours(millisUntilFinished) % 24
                val minutes = java.util.concurrent.TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished) % 60
                val seconds = java.util.concurrent.TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) % 60

                binding.tvCountdownDays.text = String.format("%02d", days)
                binding.tvCountdownHours.text = String.format("%02d", hours)
                binding.tvCountdownMin.text = String.format("%02d", minutes)
                binding.tvCountdownSec.text = String.format("%02d", seconds)
            }

            override fun onFinish() {
                binding.tvCountdownDays.text = "00"
                binding.tvCountdownHours.text = "00"
                binding.tvCountdownMin.text = "00"
                binding.tvCountdownSec.text = "00"
            }
        }.start()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        countdownTimer?.cancel()
        countdownTimer = null
        _binding = null
    }
}
