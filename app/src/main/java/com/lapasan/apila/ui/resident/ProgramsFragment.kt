package com.lapasan.apila.ui.resident

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.chip.Chip
import com.lapasan.apila.R
import com.lapasan.apila.databinding.FragmentProgramsBinding
import com.lapasan.apila.ui.common.ProgramAdapter
import com.lapasan.apila.util.Resource

class ProgramsFragment : Fragment() {

    private var _binding: FragmentProgramsBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var programAdapter: ProgramAdapter

    private var selectedCategory: String = "All Categories"
    private var searchQuery: String = ""
    private var onlyOpenSlots: Boolean = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProgramsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupFilters()

        residentViewModel.pendingCategoryFilter?.let { filter ->
            residentViewModel.pendingCategoryFilter = null
            when {
                filter.contains("Health", true) -> binding.chipHealth.isChecked = true
                filter.contains("Youth", true) || filter.contains("Sports", true) -> binding.chipSports.isChecked = true
                filter.contains("Livelihood", true) || filter.contains("TESDA", true) || filter.contains("Skills", true) -> binding.chipLivelihood.isChecked = true
                filter.contains("Senior", true) -> binding.chipSeniors.isChecked = true
                filter.contains("DRRM", true) || filter.contains("Disaster", true) || filter.contains("Calamity", true) -> binding.chipDisaster.isChecked = true
                filter.contains("Education", true) -> binding.chipEducation.isChecked = true
                else -> binding.chipAll.isChecked = true
            }
        }

        observeViewModel()
        fetchFilteredPrograms()
    }

    private fun setupRecyclerView() {
        programAdapter = ProgramAdapter { program ->
            val intent = Intent(requireContext(), ProgramDetailActivity::class.java).apply {
                putExtra(ProgramDetailActivity.EXTRA_PROGRAM, program)
            }
            startActivity(intent)
        }
        binding.rvPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvPrograms.adapter = programAdapter

        binding.swipeRefreshPrograms.setOnRefreshListener {
            fetchFilteredPrograms()
        }
    }

    private fun setupFilters() {
        // Search Input Watcher
        binding.etSearchPrograms.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                searchQuery = s?.toString().orEmpty()
                binding.btnClearSearch.visibility = if (searchQuery.isNotEmpty()) View.VISIBLE else View.GONE
                fetchFilteredPrograms()
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnClearSearch.setOnClickListener {
            binding.etSearchPrograms.setText("")
        }

        // Chip Category Selection
        binding.chipGroupCategories.setOnCheckedStateChangeListener { group, checkedIds ->
            if (checkedIds.isNotEmpty()) {
                val chip = group.findViewById<Chip>(checkedIds.first())
                selectedCategory = chip?.text?.toString() ?: "All Categories"
            } else {
                selectedCategory = "All Categories"
            }
            fetchFilteredPrograms()
        }

        // Switch Open Only
        binding.switchOpenOnly.setOnCheckedChangeListener { _, isChecked ->
            onlyOpenSlots = isChecked
            fetchFilteredPrograms()
        }
    }

    private fun fetchFilteredPrograms() {
        val cat = if (selectedCategory == "All Categories") null else selectedCategory
        val query = if (searchQuery.isBlank()) null else searchQuery
        residentViewModel.loadPrograms(categoryFilter = cat, query = query, onlyOpen = onlyOpenSlots)
    }

    private fun observeViewModel() {
        residentViewModel.programs.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefreshPrograms.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                val list = resource.data ?: emptyList()
                programAdapter.submitList(list)

                binding.tvProgramCount.text = "Showing ${list.size} programs"

                if (list.isEmpty()) {
                    binding.rvPrograms.visibility = View.GONE
                    binding.layoutEmptyPrograms.visibility = View.VISIBLE
                } else {
                    binding.rvPrograms.visibility = View.VISIBLE
                    binding.layoutEmptyPrograms.visibility = View.GONE
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
