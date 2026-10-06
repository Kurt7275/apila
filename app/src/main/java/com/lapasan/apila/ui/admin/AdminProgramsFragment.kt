package com.lapasan.apila.ui.admin

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
import com.lapasan.apila.databinding.FragmentAdminProgramsBinding
import com.lapasan.apila.ui.common.AdminProgramAdapter
import com.lapasan.apila.util.Resource

class AdminProgramsFragment : Fragment() {

    private var _binding: FragmentAdminProgramsBinding? = null
    private val binding get() = _binding!!

    private val adminViewModel: AdminViewModel by activityViewModels()
    private lateinit var programAdapter: AdminProgramAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminProgramsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupListeners()
        observeViewModel()
        adminViewModel.loadPrograms()
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
        binding.rvAdminPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvAdminPrograms.adapter = programAdapter

        binding.swipeRefreshAdminPrograms.setOnRefreshListener {
            adminViewModel.loadPrograms()
        }
    }

    private fun setupListeners() {
        binding.fabCreateProgram.setOnClickListener {
            startActivity(Intent(requireContext(), AdminCreateEditProgramActivity::class.java))
        }

        binding.etAdminSearchPrograms.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adminViewModel.loadPrograms(query = s?.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun observeViewModel() {
        adminViewModel.programs.observe(viewLifecycleOwner) { resource ->
            binding.swipeRefreshAdminPrograms.isRefreshing = resource is Resource.Loading
            if (resource is Resource.Success) {
                programAdapter.submitList(resource.data ?: emptyList())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
