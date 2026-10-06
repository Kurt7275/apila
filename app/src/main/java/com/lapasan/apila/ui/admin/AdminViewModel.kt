package com.lapasan.apila.ui.admin

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.data.model.DashboardStats
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.data.repository.AnnouncementRepository
import com.lapasan.apila.data.repository.ProgramRepository
import com.lapasan.apila.data.repository.RegistrationRepository
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.launch

class AdminViewModel(
    private val programRepository: ProgramRepository = ProgramRepository(),
    private val registrationRepository: RegistrationRepository = RegistrationRepository(),
    private val announcementRepository: AnnouncementRepository = AnnouncementRepository()
) : ViewModel() {

    private val _dashboardStats = MutableLiveData<DashboardStats>()
    val dashboardStats: LiveData<DashboardStats> = _dashboardStats

    private val _programs = MutableLiveData<Resource<List<Program>>>()
    val programs: LiveData<Resource<List<Program>>> = _programs

    private val _participants = MutableLiveData<List<Registration>>()
    val participants: LiveData<List<Registration>> = _participants

    private val _announcements = MutableLiveData<Resource<List<Announcement>>>()
    val announcements: LiveData<Resource<List<Announcement>>> = _announcements

    private val _saveProgramState = MutableLiveData<Resource<Program>?>()
    val saveProgramState: LiveData<Resource<Program>?> = _saveProgramState

    private val _statusChangeState = MutableLiveData<Resource<Boolean>?>()
    val statusChangeState: LiveData<Resource<Boolean>?> = _statusChangeState

    private val _attendanceUpdateState = MutableLiveData<Resource<Boolean>?>()
    val attendanceUpdateState: LiveData<Resource<Boolean>?> = _attendanceUpdateState

    private val _publishAnnouncementState = MutableLiveData<Resource<Announcement>?>()
    val publishAnnouncementState: LiveData<Resource<Announcement>?> = _publishAnnouncementState

    fun loadDashboardStats() {
        viewModelScope.launch {
            val progResult = programRepository.getPrograms()
            val progList = progResult.data ?: emptyList()
            val totalPrograms = progList.size
            val activePrograms = progList.count { it.status == Program.STATUS_PUBLISHED }

            val allRegs = RegistrationRepository.localRegistrations
            val totalRegs = allRegs.count { it.status == Registration.STATUS_CONFIRMED }
            val attended = allRegs.count { it.attendanceStatus == Registration.ATTENDANCE_PRESENT }
            val absent = allRegs.count { it.attendanceStatus == Registration.ATTENDANCE_ABSENT }

            _dashboardStats.value = DashboardStats(
                totalPrograms = totalPrograms,
                activePrograms = activePrograms,
                totalRegistrations = totalRegs,
                totalAttended = attended,
                totalAbsent = absent
            )
        }
    }

    fun loadPrograms(query: String? = null, category: String? = null) {
        _programs.value = Resource.Loading()
        viewModelScope.launch {
            _programs.value = programRepository.getPrograms(
                categoryFilter = category,
                query = query,
                forResidentOnly = false
            )
        }
    }

    fun loadParticipants(programId: String) {
        val list = registrationRepository.getRegistrationsForProgram(programId)
        _participants.value = list
    }

    fun updateAttendance(registrationId: String, newStatus: String, programId: String) {
        viewModelScope.launch {
            val result = registrationRepository.updateAttendance(registrationId, newStatus)
            _attendanceUpdateState.value = result
            if (result is Resource.Success) {
                loadParticipants(programId)
                loadDashboardStats()
            }
        }
    }

    fun saveProgram(program: Program) {
        _saveProgramState.value = Resource.Loading()
        viewModelScope.launch {
            val res = programRepository.saveProgram(program)
            _saveProgramState.value = res
            if (res is Resource.Success) {
                loadPrograms()
                loadDashboardStats()
            }
        }
    }

    fun updateProgramStatus(programId: String, newStatus: String) {
        _statusChangeState.value = Resource.Loading()
        viewModelScope.launch {
            val res = programRepository.updateProgramStatus(programId, newStatus)
            _statusChangeState.value = res
            if (res is Resource.Success) {
                loadPrograms()
                loadDashboardStats()
            }
        }
    }

    fun loadAnnouncements() {
        _announcements.value = Resource.Loading()
        viewModelScope.launch {
            _announcements.value = announcementRepository.getAnnouncements()
        }
    }

    fun publishAnnouncement(announcement: Announcement) {
        _publishAnnouncementState.value = Resource.Loading()
        viewModelScope.launch {
            val res = announcementRepository.publishAnnouncement(announcement)
            _publishAnnouncementState.value = res
            if (res is Resource.Success) {
                loadAnnouncements()
            }
        }
    }

    fun clearStates() {
        _saveProgramState.value = null
        _statusChangeState.value = null
        _attendanceUpdateState.value = null
        _publishAnnouncementState.value = null
    }
}
