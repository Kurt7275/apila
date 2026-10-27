package com.lapasan.apila.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapasan.apila.data.model.User
import com.lapasan.apila.data.repository.AuthRepository
import com.lapasan.apila.util.Resource
import kotlinx.coroutines.launch

class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _loginState = MutableLiveData<Resource<User>>()
    val loginState: LiveData<Resource<User>> = _loginState

    private val _registerState = MutableLiveData<Resource<User>>()
    val registerState: LiveData<Resource<User>> = _registerState

    private val _updateProfileState = MutableLiveData<Resource<User>>()
    val updateProfileState: LiveData<Resource<User>> = _updateProfileState

    private val _currentUser = MutableLiveData<User?>()
    val currentUser: LiveData<User?> = _currentUser

    init {
        _currentUser.value = authRepository.getCurrentUser()
    }

    fun login(email: String, pass: String) {
        _loginState.value = Resource.Loading()
        viewModelScope.launch {
            val result = authRepository.login(email, pass)
            if (result is Resource.Success) {
                _currentUser.value = result.data
            }
            _loginState.value = result
        }
    }

    fun register(
        fullName: String,
        email: String,
        pass: String,
        phone: String,
        purok: String,
        address: String,
        gender: String,
        birthdate: String
    ) {
        _registerState.value = Resource.Loading()
        viewModelScope.launch {
            val result = authRepository.registerResident(
                fullName = fullName,
                email = email,
                pass = pass,
                phone = phone,
                purok = purok,
                address = address,
                gender = gender,
                birthdate = birthdate
            )
            if (result is Resource.Success) {
                _currentUser.value = result.data
            }
            _registerState.value = result
        }
    }

    fun updateProfile(
        fullName: String,
        phone: String,
        purok: String,
        address: String,
        gender: String,
        birthdate: String
    ) {
        val uid = _currentUser.value?.uid ?: return
        _updateProfileState.value = Resource.Loading()
        viewModelScope.launch {
            val result = authRepository.updateUserProfile(
                uid = uid,
                fullName = fullName,
                phone = phone,
                purok = purok,
                address = address,
                gender = gender,
                birthdate = birthdate
            )
            if (result is Resource.Success) {
                _currentUser.value = result.data
            }
            _updateProfileState.value = result
        }
    }

    fun refreshProfile() {
        val uid = _currentUser.value?.uid ?: return
        viewModelScope.launch {
            val updated = authRepository.refreshUserProfile(uid)
            if (updated != null) {
                _currentUser.value = updated
            }
        }
    }

    fun switchDemoRole(asAdmin: Boolean) {
        val user = authRepository.switchRoleForDemo(asAdmin)
        _currentUser.value = user
        _loginState.value = Resource.Success(user)
    }

    fun logout() {
        authRepository.logout()
        _currentUser.value = null
    }
}
