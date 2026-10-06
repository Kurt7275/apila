package com.lapasan.apila.ui.common

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lapasan.apila.R
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.databinding.ItemAnnouncementCardBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AnnouncementAdapter(
    private val onItemClick: ((Announcement) -> Unit)? = null
) : ListAdapter<Announcement, AnnouncementAdapter.AnnouncementViewHolder>(AnnouncementDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AnnouncementViewHolder {
        val binding = ItemAnnouncementCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AnnouncementViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AnnouncementViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class AnnouncementViewHolder(
        private val binding: ItemAnnouncementCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(announcement: Announcement) {
            val context = binding.root.context
            binding.tvAnnouncementTitle.text = announcement.title
            binding.tvAnnouncementContent.text = announcement.content
            binding.tvAnnouncementAuthor.text = "Issued by: ${announcement.authorName}"

            val diff = System.currentTimeMillis() - announcement.publishedAt
            val timeText = when {
                diff < 0 -> "Just now"
                diff < 60 * 60 * 1000 -> "${(diff / (60 * 1000)).coerceAtLeast(1)}m ago"
                diff < 24 * 60 * 60 * 1000 -> "${diff / (60 * 60 * 1000)}h ago"
                else -> {
                    val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                    sdf.format(Date(announcement.publishedAt))
                }
            }
            binding.tvAnnouncementDate.text = timeText

            if (announcement.isUrgent) {
                binding.tvAnnouncementPriority.text = "Urgent Alert"
                binding.tvAnnouncementPriority.background =
                    ContextCompat.getDrawable(context, R.drawable.bg_badge_urgent)
                binding.tvAnnouncementPriority.setTextColor(Color.parseColor("#DC2626"))
            } else {
                binding.tvAnnouncementPriority.text = "Official Advisory"
                binding.tvAnnouncementPriority.background =
                    ContextCompat.getDrawable(context, R.drawable.bg_badge_advisory)
                binding.tvAnnouncementPriority.setTextColor(
                    ContextCompat.getColor(context, R.color.brand_orange)
                )
            }

            binding.cardAnnouncement.setOnClickListener {
                onItemClick?.invoke(announcement)
            }
        }
    }

    class AnnouncementDiffCallback : DiffUtil.ItemCallback<Announcement>() {
        override fun areItemsTheSame(oldItem: Announcement, newItem: Announcement): Boolean = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Announcement, newItem: Announcement): Boolean = oldItem == newItem
    }
}
