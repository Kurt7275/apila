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
        // Seed realistic programs for Barangay Lapasan, Cagayan de Oro City
        val localPrograms = mutableListOf(
            Program(
                id = "prog_001",
                title = "Barangay Lapasan Medical & Dental Mission",
                category = "Health & Wellness",
                description = "Free medical check-up, pediatric consultations, tooth extraction, and distribution of essential maintenance medicines for residents of Lapasan. Priority for senior citizens and indigent families.",
                venue = "Lapasan Covered Court",
                startDate = "Oct 15, 2026",
                startTime = "08:00 AM",
                endDate = "Oct 15, 2026",
                endTime = "03:00 PM",
                registrationDeadline = "Oct 14, 2026",
                maxCapacity = 100,
                registeredCount = 42,
                status = Program.STATUS_PUBLISHED,
                createdBy = "demo_admin_001"
            ),
            Program(
                id = "prog_002",
                title = "Inter-Purok Youth Basketball & Volleyball League",
                category = "Youth & Sports",
                description = "Annual Barangay Lapasan summer league aimed at promoting youth camaraderie, fitness, and anti-drug advocacy. Open to residents aged 15-24.",
                venue = "Lapasan Gymnasium & Plaza",
                startDate = "Oct 20, 2026",
                startTime = "01:00 PM",
                endDate = "Nov 10, 2026",
                endTime = "06:00 PM",
                registrationDeadline = "Oct 18, 2026",
                maxCapacity = 80,
                registeredCount = 76,
                status = Program.STATUS_PUBLISHED,
                createdBy = "demo_admin_001"
            ),
            Program(
                id = "prog_003",
                title = "TESDA Livelihood Skills Training: Bread & Pastry",
                category = "Livelihood & Skills Training",
                description = "A 5-day hands-on baking and pastry making certification course in partnership with TESDA Region X. Free ingredients and training kit provided.",
                venue = "Barangay Lapasan Training Hall (2nd Floor)",
                startDate = "Nov 02, 2026",
                startTime = "09:00 AM",
                endDate = "Nov 06, 2026",
                endTime = "04:00 PM",
                registrationDeadline = "Oct 28, 2026",
                maxCapacity = 25,
                registeredCount = 25,
                status = Program.STATUS_PUBLISHED, // Slots are full!
                createdBy = "demo_admin_001"
            ),
            Program(
                id = "prog_004",
                title = "Senior Citizens Wellness Day & Free Eye Exam",
                category = "Senior Citizens Welfare",
                description = "Free optical examination, reading eyeglasses distribution, and health symposium for all registered senior citizens of Barangay Lapasan.",
                venue = "Lapasan Senior Citizens Center",
                startDate = "Nov 12, 2026",
                startTime = "08:30 AM",
                endDate = "Nov 12, 2026",
                endTime = "01:00 PM",
                registrationDeadline = "Nov 10, 2026",
                maxCapacity = 60,
                registeredCount = 18,
                status = Program.STATUS_PUBLISHED,
                createdBy = "demo_admin_001"
            ),
            Program(
                id = "prog_005",
                title = "BDRRMC Community Flood & Earthquake Evacuation Drill",
                category = "Disaster Preparedness & Safety",
                description = "Community disaster drill focusing on flood-prone zones near Bitan-ag creek and coastal Lapasan. First aid training and emergency response orientation.",
                venue = "Lapasan Central School Grounds",
                startDate = "Nov 18, 2026",
                startTime = "06:00 AM",
                endDate = "Nov 18, 2026",
                endTime = "11:00 AM",
                registrationDeadline = "Nov 16, 2026",
                maxCapacity = 150,
                registeredCount = 35,
                status = Program.STATUS_PUBLISHED,
                createdBy = "demo_admin_001"
            ),
            Program(
                id = "prog_006",
                title = "Digital Literacy & Online Job Readiness Workshop",
                category = "Education & Literacy",
                description = "Basic computer operations, internet safety, and introduction to freelance virtual assistance for out-of-school youth and job seekers.",
                venue = "Barangay Lapasan e-Library",
                startDate = "Nov 25, 2026",
                startTime = "01:00 PM",
                endDate = "Nov 27, 2026",
                endTime = "05:00 PM",
                registrationDeadline = "Nov 22, 2026",
                maxCapacity = 30,
                registeredCount = 12,
                status = Program.STATUS_PUBLISHED,
                createdBy = "demo_admin_001"
            )
        )
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
                if (!snapshot.isEmpty) {
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
                    // merge into local cache
                    firestoreList.forEach { fp ->
                        val index = localPrograms.indexOfFirst { it.id == fp.id }
                        if (index >= 0) localPrograms[index] = fp else localPrograms.add(fp)
                    }
                }
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
                db.collection("programs").document(finalProgram.id).set(finalProgram).await()
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
                db.collection("programs").document(programId).update("registeredCount", newCount)
            }
        }
    }
}
