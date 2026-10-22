package com.lapasan.apila.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.tasks.await

class ProgramRepository {

    private val firestore: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    companion object {
        // Clean dynamic cache — no hardcoded sample data
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
                    Program(
                        id = doc.id,
                        title = doc.getString("title") ?: "",
                        category = doc.getString("category") ?: "Civic",
                        description = doc.getString("description") ?: "",
                        venue = doc.getString("location") ?: doc.getString("venue") ?: "Barangay Lapasan Multi-Purpose Hall",
                        startDate = doc.getString("schedule") ?: doc.getString("startDate") ?: "",
                        startTime = doc.getString("startTime") ?: "08:00 AM",
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
            } catch (_: Exception) {}
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
                    "officer" to finalProgram.createdBy
                )
                db.collection("programs").document(finalProgram.id).set(data).await()
            } catch (_: Exception) {}
        }

        return Resource.Success(finalProgram)
    }

    suspend fun updateProgramStatus(programId: String, newStatus: String): Resource<Boolean> {
        val index = localPrograms.indexOfFirst { it.id == programId }
        if (index >= 0) {
            val updated = localPrograms[index].copy(status = newStatus)
            localPrograms[index] = updated
            firestore?.let { db ->
                try {
                    db.collection("programs").document(programId).update("status", newStatus).await()
                } catch (_: Exception) {}
            }
            return Resource.Success(true)
        }
        return Resource.Error("Program not found")
    }

    fun adjustRegistrationCount(programId: String, delta: Int) {
        val index = localPrograms.indexOfFirst { it.id == programId }
        if (index >= 0) {
            val p = localPrograms[index]
            val newCount = (p.registeredCount + delta).coerceIn(0, p.maxCapacity)
            localPrograms[index] = p.copy(registeredCount = newCount)
            firestore?.let { db ->
                db.collection("programs").document(programId).update(
                    "enrolledCount", newCount,
                    "registeredCount", newCount
                )
            }
        }
    }
}
