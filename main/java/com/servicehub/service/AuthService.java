package com.servicehub.service;

import com.servicehub.dto.AuthDTOs;
import com.servicehub.entity.ServiceCategory;
import com.servicehub.entity.ServiceProvider;
import com.servicehub.entity.User;
import com.servicehub.exception.BadRequestException;
import com.servicehub.repository.ServiceCategoryRepository;
import com.servicehub.repository.ServiceProviderRepository;
import com.servicehub.repository.UserRepository;
import com.servicehub.security.JwtUtils;
import com.servicehub.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return new AuthDTOs.AuthResponse(accessToken, refreshToken, user.getId(),
                user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public AuthDTOs.AuthResponse registerUser(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.USER)
                .build();
        userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);
        return new AuthDTOs.AuthResponse(accessToken, refreshToken, user.getId(),
                user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public AuthDTOs.AuthResponse registerProvider(AuthDTOs.RegisterProviderRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.PROVIDER)
                .status(User.AccountStatus.PENDING_APPROVAL)
                .build();

        userRepository.save(user);

        List<ServiceCategory> categories = categoryRepository.findAllById(
                request.getServiceCategoryIds() != null ? request.getServiceCategoryIds() : List.of()
        );

        ServiceProvider provider = ServiceProvider.builder()
                .user(user)
                .description(request.getDescription())
                .city(request.getCity())   // ✅ FIXED LINE
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .hourlyRate(request.getHourlyRate() != null ? request.getHourlyRate() : 0.0)
                .credentialInfo(request.getCredentialInfo())
                .serviceCategories(categories)
                .approvalStatus(ServiceProvider.ApprovalStatus.PENDING)
                .build();

        providerRepository.save(provider);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return new AuthDTOs.AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

}
