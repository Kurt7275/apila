package com.lapasan.apila.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
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

    private var announcementsListener: ListenerRegistration? = null

    companion object {
        // Clean dynamic cache — no hardcoded sample announcements
        val localAnnouncements = mutableListOf<Announcement>()
    }

    fun listenToAnnouncements(onUpdate: (List<Announcement>) -> Unit): ListenerRegistration? {
        val db = firestore ?: return null
        announcementsListener?.remove()

        announcementsListener = db.collection("announcements")
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                if (snapshot != null) {
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
                    localAnnouncements.clear()
                    localAnnouncements.addAll(list)
                    onUpdate(localAnnouncements.sortedByDescending { it.publishedAt })
                }
            }
        return announcementsListener
    }

    suspend fun getAnnouncements(): Resource<List<Announcement>> {
        val db = firestore
        if (db != null) {
            try {
                val snapshot = db.collection("announcements").get().await()
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
                localAnnouncements.clear()
                localAnnouncements.addAll(list)
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
                val data = hashMapOf(
                    "title" to finalAnn.title,
                    "message" to finalAnn.content,
                    "category" to "General Advisory",
                    "priority" to (if (finalAnn.priority == Announcement.PRIORITY_URGENT) "Urgent" else "Normal"),
                    "targetAudience" to "All Residents",
                    "publishedBy" to finalAnn.authorName,
                    "createdAt" to com.google.firebase.Timestamp.now()
                )
                db.collection("announcements").document(finalAnn.id).set(data).await()
            } catch (_: Exception) {}
        }

        return Resource.Success(finalAnn)
    }
}
