package com.lapasan.apila.ui.resident

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.FragmentMyProgramsBinding
import com.lapasan.apila.ui.common.RegistrationAdapter
import com.lapasan.apila.util.Resource

class MyProgramsFragment : Fragment() {

    private var _binding: FragmentMyProgramsBinding? = null
    private val binding get() = _binding!!

    private val residentViewModel: ResidentViewModel by activityViewModels()
    private lateinit var registrationAdapter: RegistrationAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyProgramsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupListeners()
        observeViewModel()
        residentViewModel.loadMyPrograms()
    }

    private fun setupRecyclerView() {
        registrationAdapter = RegistrationAdapter { registration ->
            showCancelConfirmation(registration)
        }
        binding.rvMyPrograms.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMyPrograms.adapter = registrationAdapter

        binding.swipeRefreshMyPrograms.setOnRefreshListener {
            residentViewModel.loadMyPrograms()
            binding.swipeRefreshMyPrograms.isRefreshing = false
        }
    }

    private fun setupListeners() {
        binding.btnEmptyBrowse.setOnClickListener {
            (activity as? ResidentMainActivity)?.navigateToTab(R.id.nav_programs)
        }
    }

    private fun showCancelConfirmation(registration: Registration) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.confirm_cancel_title)
            .setMessage(getString(R.string.confirm_cancel_msg))
            .setPositiveButton("Yes, Cancel") { _, _ ->
                residentViewModel.cancelRegistration(registration.id)
            }
            .setNegativeButton("Keep Registration", null)
            .show()
    }

    private fun observeViewModel() {
        residentViewModel.activeRegistrations.observe(viewLifecycleOwner) { list ->
            registrationAdapter.submitList(list)
            if (list.isEmpty()) {
                binding.rvMyPrograms.visibility = View.GONE
                binding.layoutEmptyMyPrograms.visibility = View.VISIBLE
            } else {
                binding.rvMyPrograms.visibility = View.VISIBLE
                binding.layoutEmptyMyPrograms.visibility = View.GONE
            }
        }

        residentViewModel.cancelAction.observe(viewLifecycleOwner) { resource ->
            if (resource is Resource.Success) {
                Toast.makeText(requireContext(), "Registration cancelled successfully.", Toast.LENGTH_SHORT).show()
                residentViewModel.clearActionState()
            } else if (resource is Resource.Error) {
                Toast.makeText(requireContext(), resource.message ?: "Cancellation failed", Toast.LENGTH_SHORT).show()
                residentViewModel.clearActionState()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
