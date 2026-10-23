package com.lapasan.apila.data.repository

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.tasks.await

class ProgramRepository {

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            Log.e("ProgramRepo", "Error initializing Firestore", e)
            null
        }
    }

    companion object {
        // Dynamic cache — populated live from Firestore
        val localPrograms = mutableListOf<Program>()
    }

    suspend fun getPrograms(
        categoryFilter: String? = null,
        query: String? = null,
        onlyOpen: Boolean = false,
        forResidentOnly: Boolean = false
    ): Resource<List<Program>> {
        val db = firestore
        if (db != null) {
            try {
                val snapshot = db.collection("programs").get().await()
                val firestoreList = snapshot.documents.map { doc ->
                    val slots = (doc.getLong("slots") ?: doc.getLong("maxCapacity") ?: 100L).toInt()
                    val enrolled = (doc.getLong("enrolledCount") ?: doc.getLong("registeredCount") ?: 0L).toInt()
                    val rawStatus = doc.getString("status")?.trim() ?: "Active"
                    val mappedStatus = when (rawStatus.lowercase()) {
                        "active", "published", "upcoming" -> Program.STATUS_PUBLISHED
                        "completed", "closed" -> Program.STATUS_CLOSED
                        "cancelled" -> Program.STATUS_CANCELLED
                        else -> Program.STATUS_PUBLISHED
                    }
                    val rawSchedule = doc.getString("schedule") ?: doc.getString("startDate") ?: ""
                    val datePart = if (rawSchedule.contains("T")) rawSchedule.split("T")[0] else rawSchedule
                    val timePart = if (rawSchedule.contains("T")) {
                        val t = rawSchedule.split("T").getOrNull(1)?.take(5)
                        if (!t.isNullOrBlank()) t else "08:00 AM"
                    } else {
                        doc.getString("startTime") ?: "08:00 AM"
                    }

                    Program(
                        id = doc.id,
                        title = doc.getString("title") ?: "",
                        category = doc.getString("category") ?: "Civic",
                        description = doc.getString("description") ?: "",
                        venue = doc.getString("location") ?: doc.getString("venue") ?: "Barangay Lapasan Multi-Purpose Hall",
                        startDate = datePart,
                        startTime = timePart,
                        endDate = doc.getString("registrationDeadline") ?: doc.getString("endDate") ?: "",
                        endTime = doc.getString("endTime") ?: "05:00 PM",
                        registrationDeadline = doc.getString("registrationDeadline") ?: "",
                        maxCapacity = slots,
                        registeredCount = enrolled,
                        status = mappedStatus,
                        createdBy = doc.getString("officer") ?: doc.getString("createdBy") ?: "Admin"
                    )
                }
                localPrograms.clear()
                localPrograms.addAll(firestoreList)
                Log.d("ProgramRepo", "Successfully loaded ${firestoreList.size} live programs from Firestore")
            } catch (e: Exception) {
                Log.e("ProgramRepo", "Error fetching live programs from Firestore", e)
            }
        }

        var result = localPrograms.toList()

        if (forResidentOnly) {
            result = result.filter { it.status == Program.STATUS_PUBLISHED }
        }

        if (!categoryFilter.isNullOrBlank() && categoryFilter != "All Categories") {
            result = result.filter { it.category.equals(categoryFilter, ignoreCase = true) }
        }

        if (!query.isNullOrBlank()) {
            val q = query.trim().lowercase()
            result = result.filter {
                it.title.lowercase().contains(q) ||
                it.venue.lowercase().contains(q) ||
                it.description.lowercase().contains(q) ||
                it.category.lowercase().contains(q)
            }
        }

        if (onlyOpen) {
            result = result.filter { it.isRegistrationOpen }
        }

        return Resource.Success(result)
    }

    fun getProgramById(id: String): Program? {
        return localPrograms.find { it.id == id }
    }

    suspend fun saveProgram(program: Program): Resource<Program> {
        val finalProgram = if (program.id.isBlank()) {
            program.copy(id = "prog_" + System.currentTimeMillis())
        } else {
            program
        }

        val index = localPrograms.indexOfFirst { it.id == finalProgram.id }
        if (index >= 0) {
            localPrograms[index] = finalProgram
        } else {
            localPrograms.add(0, finalProgram)
        }

        firestore?.let { db ->
            try {
                val data = hashMapOf(
                    "title" to finalProgram.title,
                    "category" to finalProgram.category,
                    "description" to finalProgram.description,
                    "location" to finalProgram.venue,
                    "schedule" to "${finalProgram.startDate} • ${finalProgram.startTime}",
                    "slots" to finalProgram.maxCapacity,
                    "enrolledCount" to finalProgram.registeredCount,
                    "status" to "Active",
                    "updatedAt" to com.google.firebase.Timestamp.now()
                )
                db.collection("programs").document(finalProgram.id).set(data).await()
            } catch (e: Exception) {
                Log.e("ProgramRepo", "Error saving program to Firestore", e)
            }
        }

        return Resource.Success(finalProgram)
    }

    fun adjustRegistrationCount(programId: String, delta: Int) {
        val index = localPrograms.indexOfFirst { it.id == programId }
        if (index >= 0) {
            val p = localPrograms[index]
            val newCount = (p.registeredCount + delta).coerceIn(0, p.maxCapacity)
            localPrograms[index] = p.copy(registeredCount = newCount)
        }
    }
}
