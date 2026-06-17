package com.competency.tracker.service;

import com.competency.tracker.dto.LoginRequest;
import com.competency.tracker.dto.SignUpRequest;
import com.competency.tracker.dto.UserResponse;
import com.competency.tracker.model.AppUser;
import com.competency.tracker.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse signUp(SignUpRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }

        AppUser user = new AppUser();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());

        if ("student".equals(req.getRole())) {
            user.setProgram(req.getProgram());
            user.setUniversity(req.getUniversity());
            user.setGraduationYear(req.getGraduationYear());
        } else {
            user.setCompany(req.getCompany());
            user.setTitle(req.getTitle());
        }

        AppUser saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    public UserResponse login(LoginRequest req) {
        AppUser user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password.");
        }

        return UserResponse.from(user);
    }
}
