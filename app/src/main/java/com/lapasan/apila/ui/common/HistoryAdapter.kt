package com.lapasan.apila.ui.common

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ItemHistoryCardBinding

class HistoryAdapter : ListAdapter<Registration, HistoryAdapter.HistoryViewHolder>(HistoryDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemHistoryCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class HistoryViewHolder(
        private val binding: ItemHistoryCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(registration: Registration) {
            val context = binding.root.context
            binding.tvHistoryTitle.text = registration.programTitle
            binding.tvHistoryCategory.text = registration.programCategory.ifBlank { "Community Program" }
            binding.tvHistoryDate.text = registration.programDateTime
            binding.tvHistoryVenue.text = registration.programVenue
            binding.tvHistoryRecordId.text = "RECORD #" + registration.id.takeLast(6).uppercase()

            when {
                registration.status == Registration.STATUS_CANCELLED -> {
                    binding.tvHistoryAttendanceBadge.text = "Cancelled"
                    binding.tvHistoryAttendanceBadge.background =
                        ContextCompat.getDrawable(context, R.drawable.bg_badge_attendance_cancelled)
                    binding.tvHistoryAttendanceBadge.setTextColor(Color.parseColor("#64748B"))
                    binding.tvHistoryVerifiedLabel.text = "Cancelled Registration"
                }
                registration.attendanceStatus == Registration.ATTENDANCE_PRESENT -> {
                    binding.tvHistoryAttendanceBadge.text = "Attended"
                    binding.tvHistoryAttendanceBadge.background =
                        ContextCompat.getDrawable(context, R.drawable.bg_badge_attendance_present)
                    binding.tvHistoryAttendanceBadge.setTextColor(Color.parseColor("#15803D"))
                    binding.tvHistoryVerifiedLabel.text = "Verified Attendance"
                }
                registration.attendanceStatus == Registration.ATTENDANCE_ABSENT -> {
                    binding.tvHistoryAttendanceBadge.text = "Absent"
                    binding.tvHistoryAttendanceBadge.background =
                        ContextCompat.getDrawable(context, R.drawable.bg_badge_attendance_absent)
                    binding.tvHistoryAttendanceBadge.setTextColor(Color.parseColor("#B91C1C"))
                    binding.tvHistoryVerifiedLabel.text = "Official Attendance Record"
                }
                else -> {
                    binding.tvHistoryAttendanceBadge.text = "Completed"
                    binding.tvHistoryAttendanceBadge.background =
                        ContextCompat.getDrawable(context, R.drawable.bg_badge_attendance_pending)
                    binding.tvHistoryAttendanceBadge.setTextColor(Color.parseColor("#B45309"))
                    binding.tvHistoryVerifiedLabel.text = "Archived Record"
                }
            }
        }
    }

    class HistoryDiffCallback : DiffUtil.ItemCallback<Registration>() {
        override fun areItemsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem == newItem
    }
}
