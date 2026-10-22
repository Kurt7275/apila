package com.lapasan.apila.ui.resident

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapasan.apila.data.model.Announcement
import com.lapasan.apila.data.model.Program
import com.lapasan.apila.data.model.Registration
import com.lapasan.apila.data.model.User
import com.lapasan.apila.data.repository.AnnouncementRepository
import com.lapasan.apila.data.repository.AuthRepository
import com.lapasan.apila.data.repository.ProgramRepository
import com.lapasan.apila.data.repository.RegistrationRepository
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.launch

class ResidentViewModel(
    private val programRepository: ProgramRepository = ProgramRepository(),
    private val registrationRepository: RegistrationRepository = RegistrationRepository(),
    private val announcementRepository: AnnouncementRepository = AnnouncementRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _programs = MutableLiveData<Resource<List<Program>>>()
    val programs: LiveData<Resource<List<Program>>> = _programs

    private val _activeRegistrations = MutableLiveData<List<Registration>>()
    val activeRegistrations: LiveData<List<Registration>> = _activeRegistrations

    private val _historyRegistrations = MutableLiveData<List<Registration>>()
    val historyRegistrations: LiveData<List<Registration>> = _historyRegistrations

    private val _announcements = MutableLiveData<Resource<List<Announcement>>>()
    val announcements: LiveData<Resource<List<Announcement>>> = _announcements

    private val _registrationAction = MutableLiveData<Resource<Registration>?>()
    val registrationAction: LiveData<Resource<Registration>?> = _registrationAction

    private val _cancelAction = MutableLiveData<Resource<Boolean>?>()
    val cancelAction: LiveData<Resource<Boolean>?> = _cancelAction

    val currentUser: User?
        get() = authRepository.getCurrentUser()

    fun loadPrograms(
        categoryFilter: String? = null,
        query: String? = null,
        onlyOpen: Boolean = false
    ) {
        _programs.value = Resource.Loading()
        viewModelScope.launch {
            val result = programRepository.getPrograms(
                categoryFilter = categoryFilter,
                query = query,
                onlyOpen = onlyOpen,
                forResidentOnly = true
            )
            _programs.value = result
        }
    }

    fun loadMyPrograms() {
        val user = currentUser ?: return
        viewModelScope.launch {
            registrationRepository.fetchUserRegistrations(user.uid)
            val list = registrationRepository.getActiveRegistrations(user.uid)
            _activeRegistrations.value = list
        }
    }

    fun loadHistory() {
        val user = currentUser ?: return
        viewModelScope.launch {
            registrationRepository.fetchUserRegistrations(user.uid)
            val list = registrationRepository.getRegistrationHistory(user.uid)
            _historyRegistrations.value = list
        }
    }

    fun loadAnnouncements() {
        _announcements.value = Resource.Loading()
        viewModelScope.launch {
            _announcements.value = announcementRepository.getAnnouncements()
        }
    }

    fun registerForProgram(program: Program) {
        val user = currentUser
        if (user == null) {
            _registrationAction.value = Resource.Error("Please log in to register.")
            return
        }
        _registrationAction.value = Resource.Loading()
        viewModelScope.launch {
            val result = registrationRepository.registerForProgram(program, user)
            _registrationAction.value = result
            if (result is Resource.Success) {
                loadPrograms()
                loadMyPrograms()
            }
        }
    }

    fun cancelRegistration(registrationId: String) {
        _cancelAction.value = Resource.Loading()
        viewModelScope.launch {
            val result = registrationRepository.cancelRegistration(registrationId)
            _cancelAction.value = result
            if (result is Resource.Success) {
                loadPrograms()
                loadMyPrograms()
                loadHistory()
            }
        }
    }

    fun isRegistered(programId: String): Boolean {
        val uid = currentUser?.uid ?: return false
        return registrationRepository.isUserRegistered(programId, uid)
    }

    fun getRegistration(programId: String): Registration? {
        val uid = currentUser?.uid ?: return null
        return registrationRepository.getRegistration(programId, uid)
    }

    fun clearActionState() {
        _registrationAction.value = null
        _cancelAction.value = null
    }
}
