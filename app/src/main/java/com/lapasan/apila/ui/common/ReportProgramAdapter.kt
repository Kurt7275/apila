package com.lapasan.apila.ui.common

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.databinding.ItemReportProgramRowBinding

class ReportProgramAdapter : ListAdapter<Program, ReportProgramAdapter.ReportViewHolder>(ReportDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReportViewHolder {
        val binding = ItemReportProgramRowBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ReportViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReportViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ReportViewHolder(
        private val binding: ItemReportProgramRowBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(program: Program) {
            val context = binding.root.context
            binding.tvReportProgramTitle.text = program.title
            val percent = program.percentOccupied
            binding.tvReportPercent.text = "$percent%"
            binding.tvReportSlotsRatio.text = "${program.registeredCount} / ${program.maxCapacity} slots filled (${program.availableSlots} remaining)"

            binding.pbReportFill.max = program.maxCapacity
            binding.pbReportFill.progress = program.registeredCount

            if (percent >= 100) {
                binding.tvReportPercent.setTextColor(ContextCompat.getColor(context, R.color.status_closed_text))
                binding.tvReportPercent.backgroundTintList = ContextCompat.getColorStateList(context, R.color.status_closed_bg)
                binding.pbReportFill.progressTintList = ContextCompat.getColorStateList(context, R.color.status_closed_text)
            } else {
                binding.tvReportPercent.setTextColor(ContextCompat.getColor(context, R.color.brand_orange))
                binding.tvReportPercent.backgroundTintList = ContextCompat.getColorStateList(context, R.color.brand_orange_light)
                binding.pbReportFill.progressTintList = ContextCompat.getColorStateList(context, R.color.brand_orange)
            }
        }
    }

    class ReportDiffCallback : DiffUtil.ItemCallback<Program>() {
        override fun areItemsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Program, newItem: Program): Boolean = oldItem == newItem
    }
}
