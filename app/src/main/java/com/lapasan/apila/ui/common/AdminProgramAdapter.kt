package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.databinding.ItemAdminProgramCardBinding

class AdminProgramAdapter(
    private val onViewParticipants: (Program) -> Unit,
    private val onRecordAttendance: (Program) -> Unit,
    private val onProgramClick: (Program) -> Unit
) : ListAdapter<Program, AdminProgramAdapter.AdminProgramViewHolder>(AdminProgramDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AdminProgramViewHolder {
        val binding = ItemAdminProgramCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AdminProgramViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AdminProgramViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class AdminProgramViewHolder(
        private val binding: ItemAdminProgramCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(program: Program) {
            val context = binding.root.context
            binding.tvAdminProgramTitle.text = program.title
            binding.tvAdminProgramCategory.text = program.category
            binding.tvAdminProgramSchedule.text = "${program.startDate} • ${program.startTime} • ${program.venue}"

            binding.pbAdminSlots.max = program.maxCapacity
            binding.pbAdminSlots.progress = program.registeredCount

            val left = program.availableSlots
            binding.tvAdminSlotsCount.text = "${program.registeredCount} / ${program.maxCapacity} registered ($left slots left)"

            when (program.status) {
                Program.STATUS_PUBLISHED -> {
                    binding.tvAdminProgramStatus.text = "Published"
                    binding.tvAdminProgramStatus.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.status_open_bg)
                    binding.tvAdminProgramStatus.setTextColor(
                        ContextCompat.getColor(context, R.color.status_open_text)
                    )
                }
                Program.STATUS_CLOSED -> {
                    binding.tvAdminProgramStatus.text = "Closed"
                    binding.tvAdminProgramStatus.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.status_closed_bg)
                    binding.tvAdminProgramStatus.setTextColor(
                        ContextCompat.getColor(context, R.color.status_closed_text)
                    )
                }
                Program.STATUS_DRAFT -> {
                    binding.tvAdminProgramStatus.text = "Draft"
                    binding.tvAdminProgramStatus.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.badge_pending_bg)
                    binding.tvAdminProgramStatus.setTextColor(
                        ContextCompat.getColor(context, R.color.badge_pending_text)
                    )
                }
                else -> {
                    binding.tvAdminProgramStatus.text = "Cancelled"
                    binding.tvAdminProgramStatus.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.surface_variant)
                    binding.tvAdminProgramStatus.setTextColor(
                        ContextCompat.getColor(context, R.color.text_tertiary)
                    )
                }
            }

            binding.btnViewParticipants.setOnClickListener {
                onViewParticipants(program)
            }

            binding.btnRecordAttendance.setOnClickListener {
                onRecordAttendance(program)
            }

            binding.cardAdminProgram.setOnClickListener {
                onProgramClick(program)
            }
        }
    }

    class AdminProgramDiffCallback : DiffUtil.ItemCallback<Program>() {
        override fun areItemsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem == newItem
    }
}
