package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.databinding.ItemRegistrationCardBinding
import com.lapasan.apila.util.QrCodeGenerator
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
            val statusUpper = registration.status.replaceFirstChar { it.uppercase() }
            binding.tvRegStatusBadge.text = statusUpper
            binding.tvRegProgramTitle.text = registration.programTitle
            binding.tvRegSchedule.text = registration.programDateTime
            binding.tvRegVenue.text = registration.programVenue

            val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val dateStr = dateFormat.format(Date(registration.registeredAt))
            binding.tvRegisteredDate.text = dateStr

            // Render Scannable QR Code Matrix
            val qrBitmap = QrCodeGenerator.generate(registration.id, 400)
            if (qrBitmap != null) {
                binding.ivPassQrCode.setImageBitmap(qrBitmap)
                binding.layoutQrPass.visibility = View.VISIBLE
            } else {
                binding.layoutQrPass.visibility = View.GONE
            }

            binding.tvQrCodeString.text = "PASS-ID: ${registration.id}"

            val isApproved = registration.status.lowercase() in listOf("approved", "confirmed")
            if (isApproved) {
                binding.tvQrInstruction.text = "Active Pass • Present to staff at venue check-in"
                binding.tvQrInstruction.setTextColor(ContextCompat.getColor(itemView.context, R.color.brand_orange))
                binding.ivPassQrCode.alpha = 1.0f
            } else if (registration.status.lowercase() == "pending") {
                binding.tvQrInstruction.text = "Pending Review • QR activates upon approval"
                binding.tvQrInstruction.setTextColor(ContextCompat.getColor(itemView.context, R.color.badge_pending_text))
                binding.ivPassQrCode.alpha = 0.45f
            } else {
                binding.tvQrInstruction.text = "Registration Rejected"
                binding.tvQrInstruction.setTextColor(ContextCompat.getColor(itemView.context, R.color.status_closed_text))
                binding.ivPassQrCode.alpha = 0.2f
            }

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
