package com.lapasan.apila.data.model

import java.io.Serializable

data class Announcement(
    val id: String = "",
    val title: String = "",
    val content: String = "",
    val authorName: String = "Barangay Lapasan Council",
    val publishedAt: Long = System.currentTimeMillis(),
    val priority: String = PRIORITY_NORMAL, // "normal" or "urgent"
    val targetProgramId: String? = null
) : Serializable {

    companion object {
        const val PRIORITY_NORMAL = "normal"
        const val PRIORITY_URGENT = "urgent"
    }

    val isUrgent: Boolean
        get() = priority == PRIORITY_URGENT
}
