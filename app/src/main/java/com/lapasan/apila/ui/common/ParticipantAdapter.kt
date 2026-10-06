package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ItemParticipantRowBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ParticipantAdapter : ListAdapter<Registration, ParticipantAdapter.ParticipantViewHolder>(ParticipantDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ParticipantViewHolder {
        val binding = ItemParticipantRowBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ParticipantViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ParticipantViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ParticipantViewHolder(
        private val binding: ItemParticipantRowBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(registration: Registration) {
            val context = binding.root.context
            binding.tvParticipantName.text = registration.residentName
            binding.tvParticipantPurok.text = registration.residentPurok
            binding.tvParticipantPhone.text = registration.residentPhone

            val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            binding.tvParticipantRegDate.text = "Reg: " + sdf.format(Date(registration.registeredAt))

            if (registration.status == Registration.STATUS_CONFIRMED) {
                binding.tvParticipantStatus.text = "Confirmed"
                binding.tvParticipantStatus.backgroundTintList =
                    ContextCompat.getColorStateList(context, R.color.status_open_bg)
                binding.tvParticipantStatus.setTextColor(
                    ContextCompat.getColor(context, R.color.status_open_text)
                )
            } else {
                binding.tvParticipantStatus.text = "Cancelled"
                binding.tvParticipantStatus.backgroundTintList =
                    ContextCompat.getColorStateList(context, R.color.badge_absent_bg)
                binding.tvParticipantStatus.setTextColor(
                    ContextCompat.getColor(context, R.color.badge_absent_text)
                )
            }
        }
    }

    class ParticipantDiffCallback : DiffUtil.ItemCallback<Registration>() {
        override fun areItemsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem == newItem
    }
}
