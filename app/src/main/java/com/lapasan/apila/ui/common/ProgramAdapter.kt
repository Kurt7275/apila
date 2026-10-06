package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.databinding.ItemProgramCardBinding

class ProgramAdapter(
    private val onProgramClick: (Program) -> Unit
) : ListAdapter<Program, ProgramAdapter.ProgramViewHolder>(ProgramDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProgramViewHolder {
        val binding = ItemProgramCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ProgramViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProgramViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ProgramViewHolder(
        private val binding: ItemProgramCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(program: Program) {
            binding.tvCardTitle.text = program.title
            binding.tvCardCategory.text = program.category
            binding.tvCardDateTime.text = "${program.startDate} • ${program.startTime}"
            binding.tvCardVenue.text = program.venue

            val available = program.availableSlots
            val max = program.maxCapacity
            binding.pbCardSlots.max = max
            binding.pbCardSlots.progress = program.registeredCount

            if (program.isFull) {
                binding.tvCardSlotsLeft.text = "Slots Full"
                binding.tvCardSlotsLeft.setTextColor(ContextCompat.getColor(binding.root.context, R.color.status_closed_text))
                binding.tvCardStatus.text = "Closed"
                binding.tvCardStatus.backgroundTintList = ContextCompat.getColorStateList(binding.root.context, R.color.status_closed_bg)
                binding.tvCardStatus.setTextColor(ContextCompat.getColor(binding.root.context, R.color.status_closed_text))
                binding.pbCardSlots.progressTintList = ContextCompat.getColorStateList(binding.root.context, R.color.status_closed_text)
            } else {
                binding.tvCardSlotsLeft.text = "$available slots left"
                binding.tvCardSlotsLeft.setTextColor(ContextCompat.getColor(binding.root.context, R.color.brand_orange))
                binding.tvCardStatus.text = "Open"
                binding.tvCardStatus.backgroundTintList = ContextCompat.getColorStateList(binding.root.context, R.color.status_open_bg)
                binding.tvCardStatus.setTextColor(ContextCompat.getColor(binding.root.context, R.color.status_open_text))
                binding.pbCardSlots.progressTintList = ContextCompat.getColorStateList(binding.root.context, R.color.brand_orange)
            }

            binding.cardProgram.setOnClickListener {
                onProgramClick(program)
            }
        }
    }

    class ProgramDiffCallback : DiffUtil.ItemCallback<Program>() {
        override fun areItemsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem == newItem
    }
}
