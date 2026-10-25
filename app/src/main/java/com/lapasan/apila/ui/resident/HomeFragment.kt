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
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.FragmentHomeBinding
import com.lapasan.apila.ui.common.AnnouncementAdapter
import com.lapasan.apila.ui.common.ProgramAdapter
import com.lapasan.apila.util.Resource
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var programAdapter: ProgramAdapter
    private lateinit var announcementAdapter: AnnouncementAdapter
    private var countdownTimer: android.os.CountDownTimer? = null
    private var upcomingProgram: Program? = null
    private var allPrograms: List<Program> = emptyList()
    private var myRegistrations: List<Registration> = emptyList()
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
            if (myRegistrations.isNotEmpty()) {
                (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_my_programs)
            } else {
                upcomingProgram?.let { prog ->
                    val intent = Intent(requireContext(), ProgramDetailActivity::class.java).apply {
                        putExtra(ProgramDetailActivity.EXTRA_PROGRAM, prog)
                    }
                    startActivity(intent)
                } ?: run {
                    (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
                }
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
                updateUpcomingScheduleBanner()
                applySectorFilter()
            }
        }

        residentViewModel.activeRegistrations.observe(viewLifecycleOwner) { activeList ->
            myRegistrations = activeList
            binding.tvActiveRegistrationsCount.text = activeList.size.toString()
            updateUpcomingScheduleBanner()
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

    private fun updateUpcomingScheduleBanner() {
        val now = System.currentTimeMillis()

        // ══════════════════════════════════════════════════════════════════
        // PRIORITY 1: Resident has registered passes ("My Passes")
        // ══════════════════════════════════════════════════════════════════
        if (myRegistrations.isNotEmpty()) {
            val candidatePasses = myRegistrations.map { reg ->
                val matchingProg = allPrograms.find { it.id == reg.programId }
                val targetMs = parseScheduleToEpochMs(
                    matchingProg?.startDate ?: reg.programDateTime,
                    matchingProg?.startTime ?: "",
                    matchingProg?.registrationDeadline
                )
                Triple(reg, matchingProg, targetMs)
            }

            // Find nearest upcoming pass in future, or closest one
            val nearestPass = candidatePasses
                .filter { (it.third ?: 0L) > now }
                .minByOrNull { it.third!! }
                ?: candidatePasses.firstOrNull()

            if (nearestPass != null) {
                val (reg, prog, targetMs) = nearestPass
                upcomingProgram = prog
                binding.cardUpcomingSchedule.visibility = View.VISIBLE
                binding.tvUpcomingScheduleBadge.text = "YOUR REGISTERED PASS"
                binding.tvBannerProgramTitle.text = reg.programTitle
                val venue = prog?.venue?.ifBlank { null } ?: reg.programVenue.ifBlank { "Barangay Lapasan Multi-Purpose Hall" }
                val timeStr = prog?.startTime?.ifBlank { null } ?: reg.programDateTime
                binding.tvBannerProgramVenue.text = "$venue • $timeStr"
                binding.btnBannerMyPrograms.text = "View Digital Pass"

                val finalTargetMs = if (targetMs != null && targetMs > now) {
                    targetMs
                } else {
                    parseScheduleToEpochMs(reg.programDateTime, "", null) ?: (now + 86400000L)
                }
                startCountdownWithTargetMs(finalTargetMs)
                return
            }
        }

        // ══════════════════════════════════════════════════════════════════
        // PRIORITY 2: Fallback when resident has NO registered passes
        // Show nearest open civic initiative in Barangay Lapasan
        // ══════════════════════════════════════════════════════════════════
        if (allPrograms.isNotEmpty()) {
            val candidatePrograms = allPrograms.map { prog ->
                val targetMs = parseScheduleToEpochMs(prog.startDate, prog.startTime, prog.registrationDeadline)
                Pair(prog, targetMs)
            }

            val nearestProgram = candidatePrograms
                .filter { it.first.isRegistrationOpen && (it.second ?: 0L) > now }
                .minByOrNull { it.second!! }
                ?.first
                ?: allPrograms.firstOrNull { it.isRegistrationOpen }
                ?: allPrograms.first()

            upcomingProgram = nearestProgram
            binding.cardUpcomingSchedule.visibility = View.VISIBLE
            binding.tvUpcomingScheduleBadge.text = "FEATURED CIVIC INITIATIVE"
            binding.tvBannerProgramTitle.text = nearestProgram.title
            binding.tvBannerProgramVenue.text = "${nearestProgram.venue} • ${nearestProgram.startTime}"
            binding.btnBannerMyPrograms.text = "My Passes"

            val targetMs = parseScheduleToEpochMs(nearestProgram.startDate, nearestProgram.startTime, nearestProgram.registrationDeadline)
            val finalTargetMs = if (targetMs != null && targetMs > now) {
                targetMs
            } else {
                parseScheduleToEpochMs(nearestProgram.startDate, nearestProgram.startTime, null) ?: (now + 86400000L * 3)
            }
            startCountdownWithTargetMs(finalTargetMs)
        } else {
            // ══════════════════════════════════════════════════════════════════
            // PRIORITY 3: No programs in barangay at all -> Hide banner cleanly
            // ══════════════════════════════════════════════════════════════════
            countdownTimer?.cancel()
            upcomingProgram = null
            binding.cardUpcomingSchedule.visibility = View.GONE
        }
    }

    private fun parseScheduleToEpochMs(dateStr: String?, timeStr: String?, deadlineStr: String? = null): Long? {
        val rawDate = dateStr?.trim().orEmpty()
        val rawTime = timeStr?.trim().orEmpty()
        val combined = "$rawDate $rawTime".trim()

        // 1. Day of the week check (e.g., "Saturdays, 8:00 AM", "Sundays", "Wednesday")
        val daysMap = mapOf(
            "sun" to Calendar.SUNDAY,
            "mon" to Calendar.MONDAY,
            "tue" to Calendar.TUESDAY,
            "wed" to Calendar.WEDNESDAY,
            "thu" to Calendar.THURSDAY,
            "fri" to Calendar.FRIDAY,
            "sat" to Calendar.SATURDAY
        )
        for ((key, dayOfWeek) in daysMap) {
            if (rawDate.contains(key, ignoreCase = true) || combined.contains(key, ignoreCase = true)) {
                val cal = Calendar.getInstance()
                cal.set(Calendar.HOUR_OF_DAY, 8)
                cal.set(Calendar.MINUTE, 0)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                while (cal.get(Calendar.DAY_OF_WEEK) != dayOfWeek || cal.timeInMillis <= System.currentTimeMillis()) {
                    cal.add(Calendar.DAY_OF_YEAR, 1)
                }
                return cal.timeInMillis
            }
        }

        // 2. Standard Date Formats
        val formats = listOf(
            SimpleDateFormat("yyyy-MM-dd hh:mm a", Locale.US),
            SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US),
            SimpleDateFormat("yyyy-MM-dd", Locale.US),
            SimpleDateFormat("MMM dd, yyyy hh:mm a", Locale.US),
            SimpleDateFormat("MMM dd, yyyy", Locale.US)
        )

        for (format in formats) {
            try {
                val parsed = format.parse(combined)
                if (parsed != null && parsed.time > 0) return parsed.time
            } catch (_: Exception) {}
        }

        for (format in formats) {
            try {
                val parsed = format.parse(rawDate)
                if (parsed != null && parsed.time > 0) return parsed.time
            } catch (_: Exception) {}
        }

        // 3. Fallback to registrationDeadline (e.g., "2026-10-30")
        if (!deadlineStr.isNullOrBlank()) {
            for (format in formats) {
                try {
                    val parsed = format.parse(deadlineStr.trim())
                    if (parsed != null && parsed.time > 0) return parsed.time
                } catch (_: Exception) {}
            }
        }

        return null
    }

    private fun startCountdownWithTargetMs(targetMs: Long) {
        countdownTimer?.cancel()
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
                val days = TimeUnit.MILLISECONDS.toDays(millisUntilFinished)
                val hours = TimeUnit.MILLISECONDS.toHours(millisUntilFinished) % 24
                val minutes = TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished) % 60
                val seconds = TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) % 60

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
