package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ItemAttendanceRowBinding

class AttendanceAdapter(
    private val onMarkPresent: (Registration) -> Unit,
    private val onMarkAbsent: (Registration) -> Unit
) : ListAdapter<Registration, AttendanceAdapter.AttendanceViewHolder>(AttendanceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AttendanceViewHolder {
        val binding = ItemAttendanceRowBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AttendanceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AttendanceViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class AttendanceViewHolder(
        private val binding: ItemAttendanceRowBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(registration: Registration) {
            val context = binding.root.context
            binding.tvAttendResidentName.text = registration.residentName
            binding.tvAttendResidentPurok.text = registration.residentPurok

            when (registration.attendanceStatus) {
                Registration.ATTENDANCE_PRESENT -> {
                    binding.tvAttendStatusIndicator.text = "Present"
                    binding.tvAttendStatusIndicator.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.badge_present_bg)
                    binding.tvAttendStatusIndicator.setTextColor(
                        ContextCompat.getColor(context, R.color.badge_present_text)
                    )
                }
                Registration.ATTENDANCE_ABSENT -> {
                    binding.tvAttendStatusIndicator.text = "Absent"
                    binding.tvAttendStatusIndicator.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.badge_absent_bg)
                    binding.tvAttendStatusIndicator.setTextColor(
                        ContextCompat.getColor(context, R.color.badge_absent_text)
                    )
                }
                else -> {
                    binding.tvAttendStatusIndicator.text = "Pending"
                    binding.tvAttendStatusIndicator.backgroundTintList =
                        ContextCompat.getColorStateList(context, R.color.badge_pending_bg)
                    binding.tvAttendStatusIndicator.setTextColor(
                        ContextCompat.getColor(context, R.color.badge_pending_text)
                    )
                }
            }

            binding.btnMarkPresent.setOnClickListener {
                onMarkPresent(registration)
            }

            binding.btnMarkAbsent.setOnClickListener {
                onMarkAbsent(registration)
            }
        }
    }

    class AttendanceDiffCallback : DiffUtil.ItemCallback<Registration>() {
        override fun areItemsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem == newItem
    }
}
