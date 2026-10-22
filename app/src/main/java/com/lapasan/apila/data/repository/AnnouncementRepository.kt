package com.lapasan.apila.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.tasks.await

class AnnouncementRepository {

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    companion object {
        val localAnnouncements = mutableListOf(
            Announcement(
                id = "ann_001",
                title = "Reminder: Free Medical & Dental Mission Slot Reservation",
                content = "Please be advised that registration for the upcoming Lapasan Medical & Dental Mission is now open. Don't forget to bring your valid ID or Barangay Resident Certificate on the day of the event.",
                authorName = "Hon. Roberto Delos Reyes (Barangay Captain)",
                publishedAt = System.currentTimeMillis() - 3600000L * 5,
                priority = Announcement.PRIORITY_URGENT,
                targetProgramId = "prog_001"
            ),
            Announcement(
                id = "ann_002",
                title = "Inter-Purok Basketball League Screening & Roster Submission",
                content = "Team captains of all Puroks in Lapasan must submit the final line-up and medical clearance to the SK Office on or before October 18, 2026.",
                authorName = "SK Chairman Lapasan",
                publishedAt = System.currentTimeMillis() - 86400000L * 1,
                priority = Announcement.PRIORITY_NORMAL,
                targetProgramId = "prog_002"
            ),
            Announcement(
                id = "ann_003",
                title = "Notice: TESDA Bread & Pastry Slots Now Full",
                content = "Thank you for the tremendous interest in our TESDA livelihood program. All 25 slots are currently occupied. We will announce the next batch schedule soon.",
                authorName = "Livelihood Committee Head",
                publishedAt = System.currentTimeMillis() - 86400000L * 2,
                priority = Announcement.PRIORITY_NORMAL,
                targetProgramId = "prog_003"
            )
        )
    }

    suspend fun getAnnouncements(): Resource<List<Announcement>> {
        val db = firestore
        if (db != null) {
            try {
                val snapshot = db.collection("announcements").get().await()
                if (!snapshot.isEmpty) {
                    val list = snapshot.documents.map { doc ->
                        val rawPriority = doc.getString("priority")?.lowercase() ?: "normal"
                        val mappedPriority = if (rawPriority.contains("urgent")) Announcement.PRIORITY_URGENT else Announcement.PRIORITY_NORMAL
                        Announcement(
                            id = doc.id,
                            title = doc.getString("title") ?: "",
                            content = doc.getString("message") ?: doc.getString("content") ?: "",
                            authorName = doc.getString("publishedBy") ?: doc.getString("authorName") ?: "Barangay Lapasan Council",
                            publishedAt = doc.getTimestamp("createdAt")?.toDate()?.time ?: System.currentTimeMillis(),
                            priority = mappedPriority,
                            targetProgramId = doc.getString("targetProgramId")
                        )
                    }
                    list.forEach { ann ->
                        val index = localAnnouncements.indexOfFirst { it.id == ann.id }
                        if (index >= 0) localAnnouncements[index] = ann else localAnnouncements.add(0, ann)
                    }
                }
            } catch (_: Exception) {}
        }
        return Resource.Success(localAnnouncements.sortedByDescending { it.publishedAt })
    }

    suspend fun publishAnnouncement(announcement: Announcement): Resource<Announcement> {
        val finalAnn = if (announcement.id.isBlank()) {
            announcement.copy(id = "ann_" + System.currentTimeMillis())
        } else {
            announcement
        }

        localAnnouncements.add(0, finalAnn)

        firestore?.let { db ->
            try {
                db.collection("announcements").document(finalAnn.id).set(finalAnn).await()
            } catch (_: Exception) {}
        }

        return Resource.Success(finalAnn)
    }
}
