package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ItemRegistrationCardBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RegistrationAdapter(
    private val onCancelClick: (Registration) -> Unit
) : ListAdapter<Registration, RegistrationAdapter.RegistrationViewHolder>(RegistrationDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RegistrationViewHolder {
        val binding = ItemRegistrationCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RegistrationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RegistrationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RegistrationViewHolder(
        private val binding: ItemRegistrationCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(registration: Registration) {
            val passId = registration.id.takeLast(6).uppercase()
            binding.tvRegPassNumber.text = "REG-PASS #$passId"
            binding.tvRegStatusBadge.text = registration.status.replaceFirstChar { it.uppercase() }
            binding.tvRegProgramTitle.text = registration.programTitle
            binding.tvRegSchedule.text = registration.programDateTime
            binding.tvRegVenue.text = registration.programVenue

            val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val dateStr = dateFormat.format(Date(registration.registeredAt))
            binding.tvRegisteredDate.text = dateStr

            binding.btnCancelRegistration.setOnClickListener {
                onCancelClick(registration)
            }
        }
    }

    class RegistrationDiffCallback : DiffUtil.ItemCallback<Registration>() {
        override fun areItemsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Registration, newItem: Registration): Boolean = oldItem == newItem
    }
}
